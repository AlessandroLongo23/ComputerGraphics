window.onload = () => {
    if (!setupWebGL()) 
        return;

    configureWebGL();

    initUniforms();
    initCubeMap();
    
    initBackgroundQuad();
    initSphere();
    
    render();
};

const setupWebGL = () => {
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

const configureWebGL = () => {
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.FRONT);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
}

const initUniforms = () => {
    viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix");
    modelMatrixLoc = gl.getUniformLocation(program, "modelMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    texMatrixLoc = gl.getUniformLocation(program, "texMatrix");

    eyeLoc = gl.getUniformLocation(program, "eye");
    reflectiveLoc = gl.getUniformLocation(program, "reflective");
}

const initCubeMap = () => {
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
        gl.texImage2D(face.target, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));

        const image = new Image();
        image.onload = () => {
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

const initBackgroundQuad = () => {
    const backgroundVertices = [
        vec4(-1.0, -1.0, 0.999, 1.0),
        vec4(1.0, 1.0, 0.999, 1.0),
        vec4(1.0, -1.0, 0.999, 1.0),
        vec4(-1.0, -1.0, 0.999, 1.0),
        vec4(-1.0, 1.0, 0.999, 1.0),
        vec4(1.0, 1.0, 0.999, 1.0),
    ];

    backgroundBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, backgroundBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(backgroundVertices), gl.STATIC_DRAW);
}

const initSphere = () => {
    sphereVertices = [];
    sphereNormals = [];

    thetaY = 0;

    const v0 = vec4(0.0, 0.0, -1.0, 1);
    const v1 = vec4(0.0, 0.942809, 0.333333, 1);
    const v2 = vec4(-0.816497, -0.471405, 0.333333, 1);
    const v3 = vec4(0.816497, -0.471405, 0.333333, 1);

    tetrahedron(v0, v1, v2, v3, 9);

    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(sphereVertices), gl.STATIC_DRAW);
    
    normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(sphereNormals), gl.STATIC_DRAW);
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

    const ab = normalize(mix(a, b, 0.5), true);
    const ac = normalize(mix(a, c, 0.5), true);
    const bc = normalize(mix(b, c, 0.5), true);

    divideTriangle(a, ab, ac, count - 1);
    divideTriangle(ab, b, bc, count - 1);
    divideTriangle(bc, c, ac, count - 1);
    divideTriangle(ab, bc, ac, count - 1);
}

const triangle = (a, b, c) => {
    sphereVertices.push(a);
    sphereNormals.push(a);
    sphereVertices.push(b);
    sphereNormals.push(b);
    sphereVertices.push(c);
    sphereNormals.push(c);
}

const render = () => {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    thetaY += 0.001;

    projectionMatrix = perspective(45, canvas.width / canvas.height, 0.1, 100.0);
    const dist = 5.0;
    const eye = vec3(dist * Math.cos(thetaY), 0.0, dist * Math.sin(thetaY));
    const at = vec3(0.0, 0.0, 0.0);
    const up = vec3(0.0, 1.0, 0.0);
    viewMatrix = lookAt(eye, at, up);
    modelMatrix = mat4();

    gl.uniform3fv(eyeLoc, eye);

    drawBackground();
    drawSphere();
    
    requestAnimationFrame(render);
}

const drawBackground = () => {
    gl.bindBuffer(gl.ARRAY_BUFFER, backgroundBuffer);
    const vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(mat4()));
    gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(mat4()));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(mat4()));
    
    const texMatrix = mult(inverse(viewMatrix), inverse(projectionMatrix));
    gl.uniformMatrix4fv(texMatrixLoc, false, flatten(texMatrix));
    
    gl.uniform1i(reflectiveLoc, false);
    
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

const drawSphere = () => {
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    const vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    const vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);
    
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(viewMatrix));
    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
    gl.uniformMatrix4fv(texMatrixLoc, false, flatten(mat4()));
    
    gl.uniform1i(reflectiveLoc, true);

    gl.drawArrays(gl.TRIANGLES, 0, sphereVertices.length);
}