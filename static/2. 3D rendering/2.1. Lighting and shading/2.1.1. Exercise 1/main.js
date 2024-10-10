var vertices, vBuffer, baseColors, vertexColors, numTimesToSubdivide;
var v0, v1, v2, v3;
var theta_y = 30;

window.onload = function init() {
    // setting up the canvas, WebGL, and the shaders
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) 
        alert("WebGL isn’t available");

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);

    gl.enable(gl.DEPTH_TEST);

    program = initShaders(gl, "vshader.glsl", "fshader.glsl");
    gl.useProgram(program);

    // colors
    baseColors = [
        vec3(1.0, 0.0, 0.0),
        vec3(0.0, 1.0, 0.0),
        vec3(0.0, 0.0, 1.0),
        vec3(0.0, 0.0, 0.0)
    ];
    vertexColors = [];

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexColors), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);  // 4 components for RGBA
    gl.enableVertexAttribArray(vColor);

    // vertices
    v0 = vec4(0.0, 0.0, -1.0, 1); 
    v1 = vec4(0.0, 0.942809, 0.333333, 1);
    v2 = vec4(-0.816497, -0.471405, 0.333333, 1);
    v3 = vec4(0.816497, -0.471405, 0.333333, 1);
    numTimesToSubdivide = 1;
    
    build_polyhedron();

    // Initialize rotation and transformations
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

    render();
};

document.getElementById("increment-subdivision-level").addEventListener("click", function() {
    if (numTimesToSubdivide > 6)
        alert("Maximum subdivision level reached!");
    else
        numTimesToSubdivide++;

    build_polyhedron();
});

document.getElementById("decrement-subdivision-level").addEventListener("click", function() {
    if (numTimesToSubdivide == 0)
        alert("subdivision level is already 0!");
    else
        numTimesToSubdivide--;

    build_polyhedron();
});

function build_polyhedron() {
    vertices = [];
    tetrahedron(v0, v1, v2, v3, numTimesToSubdivide);

    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var ctm = mat4();
    var projectionMatrix = perspective(45, canvas.width / canvas.height, .001, 10.0);
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    theta_y += 0.025;

    ctm = mat4();
    ctm = mult(ctm, translate(0, 0, -3));
    ctm = mult(ctm, rotateY(theta_y));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(ctm));
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length);

    requestAnimFrame(render);
}

function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, n, 0);
    divideTriangle(d, c, b, n, 1);
    divideTriangle(a, d, b, n, 2);
    divideTriangle(a, c, d, n, 3);
}

function divideTriangle(a, b, c, count, color_index) {
    if (count == 0) {
        triangle(a, b, c, color_index);
        return;
    }

    var ab = normalize(mix(a, b, 0.5), true);
    var ac = normalize(mix(a, c, 0.5), true);
    var bc = normalize(mix(b, c, 0.5), true);

    divideTriangle(a, ab, ac, count - 1);
    divideTriangle(ab, b, bc, count - 1);
    divideTriangle(bc, c, ac, count - 1);
    divideTriangle(ab, bc, ac, count - 1);
}

function triangle(a, b, c, color_index) {
    vertexColors.push(baseColors[color_index]);
    vertices.push(a);
    vertexColors.push(baseColors[color_index]);
    vertices.push(b);
    vertexColors.push(baseColors[color_index]);
    vertices.push(c);
}