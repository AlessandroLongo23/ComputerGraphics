precision mediump float;

varying vec2 fTexCoord;

uniform sampler2D groundTex;
uniform int isGround;
uniform int visibility;

void main() {
    if (isGround == 1) {
        gl_FragColor = texture2D(groundTex, fTexCoord);
        return;
    } 
    
    gl_FragColor = visibility == 1 ? vec4(1.0, 0.0, 0.0, 1.0) : vec4(0.0, 0.0, 0.0, 0.9);
}