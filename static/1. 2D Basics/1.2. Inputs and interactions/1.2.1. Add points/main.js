window.onload = function init() {
    setup_WebGL();

    vertices = [ 
        vec2(0.0, 0.0), 
        vec2(1.0, 0.0), 
        vec2(1.0, 1.0)
    ];
    index = vertices.length;

    var max_points = 100;
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec2'] * max_points, gl.STATIC_DRAW);
    
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    canvas.addEventListener("click", function(event) {
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        var t = vec2(
            -1 + 2 * (event.clientX - canvas.getBoundingClientRect().x) / canvas.width, 
            -1 + 2 * (canvas.height - (event.clientY - canvas.getBoundingClientRect().y)) / canvas.height
        );
        var data = new Float32Array(t);
        
        if (index < max_points) {
            gl.bufferSubData(gl.ARRAY_BUFFER, sizeof['vec2'] * index, data);
            index++;
        } else {
            console.log("Max points reached!");
        }
    });

    render();
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, index);
    window.requestAnimFrame(render, canvas);
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