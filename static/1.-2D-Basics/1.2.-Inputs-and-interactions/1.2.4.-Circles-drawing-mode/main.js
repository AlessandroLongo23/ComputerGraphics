window.onload = () => {
    setupWebGL();

    mode = 'points';
    side = 20;
    count = 0;
    maxPoints = 1000;
    numTriangles = 32;
    
    initVerticesBuffer();
    initColorsBuffer();

    canvas.addEventListener("click", function(event) {
        var t = vec2(
            -1 + 2 * (event.clientX - canvas.getBoundingClientRect().x) / canvas.width,
            1 - 2 * (event.clientY - canvas.getBoundingClientRect().y) / canvas.height
        );
        
        switch(document.getElementById("pointscolor").selectedIndex) {
            case 0:
                selectedColor = vec4(0.0, 0.0, 0.0, 1.0);
                break;
            case 1:
                selectedColor = vec4(1.0, 1.0, 1.0, 1.0);
                break;
        }

        count++;
        if (mode == 'points') {
            var newVertices = addPoint(t, side);

            for (var i = 0; i < 6; i++)
                colors.push(selectedColor);
        } else if (mode == 'triangles') {
            if (count % 3 == 0) {
                var firstVertex = vec2(
                    (vertices[vertices.length - 1][0] + vertices[vertices.length - 3][0]) / 2, 
                    (vertices[vertices.length - 1][1] + vertices[vertices.length - 3][1]) / 2
                );
                var secondVertex = vec2(
                    (vertices[vertices.length - 7][0] + vertices[vertices.length - 9][0]) / 2, 
                    (vertices[vertices.length - 7][1] + vertices[vertices.length - 9][1]) / 2
                );
                vertices = vertices.slice(0, vertices.length - 12);
                var newVertices = [firstVertex, secondVertex, t];

                var firstVertexColor = colors[colors.length - 6];
                var secondVertexColor = colors[colors.length - 3];
                colors = colors.slice(0, colors.length - 12);
                colors.push(firstVertexColor, secondVertexColor, selectedColor);
            } else {
                var newVertices = addPoint(t, side);

                for (var i = 0; i < 6; i++)
                    colors.push(selectedColor);
            }
        } else if (mode == 'circles') {
            if (count % 2 == 0) {
                var center = vec2(
                    (vertices[vertices.length - 1][0] + vertices[vertices.length - 3][0]) / 2, 
                    (vertices[vertices.length - 1][1] + vertices[vertices.length - 3][1]) / 2
                );
                var rad = Math.sqrt(Math.pow(center[0] - t[0], 2) + Math.pow(center[1] - t[1], 2));

                var newVertices = [];
                for (let angle = 0; angle < Math.PI * 2; angle += Math.PI * 2 / numTriangles) {
                    newVertices.push(vec2(
                        center[0] + rad * Math.cos(angle),
                        center[1] + rad * Math.sin(angle)
                    ));
                    newVertices.push(vec2(
                        center[0] + rad * Math.cos(angle + Math.PI * 2 / numTriangles),
                        center[1] + rad * Math.sin(angle + Math.PI * 2 / numTriangles)
                    ));
                    newVertices.push(center);
                }

                var centerColor = colors[colors.length - 1];
                for (let i = 0; i < numTriangles; i++)
                    colors.push(selectedColor, selectedColor, centerColor);
            } else {
                var newVertices = addPoint(t, side);

                for (var i = 0; i < 6; i++)
                    colors.push(selectedColor);
            }
        }
        
        for (var i = 0; i < newVertices.length; i++) {
            if (vertices.length < maxPoints)
                vertices.push(newVertices[i]);
            else
                alert("Max number of points reached! Clear the canvas");
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));

        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
    });

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
    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);

    program = initShaders(gl, "vshader.glsl", "fshader.glsl");
    gl.useProgram(program);
}

const initVerticesBuffer = () => {
    vertices = [];

    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec2'] * maxPoints, gl.STATIC_DRAW);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));
   
    vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
}

const initColorsBuffer = () => {
    colors = [];

    cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
        
    vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);
}

const addPoint = (t, side) => {
    return [
        vec2(t[0] - side / canvas.width, t[1] - side / canvas.height),
        vec2(t[0] - side / canvas.width, t[1] + side / canvas.height),
        vec2(t[0] + side / canvas.width, t[1] + side / canvas.height),

        vec2(t[0] - side / canvas.width, t[1] - side / canvas.height),
        vec2(t[0] + side / canvas.width, t[1] - side / canvas.height),
        vec2(t[0] + side / canvas.width, t[1] + side / canvas.height),
    ]
}

const render = () => {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length);
    requestAnimFrame(render, canvas);
}

document.getElementById("clear").addEventListener("click", () => {
    switch(document.getElementById("mymenu").selectedIndex) {
        case 0:
            gl.clearColor(218 / 255, 98 / 255, 87 / 255, 1.0);
            break;
        case 1:
            gl.clearColor(87 / 255, 218 / 255, 122 / 255, 1);
            break;
        case 2:
            gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
            break;
    }

    vertices = [];
    colors = [];
    count = 0;
});

document.getElementById("pointsMode").addEventListener("click", () => {
    mode = 'points';
});

document.getElementById("trianglesMode").addEventListener("click", () => {
    mode = 'triangles';
    count = 0;
});

document.getElementById("circlesMode").addEventListener("click", () => {
    mode = 'circles';
    count = 0;
});