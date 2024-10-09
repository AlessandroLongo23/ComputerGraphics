window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) 
        alert("WebGL isn’t available");

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);

    program = initShaders(gl, "vshader.glsl", "fshader.glsl");
    gl.useProgram(program);

    // points
    colors_array = []
    vertices = [];
    index = vertices.length;

    var max_points = 100;
    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec2'] * max_points, gl.STATIC_DRAW);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // click event
    canvas.addEventListener("click", function(event) {
        // colors
        switch(document.getElementById("pointscolor").selectedIndex) {
            case 0:
                colors_array.push(vec4(0.0, 0.0, 0.0, 1.0));
                break;
            case 1:
                colors_array.push(vec4(1.0, 1.0, 1.0, 1.0));
                break;
        }

        cBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(colors_array), gl.STATIC_DRAW);
        vColor = gl.getAttribLocation(program, "vColor");
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vColor);

        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        var t = vec2(
            -1 + 2 * (event.clientX - canvas.getBoundingClientRect().x) / canvas.width, 
            -1 + 2 * (canvas.height - (event.clientY - canvas.getBoundingClientRect().y)) / canvas.height
        );
        var data = new Float32Array(t);
        
        if (index < max_points) {
            gl.bufferSubData(gl.ARRAY_BUFFER, sizeof['vec2'] * index, data);
            index++;
        } else {
            console.log("Max points reached!");
        }
    });

    render();
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, index);
    window.requestAnimFrame(render, canvas);
}

document.getElementById("clear").addEventListener("click", function() {
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

    colors_array = [];
    cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors_array), gl.STATIC_DRAW);
    vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(vertices));
    index = 0;
});