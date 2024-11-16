attribute vec4 vPosition;
attribute vec2 vTexCoord;

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

varying vec2 fTexCoord;

void main() {
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vPosition;
    fTexCoord = vTexCoord;
}