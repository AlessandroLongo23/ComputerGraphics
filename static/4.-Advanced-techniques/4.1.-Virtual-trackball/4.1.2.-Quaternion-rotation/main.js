window.onload = () => {
    setupWebGL();

    initLight();
    initMatrices();
    initVertices();
    initGroundTexture();

    initEventHandlers(document.getElementById("gl-canvas"));
    qRotation = new Quaternion();
    qIncrement = new Quaternion();

    subdivisions = 6;
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

const initLight = () => {
    var lightDirection = vec3(0.0, 0.0, 1.0);
    var lightDirectionLoc = gl.getUniformLocation(program, "lightDirection");
    gl.uniform3fv(lightDirectionLoc, flatten(lightDirection));
}

const initMatrices = () => {
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    projectionMatrix = perspective(45, canvas.width / canvas.height, 0.1, 100.0);
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix");
    dist = 4.0;
    eye = vec3(0.0, 0.0, dist);
    at = vec3(0.0, 0.0, 0.0);
    up = vec3(0.0, 1.0, 0.0);
    viewMatrix = lookAt(eye, at, up);
    gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(viewMatrix));

    modelMatrix = mat4();
    modelMatrixLoc = gl.getUniformLocation(program, "modelMatrix");
    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
}

const initVertices = () => {
    baseVertices = [
        vec4(0.0, 0.0, -1.0, 1),
        vec4(0.0, 0.942809, 0.333333, 1),
        vec4(-0.816497, -0.471405, 0.333333, 1),
        vec4(0.816497, -0.471405, 0.333333, 1),
    ]
}

const initGroundTexture = () => {
    gl.activeTexture(gl.TEXTURE0);
    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    textureLoc = gl.getUniformLocation(program, "texMap");
    gl.uniform1i(textureLoc, 0);

    var myTexels = new Image();
    myTexels.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, myTexels);
        gl.generateMipmap(gl.TEXTURE_2D);
    }
    myTexels.src = "../earth.jpg";
}

const buildPolyhedron = () => {
    vertices = [];
    normals = [];
    tetrahedron(baseVertices[0], baseVertices[1], baseVertices[2], baseVertices[3], subdivisions);

    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);
    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);
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
    normals.push(a);
    vertices.push(b);
    normals.push(b);
    vertices.push(c);
    normals.push(c);
}

const render = () => {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    viewMatrix = lookAt(qRotation.apply(eye), at, qRotation.apply(up));
    gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(viewMatrix));

    gl.drawArrays(gl.TRIANGLES, 0, vertices.length);
    
    requestAnimFrame(render);
}

const initEventHandlers = (canvas) => {
    mouseVector = vec3();
    prevMouseVector = null;
    isLeftButtonDown = false;

    canvas.addEventListener('mousedown', (event) => {
        event.preventDefault();

        if (event.button == 0) {
            isLeftButtonDown = true;
            prevMouseVector = mapMousePosition(event);
        }
    });

    canvas.addEventListener('mouseup', (event) => {
        event.preventDefault();

        isLeftButtonDown = false;
        prevMouseVector = null;
    });

    canvas.addEventListener('mousemove', (event) => {
        event.preventDefault();

        if (isLeftButtonDown && prevMouseVector) {
            let currentMouseVector = mapMousePosition(event);
            
            let qIncrease = new Quaternion().make_rot_vec2vec(prevMouseVector, currentMouseVector);
            
            qRotation = qRotation.multiply(qIncrease);
            
            prevMouseVector = currentMouseVector;
        }
    });
};

const mapMousePosition = (event) => {
    let rect = event.target.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;
    let mouseVirtualX = map(mouseX, 0, canvas.width, 1, -1);
    let mouseVirtualY = map(mouseY, 0, canvas.height, -1, 1);

    let d = Math.sqrt(mouseVirtualX * mouseVirtualX + mouseVirtualY * mouseVirtualY);
    let mouseVirtualZ;
    if (d <= 1 / Math.sqrt(2))
        mouseVirtualZ = Math.sqrt(1 - d * d);
    else
        mouseVirtualZ = 1 / (2 * d);
    
    let v = vec3(mouseVirtualX, mouseVirtualY, mouseVirtualZ);
    v = normalize(v);

    return v;
}

const map = (x, inMin = 0, inMax = 1, outMin = 0, outMax = 1) => {
    return (x - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
};