window.onload = () => {
    setupWebGL();

    initVertices();
    initColors();
    initMatrices();

    render();
}

const setupWebGL = () => {
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
        return;
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);

    program = initShaders(gl, "vshader.glsl", "fshader.glsl");
    gl.useProgram(program);
}

const initVertices = () => {
    vertices = [
        vec3(-0.5, -0.5, 0.5),
        vec3(-0.5, 0.5, 0.5),
        vec3(0.5, 0.5, 0.5),
        vec3(0.5, -0.5, 0.5),
        vec3(-0.5, -0.5, -0.5),
        vec3(-0.5, 0.5, -0.5),
        vec3(0.5, 0.5, -0.5),
        vec3(0.5, -0.5, -0.5)
    ];

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    indices = [
        1, 0, 3,
        3, 2, 1,
        2, 3, 7,
        7, 6, 2,
        3, 0, 4,
        4, 7, 3,
        6, 5, 1,
        1, 2, 6,
        4, 5, 6,
        6, 7, 4,
        5, 4, 0,
        0, 1, 5
    ];

    var iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);
}

const initColors = () => {
    var colors = [
        [0.0, 0.0, 0.0, 1.0],
        [1.0, 0.0, 0.0, 1.0],
        [1.0, 1.0, 0.0, 1.0],
        [0.0, 1.0, 0.0, 1.0],
        [0.0, 0.0, 1.0, 1.0],
        [1.0, 0.0, 1.0, 1.0],
        [1.0, 1.0, 1.0, 1.0],
        [0.0, 1.0, 1.0, 1.0]
    ];

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);
}

const initMatrices = () => {
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

    var projectionMatrix = perspective(45, canvas.width / canvas.height, .001, 10.0);
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
}

const render = () => {
    gl.clear(gl.COLOR_BUFFER_BIT);

    var ctm = mat4();
    
    // Cube 1 - One-point perspective (front view)
    ctm = mult(ctm, translate(-1.5, 0, -3));
    drawCube(ctm);

    // Cube 2 - Two-point perspective (X-axis rotated)
    ctm = mat4();
    ctm = mult(ctm, translate(0, 0, -3));
    ctm = mult(ctm, rotateY(30));
    drawCube(ctm);

    // Cube 3 - Three-point perspective (X, Y, and Z rotated)
    ctm = mat4();
    ctm = mult(ctm, translate(1.5, 0, -3));
    ctm = mult(ctm, rotateX(20));
    ctm = mult(ctm, rotateY(30));
    ctm = mult(ctm, rotateZ(20));
    drawCube(ctm);

    requestAnimFrame(render);
}

const drawCube = (ctm) => {
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(ctm));
    gl.drawElements(gl.LINE_STRIP, indices.length, gl.UNSIGNED_BYTE, 0);
}