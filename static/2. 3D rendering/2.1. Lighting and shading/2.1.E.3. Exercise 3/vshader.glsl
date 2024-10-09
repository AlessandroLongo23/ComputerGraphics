attribute vec4 vPosition;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

uniform vec3 lightDirection;

varying vec4 vertexColor;

void main() {
    vec3 normal = normalize(vPosition.xyz);
    float k_d = 0.8;
    float diffuse = max(dot(normal, -lightDirection), 0.0);
    vec3 diffuseColor = k_d * diffuse * vec3(1.0, 1.0, 1.0);
    vertexColor = vec4(diffuseColor, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vPosition;
}
