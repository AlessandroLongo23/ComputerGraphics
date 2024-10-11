var vertices, vBuffer, base_colors, vertex_colors, subdivisions;
var v0, v1, v2, v3;
var theta_y = 30;

window.onload = function init() {
    setup_WebGL();

    // colors
    base_colors = [
        vec3(1.0, 0.0, 0.0),
        vec3(0.0, 1.0, 0.0),
        vec3(0.0, 0.0, 1.0),
        vec3(0.0, 0.0, 0.0)
    ];
    vertex_colors = [];

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertex_colors), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);  // 4 components for RGBA
    gl.enableVertexAttribArray(vColor);

    // vertices
    v0 = vec4(0.0, 0.0, -1.0, 1); 
    v1 = vec4(0.0, 0.942809, 0.333333, 1);
    v2 = vec4(-0.816497, -0.471405, 0.333333, 1);
    v3 = vec4(0.816497, -0.471405, 0.333333, 1);
    subdivisions = 1;
    
    build_polyhedron();

    // Initialize rotation and transformations
    model_view_matrix_loc = gl.getUniformLocation(program, "model_view_matrix");
    projection_matrix_loc = gl.getUniformLocation(program, "projection_matrix");

    render();
};

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    var ctm = mat4();
    var projection_matrix = perspective(45, canvas.width / canvas.height, .001, 10.0);
    gl.uniformMatrix4fv(projection_matrix_loc, false, flatten(projection_matrix));

    theta_y += 0.025;

    ctm = mat4();
    ctm = mult(ctm, translate(0, 0, -3));
    ctm = mult(ctm, rotateY(theta_y));
    gl.uniformMatrix4fv(model_view_matrix_loc, false, flatten(ctm));
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length);

    requestAnimFrame(render);
}

function build_polyhedron() {
    vertices = [];
    tetrahedron(v0, v1, v2, v3, subdivisions);

    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
}

function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, n, 0);
    divideTriangle(d, c, b, n, 1);
    divideTriangle(a, d, b, n, 2);
    divideTriangle(a, c, d, n, 3);
}

function divideTriangle(a, b, c, count, color_index) {
    if (count == 0) {
        triangle(a, b, c, color_index);
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

function triangle(a, b, c, color_index) {
    vertex_colors.push(base_colors[color_index]);
    vertices.push(a);
    vertex_colors.push(base_colors[color_index]);
    vertices.push(b);
    vertex_colors.push(base_colors[color_index]);
    vertices.push(c);
}

document.getElementById("increment-subdivision-level").addEventListener("click", function() {
    if (subdivisions > 6)
        alert("Maximum subdivision level reached!");
    else
        subdivisions++;

    build_polyhedron();
});

document.getElementById("decrement-subdivision-level").addEventListener("click", function() {
    if (subdivisions == 0)
        alert("subdivision level is already 0!");
    else
        subdivisions--;

    build_polyhedron();
});

function setup_WebGL() {
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