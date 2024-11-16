var vertices;

const render = () => {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length);
    window.requestAnimFrame(render, canvas);
}

window.onload = () => {
    setupWebGL();

    mode = 'points';
    side = 20;
    count = 0;
    maxPoints = 100;
    
    // points
    colors = []
    vertices = [];

    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec2'] * maxPoints, gl.STATIC_DRAW);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // click event
    canvas.addEventListener("click", function(event) {
        // colors
        if (mode == 'points') {
            switch(document.getElementById("pointscolor").selectedIndex) {
                case 0:
                    for (var i = 0; i < 6; i++)
                        colors.push(vec4(0.0, 0.0, 0.0, 1.0));
                    break;
                case 1:
                    for (var i = 0; i < 6; i++)
                        colors.push(vec4(1.0, 1.0, 1.0, 1.0));
                    break;
            }
        } else if (mode == 'triangles') {
            count++;
            if (count == 3) {
                var firstVertexColor = colors[colors.length - 6];
                var secondVertexColor = colors[colors.length - 3];
                colors = colors.slice(0, colors.length - 12);
                colors.push(firstVertexColor);
                colors.push(secondVertexColor);
                switch(document.getElementById("pointscolor").selectedIndex) {
                    case 0:
                        colors.push(vec4(0.0, 0.0, 0.0, 1.0)); 
                        break;
                    case 1:
                        colors.push(vec4(1.0, 1.0, 1.0, 1.0));
                        break;
                }
            } else {
                switch(document.getElementById("pointscolor").selectedIndex) {
                    case 0:
                        for (var i = 0; i < 6; i++)
                            colors.push(vec4(0.0, 0.0, 0.0, 1.0));
                        break;
                    case 1:
                        for (var i = 0; i < 6; i++)
                            colors.push(vec4(1.0, 1.0, 1.0, 1.0));
                        break;
                }
            }
        }
        
        cBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
        vColor = gl.getAttribLocation(program, "vColor");
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vColor);

        // add vertex/vertices
        var t = vec2(
            -1 + 2 * (event.clientX - canvas.getBoundingClientRect().x) / canvas.width,
            1 - 2 * (event.clientY - canvas.getBoundingClientRect().y) / canvas.height
        );
        if (mode == 'points') {
            var newVertices = [
                vec2(t[0] - side / canvas.width, t[1] - side / canvas.height),
                vec2(t[0] - side / canvas.width, t[1] + side / canvas.height),
                vec2(t[0] + side / canvas.width, t[1] + side / canvas.height),

                vec2(t[0] - side / canvas.width, t[1] - side / canvas.height),
                vec2(t[0] + side / canvas.width, t[1] - side / canvas.height),
                vec2(t[0] + side / canvas.width, t[1] + side / canvas.height),
            ]
        } else if (mode == 'triangles') {
            if (count == 3) {
                var first_vertex = vec2(
                    (vertices[vertices.length - 1][0] + vertices[vertices.length - 3][0]) / 2, 
                    (vertices[vertices.length - 1][1] + vertices[vertices.length - 3][1]) / 2
                );
                var second_vertex = vec2(
                    (vertices[vertices.length - 7][0] + vertices[vertices.length - 9][0]) / 2, 
                    (vertices[vertices.length - 7][1] + vertices[vertices.length - 9][1]) / 2
                );

                vertices = vertices.slice(0, vertices.length - 12);

                var newVertices = [
                    first_vertex,
                    second_vertex,
                    t
                ]
                count = 0;
            } else {
                var newVertices = [
                    vec2(t[0] - side / canvas.width, t[1] - side / canvas.height),
                    vec2(t[0] - side / canvas.width, t[1] + side / canvas.height),
                    vec2(t[0] + side / canvas.width, t[1] + side / canvas.height),
    
                    vec2(t[0] - side / canvas.width, t[1] - side / canvas.height),
                    vec2(t[0] + side / canvas.width, t[1] - side / canvas.height),
                    vec2(t[0] + side / canvas.width, t[1] + side / canvas.height),
                ]
            }
        }
        
        for (var i = 0; i < newVertices.length; i++)
            vertices.push(newVertices[i]);

        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));
    });

    render();
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

    colors = [];
    cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
    vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    count = 0;

    vertices = [];
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(vertices));
});

document.getElementById("pointsMode").addEventListener("click", () => {
    mode = 'points';
});

document.getElementById("trianglesMode").addEventListener("click", () => {
    mode = 'triangles';
});

const setupWebGL = () => {
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn’t available");
        return;
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);

    program = initShaders(gl, "vshader.glsl", "fshader.glsl");
    gl.useProgram(program);
}