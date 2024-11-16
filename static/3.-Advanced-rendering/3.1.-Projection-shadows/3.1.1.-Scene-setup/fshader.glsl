precision mediump float;

varying vec2 fTexCoord;
uniform sampler2D groundTex;
uniform sampler2D redTex;
uniform int isGround;

void main() {
    gl_FragColor = isGround == 1 ? texture2D(groundTex, fTexCoord) : texture2D(redTex, fTexCoord);
}