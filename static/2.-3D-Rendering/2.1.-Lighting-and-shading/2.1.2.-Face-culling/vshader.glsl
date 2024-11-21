attribute vec4 vPosition;
attribute vec4 vColor;

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

varying vec4 fColor;

void main() {
    fColor = vColor;
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vPosition;
}