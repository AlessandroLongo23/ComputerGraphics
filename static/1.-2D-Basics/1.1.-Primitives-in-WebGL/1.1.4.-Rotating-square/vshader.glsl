precision mediump float;

attribute vec4 vPosition;
uniform float theta;

void main() {
    gl_Position = vec4(
        -sin(theta) * vPosition.x + cos(theta) * vPosition.y,
        sin(theta) * vPosition.y + cos(theta) * vPosition.x,
        0.0,
        1.0
    );
}