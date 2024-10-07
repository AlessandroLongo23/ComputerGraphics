precision mediump float;

attribute vec4 vPosition;
uniform vec2 off;

void main() {
    gl_Position.x = vPosition.x + off.x;
    gl_Position.y = vPosition.y + off.y;
    gl_Position.z = 0.0;
    gl_Position.w = 1.0;
}