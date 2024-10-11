attribute vec4 vPosition;

uniform mat4 projection_matrix;
uniform mat4 view_matrix;
uniform mat4 model_matrix;

uniform vec3 light_direction;

varying vec4 vertex_color;

void main() {
    vec4 pos = model_matrix * vPosition;
    vec3 n = normalize(pos.xyz);
    vec3 w_i = -normalize(light_direction);
    
    // diffuse lighting
    float k_d = 1.0;
    float diffuse = max(dot(n, -w_i), 0.0);
    vec3 L_d = vec3(1.0);
    vec3 diffuse_color = k_d * diffuse * L_d;

    // final color and position
    vertex_color = vec4(diffuse_color, 1.0);
    gl_Position = projection_matrix * view_matrix * pos;
}