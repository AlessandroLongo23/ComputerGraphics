attribute vec4 vPosition;
attribute vec4 vNormal;

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

varying vec3 fPosition;
varying vec3 fNormal;

void main() {
    vec4 worldPos = modelMatrix * vPosition;
    
    fPosition = worldPos.xyz;
    fNormal = vNormal.xyz;
    
    gl_Position = projectionMatrix * viewMatrix * worldPos;
}