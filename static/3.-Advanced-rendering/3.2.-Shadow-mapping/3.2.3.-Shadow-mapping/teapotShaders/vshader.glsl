attribute vec4 vPosition;
attribute vec4 vNormal;

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

uniform mat4 projectionMatrixFromLight;
uniform mat4 viewMatrixFromLight;
uniform mat4 modelMatrixFromLight;

uniform vec3 light;
varying vec4 fColor;
varying vec4 vPositionFromLight;

void main() {
    vec4 pos = modelMatrix * vPosition;
    vec3 w_i = -normalize(light);

    float k_a = 1.0;
    vec3 L_a = vec3(0.1);
    vec3 ambientColor = k_a * L_a;
    
    float k_d = 1.0;
    float diffuse = max(dot(vNormal.xyz, -w_i), 0.0);
    vec3 L_d = vec3(1.0);
    vec3 diffuseColor = k_d * diffuse * L_d;

    fColor = vec4(ambientColor + diffuseColor, 1.0);
    gl_Position = projectionMatrix * viewMatrix * pos;
    vPositionFromLight = projectionMatrixFromLight * viewMatrixFromLight * modelMatrixFromLight * vPosition;
}