attribute vec4 vPosition;
attribute vec2 vTexCoord;

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

uniform mat4 projectionMatrixFromLight;
uniform mat4 viewMatrixFromLight;
uniform mat4 modelMatrixFromLight;

varying vec2 fTexCoord;
varying vec4 vPositionFromLight;

void main() {
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vPosition;
    vPositionFromLight = projectionMatrixFromLight * viewMatrixFromLight * modelMatrixFromLight * vPosition;
    fTexCoord = vTexCoord;
}