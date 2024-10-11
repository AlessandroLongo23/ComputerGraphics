attribute vec4 vPosition;

uniform mat4 projection_matrix;
uniform mat4 view_matrix;
uniform mat4 model_matrix;

uniform vec3 eye_pos;
uniform vec3 light_direction;
uniform float k;
uniform float L;
uniform float k_s;
uniform float s;

varying vec4 vertex_color;

void main() {
    vec4 pos = model_matrix * vPosition;
    vec3 n = normalize(pos.xyz);
    vec3 w_i = normalize(-light_direction);
    
    // diffuse lighting
    float diffuse = max(dot(n, w_i), 0.0);
    vec3 diffuse_color = k * diffuse * vec3(L);

    // specular lighting
    vec3 w_r = reflect(w_i, n);
    vec3 w_o = normalize(eye_pos - pos.xyz);
    float specular = pow(max(dot(w_r, w_o), 0.0), s);
    vec3 specular_color = k_s * specular * vec3(L);

    // ambient lighting
    vec3 ambient_color = k * vec3(L);

    // final color and position
    vertex_color = vec4(ambient_color + diffuse_color + specular_color, 1.0);
    gl_Position = projection_matrix * view_matrix * pos;
}