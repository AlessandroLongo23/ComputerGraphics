attribute vec4 vPosition;

uniform vec3 camera_pos;

uniform mat4 projection_matrix;
uniform mat4 view_matrix;
uniform mat4 model_matrix;

uniform vec3 light_dir;
uniform vec3 light_color;

uniform float s;
uniform float k_d;
// uniform vec3 L_d;
uniform float k_s; 
// uniform vec3 L_s;
uniform float k_a;
// uniform vec3 L_a;

varying vec4 vertex_color;

void main() {
    vec4 pos = model_matrix * vPosition;
    vec3 n = (normalize(model_matrix * vec4(vPosition.xyz, 0))).xyz;

    // diffused light
    vec3 L_d = light_color;
    vec3 l = normalize(light_dir);
    float diffuse = max(dot(n, l), 0.0);
    vec3 diffuse_color = k_d * diffuse * L_d;

    // specular light
    vec3 L_s = vec3(1.0);
    vec3 omega_r = reflect(-light_dir, n);
    vec3 omega_o = normalize(camera_pos - pos.xyz); 
    vec3 specular_color = k_s * pow(max(dot(omega_r, omega_o), 0.0), s) * L_s;

    // ambient light
    vec3 L_a = vec3(0.2);
    vec3 ambient_color = k_a * L_a;

    vertex_color = vec4(diffuse_color, 1.0) + vec4(specular_color, 1.0) + vec4(ambient_color, 1.0);
    gl_Position = projection_matrix * view_matrix * pos;
}
