precision mediump float;

varying vec2 fTexCoord;

uniform sampler2D groundTex;
uniform sampler2D redTex;
uniform int isGround;
uniform vec3 fColor;

void main() {
    gl_FragColor = isGround == 1 ? texture2D(groundTex, fTexCoord) : vec4(fColor, 1.0);
}