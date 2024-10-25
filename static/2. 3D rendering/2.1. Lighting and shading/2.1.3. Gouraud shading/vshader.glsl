attribute vec4 vPosition;

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

uniform vec3 lightDirection;

varying vec4 vertex_color;

void main() {
    vec4 pos = modelMatrix * vPosition;
    vec3 n = normalize(pos.xyz);
    vec3 w_i = -normalize(lightDirection);
    
    // diffuse lighting
    float k_d = 1.0;
    float diffuse = max(dot(n, -w_i), 0.0);
    vec3 L_d = vec3(1.0);
    vec3 diffuse_color = k_d * diffuse * L_d;

    // final color and position
    vertex_color = vec4(diffuse_color, 1.0);
    gl_Position = projectionMatrix * viewMatrix * pos;
}