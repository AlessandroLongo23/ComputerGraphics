attribute vec4 vPosition;
attribute vec4 vNormal;

varying vec4 fColor;
varying vec4 fNormal;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

void main() {
    fNormal = normalize(modelMatrix * vNormal);
    
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vPosition;
}