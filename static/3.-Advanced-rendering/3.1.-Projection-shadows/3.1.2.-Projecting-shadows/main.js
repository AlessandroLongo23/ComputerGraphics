window.onload = () => {
    setupWebGL();

    time = 0.0;

    initPointLight();
    initVertices();
    initGroundTexture();
    initTextureCoordinates();
    initMatrices();

    red = vec3(1.0, 0.0, 0.0);
    fColorLoc = gl.getUniformLocation(program, "fColor");
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

const initPointLight = () => {
    pointLightCenter = vec3(0.0, 2.0, -2.0);
    pointLightRadius = 2.0;
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
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    projectionMatrix = perspective(90, canvas.width / canvas.height, .1, 30.0);
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    
    at = vec3(0.0, 0.0, 0.0);
    up = vec3(0.0, 1.0, 0.0);
    eye = vec3(0.0, 0.0, 0.0);
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
}

const render = () => {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniform1i(isGroundLoc, true);
    renderGround();

    gl.uniform1i(isGroundLoc, false);
    renderShadow();
    renderRects();
    
    requestAnimFrame(render);
}

const renderGround = () => {
    modelViewMatrix = mat4();
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, groundTexture);
    gl.uniform1i(groundTexLoc, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

const renderShadow = () => {
    updateLightPosition();

    modelViewMatrix = lookAt(eye, at, up);
    m = mat4();
    m[3][3] = 0.0;
    m[3][1] = -1.0 / (pointLightPosition[1] + 1.0);
    modelViewMatrix = mult(modelViewMatrix, translate(pointLightPosition));
    modelViewMatrix = mult(modelViewMatrix, m);
    modelViewMatrix = mult(modelViewMatrix, translate(-pointLightPosition[0], -pointLightPosition[1], -pointLightPosition[2]));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    gl.uniform3f(fColorLoc, red[0], red[1], red[2]);
    gl.drawArrays(gl.TRIANGLES, 6, 18);
}

const updateLightPosition = () => {
    time += 0.01;

    pointLightPosition = vec3(
        pointLightCenter[0] + pointLightRadius * Math.cos(time),
        pointLightCenter[1],
        pointLightCenter[2] + pointLightRadius * Math.sin(time),
    );
}

const renderRects = () => {    
    modelViewMatrix = lookAt(eye, at, up);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    gl.uniform3f(fColorLoc, red[0], red[1], red[2]);
    gl.drawArrays(gl.TRIANGLES, 6, 18);
}