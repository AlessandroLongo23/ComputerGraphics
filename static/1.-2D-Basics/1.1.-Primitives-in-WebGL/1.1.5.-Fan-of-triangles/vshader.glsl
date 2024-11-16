precision mediump float;

attribute vec4 vPosition;
uniform vec2 pos;

void main() {
    gl_Position = vec4(
        vPosition.x + pos.x,
        vPosition.y + pos.y,
        0.0,
        1.0
    );
}