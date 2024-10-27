"use strict";

var font = "Arial,sans-serif";

window.onload = function init()
{
  // Create canvases for WebGL and text textures
  var canvas = document.getElementById("webgl");
  var text = document.getElementById('text');
  if (!canvas || !text) {
    console.log('Failed to retrieve a <canvas> element.');
    return;
  }
  var gl = WebGLUtils.setupWebGL(canvas, { alpha: false });
  var textctx = text.getContext('2d');
  if (!gl || !textctx) {
    console.log("WebGL is not available.");
    return;
  }

  // Init WebGL
  gl.clearColor(0.6, 0.85, 0.95, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  gl.program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(gl.program);
  gl.uniform1f(gl.getUniformLocation(gl.program, "texOffset"), 0.0);

  initGeometry(gl);
  var texttex = initTextTexture(gl);

  // Init sound effects
  var clickSound = new sound("sounds/click.mp3");
  var rollSound = new sound("sounds/roll-die.mp3");

  // Init game state and animations
  var die = 5;
  var init_done = false;
  var init_roll = true;
  var roll_die = false;
  var end_roll = false;
  var angle = 720.0;
  var angle_velocity = -20.0;
  var new_die = Math.floor(Math.random()*6 + 1);
  var M = mat4();
  var time0;
  function tick(timestamp)
  {
    if(init_roll && !roll_die)
    {
      time0 = timestamp;
      if(time0)
        roll_die = true;
    }
    if(!init_done || roll_die)
    {
      init_done = true;

      // Animation time
      var t = timestamp - time0;

      // Die animation
      if(init_roll && t > 833.3)
      {
        init_roll = false;
        rollSound.play();
        t = 0.0;
      }
      if(roll_die && !init_roll)
      {
        time0 = timestamp;
        angle += angle_velocity*t/16.7;
        var ax = angle, ay = angle, az = 0.0;
        M = mult(rotateY(ay), rotateX(ax));
        if(angle <= 120.0)
        {
          angle_velocity += 2.0*t/16.7;
          angle_velocity = Math.min(angle_velocity, -2.0);
          end_roll = true;
          var d_ax = dieAngles[3*(die - 1)];
          var d_ay = dieAngles[3*(die - 1) + 1];
          var d_az = dieAngles[3*(die - 1) + 2];
          var n_d_ax = dieAngles[3*(new_die - 1)];
          var n_d_ay = dieAngles[3*(new_die - 1) + 1];
          var n_d_az = dieAngles[3*(new_die - 1) + 2];
          var c = angle/120.0;
          ax = d_ax*c + n_d_ax*(1.0 - c);
          ay = d_ay*c + n_d_ay*(1.0 - c);
          az = d_az*c + n_d_az*(1.0 - c);
          M = mult(M, mult(rotateZ(az), mult(rotateY(ay), rotateX(ax))));
          render(gl, canvas.width, canvas.height, M, 1);
        }
        if(angle <= 0.0) {
          M = mat4();
          die = new_die;
          roll_die = false;
          end_roll = false;
        }
      }

      // Render unless another render call was used
      if(!end_roll)
        render(gl, canvas.width, canvas.height, M, die);
    }
    if(init_roll || roll_die)
      requestAnimationFrame(tick);
  }
  tick();

  // Handle window resizing
  function resize()
  {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
    var fontsize = Math.ceil(canvas.height*0.1);
    makeTextTexture(gl, textctx, texttex, '0123456789',
      fontsize + 'px ' + font, '#000000', '#FFFFFF', fontsize*125.0/9.0, fontsize*8.0/3.0);
    if(init_done)
      render(gl, canvas.width, canvas.height, M, die);
  }
  window.addEventListener('resize', resize);
  resize();

  // Handle click events and selection
  canvas.addEventListener('click', function (ev)
  {
    if(!roll_die)
    {
      clickSound.play();
      angle = 720.0;
      new_die = Math.floor(Math.random()*6 + 1);
      init_roll = true;
      angle_velocity = -20.0;
      requestAnimFrame(tick);
    }
  });
}

// WebGL render function
function render(gl, width, height, M, die)
{
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  drawDie(gl, width, height, M, die);
}

// Die data
var diePos = translate(0.0, 0.0, -9.0);

var dieAngles = [
  0.0, 0.0, 0.0,
  180.0, 90.0, 0.0,
  -90.0, 0.0, -90.0,
  90.0, 0.0, 90.0,
  0.0, -90.0, 0.0,
  0.0, 180.0, 0.0
];

var dieColor = [
  vec4(1.0, 0.0, 0.0, 0.7), // red 5
  vec4(1.0, 1.0, 0.0, 0.7), // yellow 2
  vec4(1.0, 0.0, 1.0, 0.7), // magenta 4
  vec4(0.0, 0.0, 1.0, 0.7), // blue 3
  vec4(0.0, 1.0, 1.0, 0.7), // turquoise 6
  vec4(0.0, 1.0, 0.0, 0.7)  // green 1
];

// WebGL draw function
function drawDie(gl, width, height, M, die)
{
  var pixels = Math.min(width*0.2, height*0.2);
  var P = perspective(12.0, 1.0, 0.1, 50.0);
  var R = rotateX(dieAngles[3*(die - 1)]);
  R = mult(rotateY(dieAngles[3*(die - 1) + 1]), R);
  R = mult(rotateZ(dieAngles[3*(die - 1) + 2]), R);
  M = mult(M, R);
  M = mult(diePos, M);
  gl.uniform1i(gl.getUniformLocation(gl.program, "texMap"), 2);
  gl.uniformMatrix4fv(gl.getUniformLocation(gl.program, "P"), false, flatten(P));
  gl.uniformMatrix4fv(gl.getUniformLocation(gl.program, "M"), false, flatten(M));
  gl.viewport(width*0.213, 0.8*height - 1.1*pixels, pixels, pixels);
  var z = vec3(M[2][0], M[2][1], M[2][2]);
  var neg_z = vec3(-Math.abs(M[2][0]), -Math.abs(M[2][1]), -Math.abs(M[2][2]));
  var c = vec3(0, 0, 0);
  var idx;
  for(var i = 0 ; i < 6; ++i) {
    var min_z = Math.min(Math.min(neg_z[0], neg_z[1]), neg_z[2]);
    switch(min_z) {
      case neg_z[0]: idx = 0 + (z[0] < 1e-5); z[0] = -z[0] + 1e-4; neg_z[0] = -neg_z[0]; if(++c[0] > 1) neg_z[0] = 100.0; break;
      case neg_z[1]: idx = 2 + (z[1] < 1e-5); z[1] = -z[1] + 1e-4; neg_z[1] = -neg_z[1]; if(++c[1] > 1) neg_z[1] = 100.0; break;
      case neg_z[2]: idx = 4 + (z[2] < 1e-5); z[2] = -z[2] + 1e-4; neg_z[2] = -neg_z[2]; if(++c[2] > 1) neg_z[2] = 100.0; break;
    }
    gl.uniform4fv(gl.getUniformLocation(gl.program, "color"), flatten(dieColor[idx]));
    gl.drawArrays(gl.TRIANGLE_STRIP, idx*4, 4);
  }
}

// WebGL init functions

function initGeometry(gl)
{
  var vertices = [
      vec3(-0.5, -0.5, -0.5),   // cube left
      vec3(-0.5, -0.5, 0.5),
      vec3(-0.5, 0.5, -0.5),
      vec3(-0.5, 0.5, 0.5),
      vec3(0.5, -0.5, -0.5),    // cube right
      vec3(0.5, -0.5, 0.5),
      vec3(0.5, 0.5, -0.5),
      vec3(0.5, 0.5, 0.5),
      vec3(-0.5, -0.5, -0.5),   // cube bottom
      vec3(-0.5, -0.5, 0.5),
      vec3(0.5, -0.5, -0.5),
      vec3(0.5, -0.5, 0.5),
      vec3(-0.5, 0.5, -0.5),    // cube top
      vec3(-0.5, 0.5, 0.5),
      vec3(0.5, 0.5, -0.5),
      vec3(0.5, 0.5, 0.5),
      vec3(-0.5, -0.5, -0.5),   // cube back
      vec3(0.5, -0.5, -0.5),
      vec3(-0.5, 0.5, -0.5),
      vec3(0.5, 0.5, -0.5),
      vec3(-0.5, -0.5, 0.5),    // cube front
      vec3(0.5, -0.5, 0.5),
      vec3(-0.5, 0.5, 0.5),
      vec3(0.5, 0.5, 0.5),
  ];
  var texcoords = [
      vec2(0.5, 0.5),   // cube left (5)
      vec2(0.6, 0.5),
      vec2(0.5, 1.0),
      vec2(0.6, 1.0),
      vec2(0.2, 1.0),   // cube right (2)
      vec2(0.3, 1.0),
      vec2(0.2, 0.5),
      vec2(0.3, 0.5),
      vec2(0.4, 1.0),   // cube bottom (4)
      vec2(0.5, 1.0),
      vec2(0.4, 0.5),
      vec2(0.5, 0.5),
      vec2(0.3, 0.5),   // cube top (3)
      vec2(0.4, 0.5),
      vec2(0.3, 1.0),
      vec2(0.4, 1.0),
      vec2(0.7, 0.5),   // cube back (6)
      vec2(0.6, 0.5),
      vec2(0.7, 1.0),
      vec2(0.6, 1.0),
      vec2(0.1, 0.5),   // cube front (1)
      vec2(0.2, 0.5),
      vec2(0.1, 1.0),
      vec2(0.2, 1.0),
  ];

  var texcoordsfv = flatten(texcoords);
  var FSIZE = texcoordsfv.BYTES_PER_ELEMENT;
  var tBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, FSIZE*2*vertices.length, gl.STATIC_DRAW);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, texcoordsfv);

  var vTexCoord = gl.getAttribLocation(gl.program, "vTexCoord");
  gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vTexCoord);

  var vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

  var vPosition = gl.getAttribLocation(gl.program, "vPosition");
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  return vertices.length;
}

// Using HTML5 2D canvas for rendering text to WebGL texture

function makeTextCanvas(textctx, text, font, color, boldcolor, width, height)
{
  textctx.canvas.width = width;
  textctx.canvas.height = height;
  textctx.textAlign = "center";
  textctx.textBaseline = "middle";
  textctx.font = font;
  textctx.fillStyle = color;
  textctx.clearRect(0, 0, width, height);
  for(var i = 0; i < text.length; ++i)
    textctx.fillText(text[i], (i + 0.5)*width/text.length, height*0.75);
  textctx.font = "bold " + font;
  textctx.fillStyle = boldcolor;
  for(var i = 0; i < text.length; ++i)
    textctx.fillText(text[i], (i + 0.5)*width/text.length, height*0.25);
  return textctx.canvas;
}

function initTextTexture(gl)
{
  var texttex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texttex);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return texttex;
}

function makeTextTexture(gl, textctx, texttex, text, font, color, boldcolor, width, height)
{
  gl.activeTexture(gl.TEXTURE2);
  var textcanvas = makeTextCanvas(textctx, text, font, color, boldcolor, width, height);
  gl.bindTexture(gl.TEXTURE_2D, texttex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textcanvas);
  gl.activeTexture(gl.TEXTURE0);
  return texttex;
}

// Code for playing sound effects

function sound(src)
{
  this.sound = document.createElement("audio");
  this.sound.src = src;
  this.sound.setAttribute("preload", "auto");
  this.sound.setAttribute("controls", "none");
  this.sound.style.display = "none";
  document.body.appendChild(this.sound);
  this.play = function ()
  {
    var playPromise = this.sound.play();

    if (playPromise !== undefined) {
      playPromise.then(_ => {
        // Automatic playback started!
        // Show playing UI.
      })
      .catch(error => {
        // Auto-play was prevented
        // Show paused UI.
      });
    }
  }
  this.stop = function ()
  {
    this.sound.pause();
  }
  this.load = function ()
  {
    this.sound.load();
  }
}