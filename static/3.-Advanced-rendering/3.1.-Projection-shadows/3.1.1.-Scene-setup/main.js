window.onload = () => {
    setupWebGL();

    initVertices();
    initMatrices();

    initGroundTexture();
    initRectTexture();
    initTextureCoordinates();
    
    isGroundLoc = gl.getUniformLocation(program, "isGround");

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
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    program = initShaders(gl, "vshader.glsl", "fshader.glsl");
    gl.useProgram(program);
}

const initVertices = () => {
    vertices = [
        vec4(-2.0, -1.0, -1.0, 1.0), 
        vec4(-2.0, -1.0, -5.0, 1.0), 
        vec4(2.0, -1.0, -5.0, 1.0),
        vec4(-2.0, -1.0, -1.0, 1.0), 
        vec4(2.0, -1.0, -5.0, 1.0),
        vec4(2.0, -1.0, -1.0, 1.0),

        vec4(0.25, -0.5, -1.25, 1.0),
        vec4(0.25, -0.5, -1.75, 1.0),
        vec4(0.75, -0.5, -1.75, 1.0),
        vec4(0.25, -0.5, -1.25, 1.0),
        vec4(0.75, -0.5, -1.75, 1.0),
        vec4(0.75, -0.5, -1.25, 1.0),

        vec4(-1.0, -1.0, -2.5, 1.0),
        vec4(-1.0, -1.0, -3.0, 1.0),
        vec4(-1.0, -0.0, -3.0, 1.0),
        vec4(-1.0, -1.0, -2.5, 1.0),
        vec4(-1.0, -0.0, -3.0, 1.0),
        vec4(-1.0, -0.0, -2.5, 1.0),
    ];
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
}

const initGroundTexture = () => {
    groundTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, groundTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    groundTexLoc = gl.getUniformLocation(program, "groundTex");
    gl.uniform1i(groundTexLoc, 0);

    var myTexels = new Image();
    myTexels.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, groundTexture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, myTexels);
        gl.generateMipmap(gl.TEXTURE_2D);
    }
    myTexels.src = "../texture.png";
}

const initRectTexture = () => {
    var redImg = new Uint8Array([255, 0, 0, 255]);

    redTex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, redTex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, redImg);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    redTexLoc = gl.getUniformLocation(program, "redTex");
    gl.uniform1i(redTexLoc, 1);
}

const initTextureCoordinates = () => {
    var textCoords = [
        vec2(-.5, -.5), vec2(.5, -.5), vec2(.5, .5),
        vec2(-.5, -.5), vec2(.5, .5), vec2(-.5, .5),
    ];

    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(textCoords), gl.STATIC_DRAW);
    var vTexCoord = gl.getAttribLocation(program, "vTexCoord");
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);
}

const initMatrices = () => {
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    var modelViewMatrix = mat4();
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    var projectionMatrix = perspective(90, canvas.width / canvas.height, .1, 30.0);
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
}

const render = () => {
    gl.clear(gl.COLOR_BUFFER_BIT);

    renderGround();
    renderRects();

    requestAnimFrame(render);
}

const renderGround = () => {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, groundTexture);
    gl.uniform1i(groundTexLoc, 0);
    gl.uniform1i(isGroundLoc, true);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

const renderRects = () => {
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, redTex);
    gl.uniform1i(redTexLoc, 1);
    gl.uniform1i(isGroundLoc, false);
    gl.drawArrays(gl.TRIANGLES, 6, 18);
}