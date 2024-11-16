precision mediump float;

varying vec4 fColor;
varying vec4 fNormal;
varying vec2 fTexCoord;
uniform sampler2D texMap;

const float PI = 3.141592653589793;

void main() {
    vec3 n = normalize(fNormal.xyz);
    
    float u = 0.5 + (atan(n.x, n.z) / (2.0 * PI));
    float v = 0.5 - (asin(-n.y) / PI);
    
    vec2 texCoord = vec2(u, v);
    gl_FragColor = fColor * texture2D(texMap, texCoord);
}