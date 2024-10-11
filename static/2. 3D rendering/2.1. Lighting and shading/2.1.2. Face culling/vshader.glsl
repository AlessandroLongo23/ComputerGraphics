attribute vec4 vPosition;
attribute vec4 vColor;
varying vec4 fColor;

uniform mat4 projection_matrix;
uniform mat4 model_view_matrix;

void main() {
    gl_Position = projection_matrix * model_view_matrix * vPosition;
    fColor = vColor;
}