precision mediump float;

varying vec2 fTexCoord;

uniform sampler2D groundTex;
uniform int isGround;
uniform int visibility;

void main() {
    gl_FragColor = isGround == 1 ? texture2D(groundTex, fTexCoord) : vec4(vec3(1.0, 0.0, 0.0) * float(visibility), 1.0);
}