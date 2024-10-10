attribute vec4 vPosition;
attribute vec3 vNormal;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;

uniform vec3 lightDirection;

varying vec4 vertexColor;

void main() {
    vec3 transformedNormal = normalize(normalMatrix * vNormal);
    float diffuse = max(dot(transformedNormal, -lightDirection), 0.0);
    vec3 diffuseColor = diffuse * vec3(1.0, 1.0, 1.0);
    vertexColor = vec4(diffuseColor, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vPosition;
}
