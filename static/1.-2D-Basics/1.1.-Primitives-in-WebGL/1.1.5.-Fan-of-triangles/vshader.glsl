precision mediump float;

attribute vec4 vPosition;
uniform vec2 pos;

void main() {
    gl_Position.x = vPosition.x + pos.x;
    gl_Position.y = vPosition.y + pos.y;
    gl_Position.z = 0.0;
    gl_Position.w = 1.0;
}