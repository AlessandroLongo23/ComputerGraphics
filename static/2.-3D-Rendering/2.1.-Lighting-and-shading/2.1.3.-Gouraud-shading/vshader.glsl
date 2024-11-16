attribute vec4 vPosition;

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

uniform vec3 lightDirection;

varying vec4 vColor;

void main() {
    vec4 pos = modelMatrix * vPosition;
    vec3 n = normalize(pos.xyz);
    vec3 w_i = -normalize(lightDirection);
    
    float k_d = 1.0;
    float diffuse = max(dot(n, -w_i), 0.0);
    vec3 L_d = vec3(1.0);
    vec3 diffuseColor = k_d * diffuse * L_d;

    vColor = vec4(diffuseColor, 1.0);
    gl_Position = projectionMatrix * viewMatrix * pos;
}