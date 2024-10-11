attribute vec4 vPosition;
attribute vec4 vColor;
varying vec4 fColor;
uniform mat4 model_view_matrix;

void main() {
    fColor = vColor;
    gl_Position = model_view_matrix * vPosition;
}