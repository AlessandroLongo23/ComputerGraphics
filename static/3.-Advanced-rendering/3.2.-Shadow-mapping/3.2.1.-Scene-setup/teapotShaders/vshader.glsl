attribute vec4 vPosition;
attribute vec4 vNormal;

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

uniform vec3 light;
varying vec4 fColor;

void main() {
    vec4 pos = modelMatrix * vPosition;
    vec3 w_i = -normalize(light);

    // ambient lighting
    float k_a = 1.0;
    vec3 L_a = vec3(0.1);
    vec3 ambientColor = k_a * L_a;
    
    // diffuse lighting
    float k_d = 1.0;
    float diffuse = max(dot(vNormal.xyz, -w_i), 0.0);
    vec3 L_d = vec3(1.0);
    vec3 diffuseColor = k_d * diffuse * L_d;

    // final color and position
    fColor = vec4(ambientColor + diffuseColor, 1.0);
    gl_Position = projectionMatrix * viewMatrix * pos;
}