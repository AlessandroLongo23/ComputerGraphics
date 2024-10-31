window.onload = function init() {
    if (!setupWebGL()) return;

    configureWebGL();

    initializeUniforms();

    initCubeMap();

    initializeSphere();

    render();
};

function setupWebGL() {
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
        return false;
    }

    program = initShaders(gl, "vshader.glsl", "fshader.glsl");
    gl.useProgram(program);
    return true;
}

function configureWebGL() {
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.FRONT);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
}

function initializeUniforms() {
    viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix");
    modelMatrixLoc = gl.getUniformLocation(program, "modelMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    texMatrixLoc = gl.getUniformLocation(program, "texMatrix");
}

function initCubeMap() {
    const cubeTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeTexture);
    
    const faces = [
        { target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, url: '../cubemaps/brightday/posx.png' },
        { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, url: '../cubemaps/brightday/negx.png' },
        { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, url: '../cubemaps/brightday/posy.png' },
        { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, url: '../cubemaps/brightday/negy.png' },
        { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, url: '../cubemaps/brightday/posz.png' },
        { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, url: '../cubemaps/brightday/negz.png' }
    ];

    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    let loadedImages = 0;
    faces.forEach(face => {
        gl.texImage2D(face.target, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

        const image = new Image();
        image.onload = function() {
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeTexture);
            gl.texImage2D(face.target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            loadedImages++;
            
            if (loadedImages === 6)
                gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        };

        image.src = face.url;
    });

    const cubeMapLoc = gl.getUniformLocation(program, "cubeMap");
    gl.uniform1i(cubeMapLoc, 0);
}

function initializeSphere() {
    sphereVertices = [];
    sphereNormals = [];

    subdivisions = 6;
    thetaY = 0;

    const v0 = vec4(0.0, 0.0, -1.0, 1);
    const v1 = vec4(0.0, 0.942809, 0.333333, 1);
    const v2 = vec4(-0.816497, -0.471405, 0.333333, 1);
    const v3 = vec4(0.816497, -0.471405, 0.333333, 1);

    tetrahedron(v0, v1, v2, v3, subdivisions);

    setupBuffer(sphereVertices, 'vPosition', 4);
    setupBuffer(sphereNormals, 'vNormal', 4);
}

function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}

function divideTriangle(a, b, c, count) {
    if (count === 0) {
        triangle(a, b, c);
        return;
    }

    const ab = normalize(mix(a, b, 0.5), true);
    const ac = normalize(mix(a, c, 0.5), true);
    const bc = normalize(mix(b, c, 0.5), true);

    divideTriangle(a, ab, ac, count - 1);
    divideTriangle(ab, b, bc, count - 1);
    divideTriangle(bc, c, ac, count - 1);
    divideTriangle(ab, bc, ac, count - 1);
}

function triangle(a, b, c) {
    sphereVertices.push(a);
    sphereNormals.push(a);
    sphereVertices.push(b);
    sphereNormals.push(b);
    sphereVertices.push(c);
    sphereNormals.push(c);
}

function setupBuffer(data, attributeName, size) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(data), gl.STATIC_DRAW);
    
    const location = gl.getAttribLocation(program, attributeName);
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(location);
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    thetaY += 0.001;

    updateMatrices();

    gl.drawArrays(gl.TRIANGLES, 0, sphereVertices.length);
    
    requestAnimationFrame(render);
}

function updateMatrices() {
    const aspect = canvas.width / canvas.height;
    const projectionMatrix = perspective(45, aspect, 0.1, 100.0);

    const dist = 5.0;
    const eye = vec3(dist * Math.cos(thetaY), 0.0, dist * Math.sin(thetaY));
    const target = vec3(0.0, 0.0, 0.0);
    const up = vec3(0.0, 1.0, 0.0);
    const viewMatrix = lookAt(eye, target, up);

    const modelMatrix = mat4();

    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(viewMatrix));
    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
}