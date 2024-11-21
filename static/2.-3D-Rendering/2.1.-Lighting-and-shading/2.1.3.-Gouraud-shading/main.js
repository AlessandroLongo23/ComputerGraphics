window.onload = () => {
    setupWebGL();

    baseVertices = [
        vec4(0.0, 0.0, -1.0, 1), 
        vec4(0.0, 0.942809, 0.333333, 1),
        vec4(-0.816497, -0.471405, 0.333333, 1),
        vec4(0.816497, -0.471405, 0.333333, 1)
    ];
    
    subdivisions = 1;
    
    initMatrices();
    initDirectionalLight();
    buildPolyhedron();

    render();
};

const setupWebGL = () => {
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
        return;
    }

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.FRONT);

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);

    program = initShaders(gl, "vshader.glsl", "fshader.glsl");
    gl.useProgram(program);
}

const initDirectionalLight = () => {
    lightDirection = vec3(0.0, 0.0, -1.0);
    lightDirectionLoc = gl.getUniformLocation(program, "lightDirection");
    gl.uniform3fv(lightDirectionLoc, flatten(lightDirection));
}

const initMatrices = () => {
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    projectionMatrix = perspective(45, canvas.width / canvas.height, .001, 10.0);
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix");
    dist = 4.0;
    thetaY = 30;
    eye = vec3(dist * Math.cos(thetaY), 0.0, dist * Math.sin(thetaY));
    at = vec3(0.0, 0.0, 0.0);
    up = vec3(0.0, 1.0, 0.0);
    viewMatrix = lookAt(eye, at, up);
    gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(viewMatrix));

    modelMatrixLoc = gl.getUniformLocation(program, "modelMatrix");
    modelMatrix = mat4();
    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
};

const buildPolyhedron = () => {
    vertices = [];
    tetrahedron(baseVertices[0], baseVertices[1], baseVertices[2], baseVertices[3], subdivisions);

    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
}

const tetrahedron = (a, b, c, d, n) => {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}

const divideTriangle = (a, b, c, count) => {
    if (count === 0) {
        triangle(a, b, c);
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

const triangle = (a, b, c) => {
    vertices.push(a);
    vertices.push(b);
    vertices.push(c);
}

const render = () => {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    updateCamera();
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length);
    
    requestAnimFrame(render);
}

const updateCamera = () => {
    thetaY += 0.005;
    eye = vec3(dist * Math.cos(thetaY), 0.0, dist * Math.sin(thetaY));
    viewMatrix = lookAt(eye, at, up);
    gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(viewMatrix));
};

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