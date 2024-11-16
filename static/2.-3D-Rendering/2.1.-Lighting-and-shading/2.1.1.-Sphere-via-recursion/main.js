window.onload = () => {
    setupWebGL();

    baseVertices = [
        vec4(0.0, 0.0, -1.0, 1), 
        vec4(0.0, 0.942809, 0.333333, 1),
        vec4(-0.816497, -0.471405, 0.333333, 1),
        vec4(0.816497, -0.471405, 0.333333, 1)
    ]

    baseColors = [
        vec3(1.0, 0.0, 0.0),
        vec3(0.0, 1.0, 0.0),
        vec3(0.0, 0.0, 1.0),
        vec3(0.0, 0.0, 0.0)
    ];
    
    subdivisions = 1;
    thetaY = 30;
    
    buildPolyhedron();

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

    render();
};

const render = () => {
    gl.clear(gl.COLOR_BUFFER_BIT);

    var projectionMatrix = perspective(45, canvas.width / canvas.height, .001, 10.0);
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    
    thetaY += 0.025;
    
    var ctm = mat4();
    ctm = mult(ctm, translate(0, 0, -3));
    ctm = mult(ctm, rotateY(thetaY));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(ctm));

    gl.drawArrays(gl.TRIANGLES, 0, vertices.length);

    requestAnimFrame(render);
}

const buildPolyhedron = () => {
    vertices = [];
    colors = [];
    tetrahedron(baseVertices[0], baseVertices[1], baseVertices[2], baseVertices[3], subdivisions);

    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);
}

const tetrahedron = (a, b, c, d, n) => {
    divideTriangle(a, b, c, n, 0);
    divideTriangle(d, c, b, n, 1);
    divideTriangle(a, d, b, n, 2);
    divideTriangle(a, c, d, n, 3);
}

const divideTriangle = (a, b, c, count, colorIndex) => {
    if (count == 0) {
        triangle(a, b, c, colorIndex);
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

const triangle = (a, b, c, colorIndex) => {
    colors.push(baseColors[colorIndex]);
    vertices.push(a);
    colors.push(baseColors[colorIndex]);
    vertices.push(b);
    colors.push(baseColors[colorIndex]);
    vertices.push(c);
}

document.getElementById("increment-subdivision-level").addEventListener("click", () => {
    if (subdivisions > 6)
        alert("Maximum subdivision level reached!");
    else
        subdivisions++;

    buildPolyhedron();
});

document.getElementById("decrement-subdivision-level").addEventListener("click", () => {
    if (subdivisions == 0)
        alert("subdivision level is already 0!");
    else
        subdivisions--;

    buildPolyhedron();
});

const setupWebGL = () => {
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