window.onload = () => {
    setupWebGL();

    eyeLoc = gl.getUniformLocation(program, "eye");

    initializeLights();

    viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix");
    modelMatrixLoc = gl.getUniformLocation(program, "modelMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

    readOBJFile(fileName = '../suzanne.obj', scale = 0.75, reverse = false)
        .then(objInfo => {
            obj = objInfo;

            var newVertices = [];
            var newNormals = [];
            for (let i = 0; i < obj.vertices.length; i++) {
                if (i % 4 != 3) {
                    newVertices.push(obj.vertices[i]);
                    newNormals.push(obj.normals[i]);
                }
            }
            obj.vertices = newVertices;
            obj.normals = newNormals;

            var vBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(obj.vertices), gl.STATIC_DRAW);
            var vPosition = gl.getAttribLocation(program, "vPosition");
            gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(vPosition);

            var nBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(obj.normals), gl.STATIC_DRAW);
            var vNormal = gl.getAttribLocation(program, "vNormal");
            gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(vNormal);

            var indices = new Uint16Array(obj.indices);
            var iBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

            thetaY = Math.PI / 6;

            render();
        })
        .catch(error => {
            console.error("Error loading OBJ file:", error);
        });
};

const initializeLights = () => {
    var leftLightDirection = vec3(-1.0, 0.0, 0.0);
    var leftLightDirectionLoc = gl.getUniformLocation(program, "leftLight");
    gl.uniform3fv(leftLightDirectionLoc, flatten(leftLightDirection));

    var rightLightDirection = vec3(1.0, 0.0, 0.0);
    var rightLightDirectionLoc = gl.getUniformLocation(program, "rightLight");
    gl.uniform3fv(rightLightDirectionLoc, flatten(rightLightDirection));
}

const render = () => {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    thetaY += 0.0025;

    var projectionMatrix = perspective(45, canvas.width / canvas.height, 0.1, 100.0);

    var dist = 3.0;
    var eye = vec3(dist * Math.cos(thetaY), 0.0, dist * Math.sin(thetaY));
    var at = vec3(0.0, 0.0, 0.0);
    var up = vec3(0.0, 1.0, 0.0);
    var viewMatrix = lookAt(eye, at, up);

    var modelMatrix = mat4();

    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
    gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(viewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    gl.uniform3fv(eyeLoc, flatten(eye));

    gl.drawElements(gl.TRIANGLES, obj.indices.length, gl.UNSIGNED_SHORT, 0);

    requestAnimFrame(render);
}

const setupWebGL = () => {
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn’t available");
        return;
    }

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
    gl.enable(gl.DEPTH_TEST);

    program = initShaders(gl, "vshader.glsl", "fshader.glsl");
    gl.useProgram(program);
}
