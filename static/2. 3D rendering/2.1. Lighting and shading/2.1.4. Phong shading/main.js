var vertices, vBuffer;
var subdivisions, min_sub, max_sub;
var v0, v1, v2, v3;
var theta_y = 30;
var gl, canvas, program;
var view_matrix_loc, model_matrix_loc, projection_matrix_loc, eye_pos_loc;
var k_loc, L_loc, k_s_loc, s_loc;
var k, L, k_s, s;

window.onload = function init() {
    setup_WebGL();
    
    // enabling depth test and culling
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    // set the camera position
    eye_pos_loc = gl.getUniformLocation(program, "eye_pos");

    // set the light direction
    var light_direction = vec3(0.0, 0.0, -1.0);
    var light_direction_loc = gl.getUniformLocation(program, "light_direction");
    gl.uniform3fv(light_direction_loc, flatten(light_direction));

    // and all the lighting parameters
    k_loc = gl.getUniformLocation(program, "k");
    L_loc = gl.getUniformLocation(program, "L");
    k_s_loc = gl.getUniformLocation(program, "k_s");
    s_loc = gl.getUniformLocation(program, "s");

    // Uniform locations for the matrices
    view_matrix_loc = gl.getUniformLocation(program, "view_matrix");
    model_matrix_loc = gl.getUniformLocation(program, "model_matrix");
    projection_matrix_loc = gl.getUniformLocation(program, "projection_matrix");

    // vertices
    vertices = [];
    v0 = vec4(0.0, 0.0, -1.0, 1); 
    v1 = vec4(0.0, 0.942809, 0.333333, 1);
    v2 = vec4(-0.816497, -0.471405, 0.333333, 1);
    v3 = vec4(0.816497, -0.471405, 0.333333, 1);

    min_sub = 0;
    max_sub = 8;
    subdivisions = max_sub;
    
    build_polyhedron();
    render();
};

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    theta_y += 0.005;

    // projection matrix
    var projection_matrix = perspective(45, canvas.width / canvas.height, 0.1, 100.0);

    // view matrix
    var dist = 3.0;
    var eye_pos = vec3(dist * Math.cos(theta_y), 0.0, dist * Math.sin(theta_y));
    var target = vec3(0.0, 0.0, 0.0);
    var up = vec3(0.0, 1.0, 0.0);
    var view_matrix = lookAt(eye_pos, target, up);

    // model matrix
    var model_matrix = mat4();

    // update the lighting parameters
    update_lighting();

    // Pass matrices to the shader
    gl.uniformMatrix4fv(model_matrix_loc, false, flatten(model_matrix));
    gl.uniformMatrix4fv(view_matrix_loc, false, flatten(view_matrix));
    gl.uniformMatrix4fv(projection_matrix_loc, false, flatten(projection_matrix));
    gl.uniform3fv(eye_pos_loc, flatten(eye_pos));

    // draw the model using triangles
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length);
    
    // call the next frame
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

    // Normalize the midpoints correctly
    var ab = normalize(mix(a, b, 0.5), true);
    var ac = normalize(mix(a, c, 0.5), true);
    var bc = normalize(mix(b, c, 0.5), true);

    divideTriangle(a, ab, ac, count - 1);
    divideTriangle(ab, b, bc, count - 1);
    divideTriangle(bc, c, ac, count - 1);
    divideTriangle(ab, bc, ac, count - 1);
}

function triangle(a, b, c) {
    vertices.push(a);
    vertices.push(b);
    vertices.push(c);
}

document.getElementById("increment-subdivision-level").addEventListener("click", function() {
    if (subdivisions == max_sub)
        alert("Maximum subdivision level reached!");
    else
        subdivisions++;

    build_polyhedron();
});

document.getElementById("decrement-subdivision-level").addEventListener("click", function() {
    if (subdivisions == min_sub)
        alert("subdivision level is already 0!");
    else
        subdivisions--;

    build_polyhedron();
});

function update_lighting() {
    k = document.getElementById("k").value;
    L = document.getElementById("L").value;
    k_s = document.getElementById("k_s").value;
    s = document.getElementById("s").value;

    gl.uniform1f(k_loc, k);
    gl.uniform1f(L_loc, L);
    gl.uniform1f(k_s_loc, k_s);
    gl.uniform1f(s_loc, Math.pow(10, s));
} 

function setup_WebGL() {
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