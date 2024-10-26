attribute vec4 vPosition;
attribute vec4 vNormal;

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

uniform vec3 lightDirection;

varying vec4 fColor;
varying vec4 fNormal;

void main() {
    vec4 pos = modelMatrix * vPosition;
    vec3 n = normalize(pos.xyz);
    vec3 w_i = -normalize(lightDirection);

    float k_a = 0.2;
    vec3 L_a = vec3(1.0);
    vec3 ambientColor = L_a * k_a;
    
    float k_d = 1.0;
    float diffuse = max(dot(n, -w_i), 0.0);
    vec3 L_d = vec3(1.0);
    vec3 diffuseColor = k_d * diffuse * L_d;

    fNormal = vNormal;
    fColor = vec4(ambientColor + diffuseColor, 1.0);
    gl_Position = projectionMatrix * viewMatrix * pos;
}