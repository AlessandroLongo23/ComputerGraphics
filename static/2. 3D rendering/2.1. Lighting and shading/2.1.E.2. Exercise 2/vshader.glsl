attribute vec4 vPosition;
attribute vec4 vColor;
varying vec4 fColor;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vPosition;
    fColor = vColor;
}