attribute vec4 vPosition;
attribute vec4 vNormal;

varying vec3 texCoords;
varying vec4 fPosition;
varying vec4 fNormal;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 texMatrix;

void main() {
    vec4 transformedPos = texMatrix * vPosition;
    texCoords = normalize(transformedPos.xyz / transformedPos.w);

    fPosition = vPosition;
    fNormal = vNormal;
    
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vPosition;
}