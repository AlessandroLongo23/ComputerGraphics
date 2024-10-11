window.onload = function init() {
    setup_WebGL();

    acc = vec2(0.0, -9.81);
    initBall();
    posLoc = gl.getUniformLocation(program, "pos");
    
    date = new Date;
    deltaTime = 0.0;
    t1 = date.getTime();
    damp = vec2(0.75, 0.5);
    air_friction = 0.99;
    rad_friction = 0.90;

    // vertices
    num = 100;
    rad = 0.5;
    vertices = [vec2(0, 0)];
    for (var angle = 0; angle <= Math.PI * 2; angle += Math.PI * 2 / num)
        vertices.push(vec2(rad * Math.cos(angle), rad * Math.sin(angle)));

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    render();
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    date = new Date;
    t2 = date.getTime();
    deltatime = (t2 - t1) * 0.001;
    t1 = t2;

    update();
    bounce();

    gl.uniform2f(posLoc, pos[0], pos[1]);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length);
    requestAnimFrame(render);
}

function update() {
    pos = add(pos, mult(vel, deltatime));
    if (Math.abs(pos[1] + 0.5) > 0.015 || Math.abs(vel[1]) > 0.015)
        vel = add(vel, mult(acc, deltatime));
    else { 
        pos[1] = -0.5;
        vel[1] = 0.0;
        vel[0] = vel[0] * rad_friction;
    }
    vel = mult(vel, air_friction);
}

function bounce() {
    // floor and ceiling
    if (pos[1] < -0.5 && vel[1] < 0.0) {
        vel[0] = vel[0] * rad_friction;
        vel[1] = -vel[1] * damp[1];
    } else if (pos[1] > 0.5 && vel[1] > 0.0) {
        vel[0] = vel[0] * rad_friction;
        vel[1] = -vel[1] * damp[1];
    }

    // lateral walls
    if (pos[0] > 0.5 || pos[0] < -0.5) {
        if (pos[0] > 0.5)
            pos[0] = 1.0 - pos[0];
        else
            pos[0] = -1.0 - pos[0];

        vel[0] = -vel[0] * damp[0];
    }
}

function initBall() {
    vel = mv.vec2(Math.random() * 20 - 10, Math.random() * 20 - 10);
    pos = mv.vec2(Math.random() - 0.5, Math.random() - 0.5);
}

function setup_WebGL() {
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn’t available");
        return;
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);

    program = initShaders(gl, "vshader.glsl", "fshader.glsl");
    gl.useProgram(program);
}