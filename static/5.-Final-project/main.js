window.onload = () => {
    if (!setupWebGL()) 
        return;

    numRepeats = 1;
    obj = null;
    model = 'sphere';
    cubemapPack = 'autumn';
    texturePack = 'corrugated_iron_2k';
    modelLoaded = false;
    cubeTexture = null;
    yOffset = 0.0;

    configureWebGL();
    initEventHandlers(document.getElementById("gl-canvas"));

    dist = 8.0;
    initUniforms();
    initMatrices();
    
    initCubeMap(cubemapPack);
    initTextures(texturePack);

    initBackgroundQuad();
    initModel(model);

    initLight();

    render();
};

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

const initMatrices = () => {
    theta[0] = Math.PI / 6.0;
    theta[1] = Math.PI / 15.0;

    at = vec3(0.0, 0.0, 0.0);
    up = vec3(0.0, 1.0, 0.0);
}

const initUniforms = () => {
    viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix");
    modelMatrixLoc = gl.getUniformLocation(program, "modelMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    texMatrixLoc = gl.getUniformLocation(program, "texMatrix");

    eyeLoc = gl.getUniformLocation(program, "eye");
    reflectiveLoc = gl.getUniformLocation(program, "reflective");

    displacementScaleLoc = gl.getUniformLocation(program, "displacementScale");
    gl.uniform1f(displacementScaleLoc, document.getElementById("displacementScale").value);
    document.getElementById("displacementScale").addEventListener("input", (event) => {
        gl.uniform1f(displacementScaleLoc, event.target.value);
    });

    patternRepeatLoc = gl.getUniformLocation(program, "patternRepeat");
    gl.uniform1f(patternRepeatLoc, document.getElementById("patternRepeat").value);
    document.getElementById("patternRepeat").addEventListener("input", (event) => {
        gl.uniform1f(patternRepeatLoc, event.target.value);
    });

    projectionMatrix = perspective(60, canvas.width / canvas.height, 0.1, 100.0);
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    modelMatrix = mat4();
    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
}

const initLight = () => {
    var lightDirection = vec3(0.0, 1.0, 1.0);
    var lightDirectionLoc = gl.getUniformLocation(program, "lightDirection");
    gl.uniform3fv(lightDirectionLoc, flatten(lightDirection));
};

const render = () => {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    eye = vec3(
        dist * Math.sin(theta[0]) * Math.cos(theta[1]),
        dist * Math.sin(theta[1]),
        dist * Math.cos(theta[0]) * Math.cos(theta[1])
    );
    
    viewMatrix = lookAt(eye, at, up);
    modelMatrix = mat4();
    modelMatrix = mult(modelMatrix, translate(0.0, -yOffset, 0.0));
    texMatrix = mult(inverse(viewMatrix), inverse(projectionMatrix));
    gl.uniform3fv(eyeLoc, eye);

    drawBackground();

    if (modelLoaded)
        drawModel();

    requestAnimationFrame(render);
};

const drawBackground = () => {
    gl.bindBuffer(gl.ARRAY_BUFFER, backgroundBuffer);
    gl.cullFace(gl.FRONT);

    const vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(mat4()));
    gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(mat4()));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(mat4()));
    
    gl.uniformMatrix4fv(texMatrixLoc, false, flatten(texMatrix));
    gl.uniform1i(reflectiveLoc, false);
    
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

const drawModel = () => {
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
    gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(viewMatrix));
    gl.uniformMatrix4fv(texMatrixLoc, false, flatten(texMatrix));
    
    gl.uniform1i(reflectiveLoc, true);
    if (model === 'sphere') {
        gl.cullFace(gl.FRONT);

        const vPosition = gl.getAttribLocation(program, "vPosition");
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        const vNormal = gl.getAttribLocation(program, "vNormal");
        gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vNormal);

        gl.drawArrays(gl.TRIANGLES, 0, sphereVertices.length);
    } else {
        gl.cullFace(gl.BACK);

        const vPosition = gl.getAttribLocation(program, "vPosition");
        gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        const vNormal = gl.getAttribLocation(program, "vNormal");
        gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vNormal);

        gl.drawElements(gl.TRIANGLES, obj.indices.length, gl.UNSIGNED_SHORT, 0);
    }
}

const initEventHandlers = (canvas) => {
    theta = vec2();
    isLeftButtonDown = false
    prevMouse = vec2();

    canvas.addEventListener('mousedown', (event) => {
        event.preventDefault();

        if (event.button == 0) {
            isLeftButtonDown = true;

            prevMouse[0] = event.clientX;
            prevMouse[1] = event.clientY;
        }
    });

    canvas.addEventListener('mouseup', (event) => {
        event.preventDefault();

        isLeftButtonDown = false;
    });

    canvas.addEventListener('mousemove', (event) => {
        event.preventDefault();

        if (isLeftButtonDown) {
            theta[0] -= (event.clientX - prevMouse[0]) / canvas.width * Math.PI * 2;
            theta[1] += (event.clientY - prevMouse[1]) / canvas.height * Math.PI * 2;

            theta[1] = Math.min(Math.max(theta[1], -Math.PI / 2.0), Math.PI / 2.0);
            
            prevMouse[0] = event.clientX;
            prevMouse[1] = event.clientY;
        }
    });

    canvas.addEventListener('wheel', (event) => {
        event.preventDefault();
        
        const ZOOM_SPEED = 0.01;
        
        dist += event.deltaY * ZOOM_SPEED;
        dist = Math.max(3.0, Math.min(10.0, dist));
    });
}

document.getElementById("texturePack").addEventListener("change", (event) => {
    initTextures(event.target.value);
});

document.getElementById("cubemap").addEventListener("change", async (event) => {
    initCubeMap(event.target.value);
});

document.getElementById("model").addEventListener("change", async (event) => {
    model = event.target.value;
    try {
        initModel(model);
    } catch (error) {
        console.error("Failed to load model:", error);
    }
});