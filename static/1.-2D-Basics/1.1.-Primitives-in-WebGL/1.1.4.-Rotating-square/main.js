window.onload = () => {
    setupWebGL();

    initAngle();
    initVertices();

    render();
}

const setupWebGL = () => {
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);

    program = initShaders(gl, "vshader.glsl", "fshader.glsl");
    gl.useProgram(program);
}

const initAngle = () => {
    theta = 0.0;
    thetaLoc = gl.getUniformLocation(program, "theta");
}

const updateAngle = () => {
    theta += 0.025;
    gl.uniform1f(thetaLoc, theta);
}

const initVertices = () => {
    vertices = [ 
        vec2(-0.5, 0.5), 
        vec2(0.5, 0.5), 
        vec2(-0.5, -0.5), 
        vec2(0.5, -0.5) 
    ];

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
}

const render = () => {
    gl.clear(gl.COLOR_BUFFER_BIT);

    updateAngle();
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertices.length);

    requestAnimFrame(render);
}