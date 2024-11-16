precision mediump float;

varying vec2 fTexCoord;

uniform sampler2D groundTex;
uniform int isShadow;

void main() {
    if (isShadow == 1) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    } else {
        gl_FragColor = texture2D(groundTex, fTexCoord);
    }
}