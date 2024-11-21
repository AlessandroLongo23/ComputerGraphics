precision mediump float;

uniform sampler2D shadowMap;
uniform sampler2D groundTex;

varying vec2 fTexCoord;
varying vec4 vPositionFromLight;

void main() {
    vec3 shadowCoord = (vPositionFromLight.xyz / vPositionFromLight.w) / 2.0 + 0.5;
    vec4 rgbaDepth = texture2D(shadowMap, shadowCoord.xy);
    float depth = rgbaDepth.r;
    float visibility = (shadowCoord.z > depth) ? 0.5 : 1.0;

    vec4 fColor = texture2D(groundTex, fTexCoord);
    gl_FragColor = vec4(fColor.rgb * visibility, fColor.a);
}