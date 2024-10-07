precision mediump float;

varying vec4 vertexColor;  // Interpolated color from vertex shader

void main() {
    // Set the color for this fragment
    gl_FragColor = vertexColor;
}
