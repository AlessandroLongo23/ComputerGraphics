var vertices, vBuffer, vertex_colors, num_subdivisions;
var light_color_loc, light_color;
var shininess;
var camera_pos;
var v0, v1, v2, v3;
var theta_y = 30;

function setup_environment() {
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl)
        alert("WebGL isn’t available");

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
    gl.enable(gl.DEPTH_TEST);

    program = initShaders(gl, "vshader.glsl", "fshader.glsl");
    gl.useProgram(program);

    // Light direction
    var light_direction = vec3(0.0, 0.0, 1.0);
    var light_direction_loc = gl.getUniformLocation(program, "light_dir");
    gl.uniform3fv(light_direction_loc, flatten(light_direction));

    // Uniform locations for the matrices
    camera_pos_loc = gl.getUniformLocation(program, "camera_pos");
    view_matrix_loc = gl.getUniformLocation(program, "view_matrix");
    model_matrix_loc = gl.getUniformLocation(program, "model_matrix")
    projection_matrix_loc = gl.getUniformLocation(program, "projection_matrix");

    // Uniform locations for the material parameters
    shininess_loc = gl.getUniformLocation(program, "s");
    diffuse_material_loc = gl.getUniformLocation(program, "k_d");
    diffuse_intensity_loc = gl.getUniformLocation(program, "L_s");
    specular_material_loc = gl.getUniformLocation(program, "k_s");
    specular_intensity_loc = gl.getUniformLocation(program, "L_s");
    ambient_material_loc = gl.getUniformLocation(program, "k_a");
    ambient_intensity_loc = gl.getUniformLocation(program, "L_a");
}

window.onload = function init() {
    setup_environment();

    // colors
    vertex_colors = [];

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertex_colors), gl.STATIC_DRAW);

    light_color_loc = gl.getUniformLocation(program, "light_color");
    gl.vertexAttribPointer(light_color_loc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(light_color_loc);

    // vertices
    vertices = [];
    v0 = vec4(0.0, 0.0, -1.0, 1); 
    v1 = vec4(0.0, 0.942809, 0.333333, 1);
    v2 = vec4(-0.816497, -0.471405, 0.333333, 1);
    v3 = vec4(0.816497, -0.471405, 0.333333, 1);
    num_subdivisions = 0;
    
    build_polyhedron();

    render();
};

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    get_sliders_values();

    dist = 3.0;
    theta_y += .01;
    camera_pos = vec3(dist * Math.cos(theta_y), 0.0, dist * Math.sin(theta_y));
    var view_matrix = lookAt(
        camera_pos,
        vec3(0.0, 0.0, 0.0), 
        vec3(0.0, 1.0, 0.0)
    );

    var model_matrix = translate(vec3(0.0)); 
    var projection_matrix = perspective(45, canvas.width / canvas.height, 0.1, 10.0);

    // model_view_matrix = mult(model_view_matrix, translate(0.0, 0.0, -3.0));
    // model_view_matrix = mult(model_view_matrix, rotateY(theta_y));

    light_color = vec3(1.0, 0.0, 0.0);

    gl.uniform3fv(light_color_loc, flatten(light_color));
    gl.uniform3fv(camera_pos_loc, flatten(camera_pos));
    gl.uniformMatrix4fv(view_matrix_loc, false, flatten(view_matrix));
    gl.uniformMatrix4fv(model_matrix_loc, false, flatten(model_matrix));
    gl.uniformMatrix4fv(projection_matrix_loc, false, flatten(projection_matrix));

    gl.uniform1f(shininess_loc, shininess);
    gl.uniform1f(diffuse_material_loc, diffuse_material);
    gl.uniform1f(diffuse_intensity_loc, diffuse_intensity);
    gl.uniform1f(specular_material_loc, specular_material);
    gl.uniform1f(specular_intensity_loc, specular_intensity);
    gl.uniform1f(ambient_material_loc, ambient_material);
    gl.uniform1f(ambient_intensity_loc, ambient_intensity);

    gl.drawArrays(gl.TRIANGLES, 0, vertices.length);
    requestAnimFrame(render);
}

document.getElementById("increment-subdivision-level").addEventListener("click", function() {
    if (num_subdivisions > 6)
        alert("Maximum subdivision level reached!");
    else
        num_subdivisions++;

    build_polyhedron();
});

document.getElementById("decrement-subdivision-level").addEventListener("click", function() {
    if (num_subdivisions == 0)
        alert("subdivision level is already 0!");
    else
        num_subdivisions--;

    build_polyhedron();
});

function get_sliders_values() {
    shininess = Math.pow(10, document.getElementById("s").value);
    diffuse_material = document.getElementById("k_d").value;
    diffuse_intensity = document.getElementById("L_d").value;
    specular_material = document.getElementById("k_s").value;
    specular_intensity = document.getElementById("L_s").value;
    ambient_material = document.getElementById("k_a").value;
    ambient_intensity = document.getElementById("L_a").value;
}

function build_polyhedron() {
    vertices = [];

    tetrahedron(v0, v1, v2, v3, num_subdivisions);

    // Bind the vertex buffer
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

function divideTriangle(a, b, c, count) {
    if (count == 0) {
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

function triangle(a, b, c) {
    vertices.push(a);
    vertices.push(b);
    vertices.push(c);
}