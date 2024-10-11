var indices, vertices;

window.onload = function init() {
    // vertices
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

    // colors
    var vertex_colors = [
        [0.0, 0.0, 0.0, 1.0],  // black
        [1.0, 0.0, 0.0, 1.0],  // red
        [1.0, 1.0, 0.0, 1.0],  // yellow
        [0.0, 1.0, 0.0, 1.0],  // green
        [0.0, 0.0, 1.0, 1.0],  // blue
        [1.0, 0.0, 1.0, 1.0],  // magenta
        [1.0, 1.0, 1.0, 1.0],  // white
        [0.0, 1.0, 1.0, 1.0]   // cyan
    ];

    var cBuffer = gl.createBuffer();  // Buffer for colors
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertex_colors), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);  // 4 components for RGBA
    gl.enableVertexAttribArray(vColor);

    // indices
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

    // Initialize rotation and transformations
    model_view_matrix_loc = gl.getUniformLocation(program, "model_view_matrix");
    projection_matrix_loc = gl.getUniformLocation(program, "projection_matrix");

    render();
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Cube 1 - One-point perspective (front view)
    var ctm = mat4();
    var projection_matrix = perspective(45, canvas.width / canvas.height, .001, 10.0);
    gl.uniformMatrix4fv(projection_matrix_loc, false, flatten(projection_matrix));

    ctm = mult(ctm, translate(-1.5, 0, -3));  // Move to the left
    gl.uniformMatrix4fv(model_view_matrix_loc, false, flatten(ctm));
    gl.drawElements(gl.LINE_STRIP, indices.length, gl.UNSIGNED_BYTE, 0);

    // Cube 2 - Two-point perspective (X-axis rotated)
    ctm = mat4();
    ctm = mult(ctm, translate(0, 0, -3));  // Centered
    ctm = mult(ctm, rotateY(30));  // Rotate around Y-axis
    gl.uniformMatrix4fv(model_view_matrix_loc, false, flatten(ctm));
    gl.drawElements(gl.LINE_STRIP, indices.length, gl.UNSIGNED_BYTE, 0);

    // Cube 3 - Three-point perspective (X, Y, and Z rotated)
    ctm = mat4();
    ctm = mult(ctm, translate(1.5, 0, -3));
    ctm = mult(ctm, rotateX(20));
    ctm = mult(ctm, rotateY(30));
    ctm = mult(ctm, rotateZ(20));
    gl.uniformMatrix4fv(model_view_matrix_loc, false, flatten(ctm));
    gl.drawElements(gl.LINE_STRIP, indices.length, gl.UNSIGNED_BYTE, 0);

    requestAnimFrame(render);
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