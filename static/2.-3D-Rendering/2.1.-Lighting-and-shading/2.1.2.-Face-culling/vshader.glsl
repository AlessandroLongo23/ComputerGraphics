attribute vec4 vPosition;
attribute vec4 vColor;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

varying vec4 fColor;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vPosition;
    fColor = vColor;
}