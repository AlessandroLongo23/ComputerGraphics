window.onload = function init() {
    if (!setupWebGL()) return;

    // Configure WebGL state
    configureWebGL();

    // Initialize shader uniforms
    initializeUniforms();

    // Initialize cube map instead of regular textures
    initCubeMap();

    // Initialize geometry
    initializeGeometry();

    // Start rendering
    render();
};

function configureWebGL() {
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.FRONT);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
}

function initCubeMap() {
    // Create and bind cube map texture
    const cubeTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);  // Use texture unit 0
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeTexture);
    
    // Define the six faces of the cube map
    const faces = [
        { target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, url: '../cubemaps/nvidia_cubemap/cm_left.png' },
        { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, url: '../cubemaps/nvidia_cubemap/cm_right.png' },
        { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, url: '../cubemaps/nvidia_cubemap/cm_top.png' },
        { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, url: '../cubemaps/nvidia_cubemap/cm_bottom.png' },
        { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, url: '../cubemaps/nvidia_cubemap/cm_front.png' },
        { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, url: '../cubemaps/nvidia_cubemap/cm_back.png' }
    ];

    // Set cube map texture parameters
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);

    // Load each face of the cube map
    let loadedImages = 0;
    faces.forEach(face => {
        // Set up temporary loading texture
        gl.texImage2D(face.target, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

        // Load the actual texture
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

    // Set the uniform in the shader
    const cubeMapLoc = gl.getUniformLocation(program, "cubeMap");
    gl.uniform1i(cubeMapLoc, 0);
}

function initializeUniforms() {
    // Store matrix locations
    viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix");
    modelMatrixLoc = gl.getUniformLocation(program, "modelMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
}

function initializeBackgroundQuad() {
    // vertices
    vertices = [
        vec4(-4.0, -1.0, -1.0, 1.0), 
        vec4(4.0, -1.0, -1.0, 1.0), 
        vec4(4.0, -1.0, -21.0, 1.0),
        vec4(-4.0, -1.0, -21.0, 1.0),
    ];
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
}

function initializeGeometry() {
    // Initialize vertices
    const v0 = vec4(0.0, 0.0, -1.0, 1);
    const v1 = vec4(0.0, 0.942809, 0.333333, 1);
    const v2 = vec4(-0.816497, -0.471405, 0.333333, 1);
    const v3 = vec4(0.816497, -0.471405, 0.333333, 1);

    vertices = [];
    normals = [];
    subdivisions = 6;
    thetaY = 0;

    // Build geometry
    tetrahedron(v0, v1, v2, v3, subdivisions);

    // Set up vertex buffer
    setupBuffer(vertices, 'vPosition', 4);
    setupBuffer(normals, 'vNormal', 4);
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

    thetaY += 0.0025;

    // Update matrices
    updateMatrices();

    // Draw
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length);
    
    requestAnimationFrame(render);
}

function updateMatrices() {
    // Projection matrix
    const aspect = canvas.width / canvas.height;
    const projectionMatrix = perspective(45, aspect, 0.1, 100.0);

    // View matrix
    const dist = 4.0;
    const eye = vec3(dist * Math.cos(thetaY), 0.0, dist * Math.sin(thetaY));
    const target = vec3(0.0, 0.0, 0.0);
    const up = vec3(0.0, 1.0, 0.0);
    const viewMatrix = lookAt(eye, target, up);

    // Model matrix
    const modelMatrix = mat4();

    // Update uniforms
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(viewMatrix));
    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
}

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

// Geometry functions remain the same
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
    vertices.push(a);
    normals.push(a);
    vertices.push(b);
    normals.push(b);
    vertices.push(c);
    normals.push(c);
}