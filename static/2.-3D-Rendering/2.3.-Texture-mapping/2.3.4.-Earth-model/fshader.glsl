precision mediump float;

varying vec4 fColor;
varying vec4 fNormal;
varying vec2 fTexCoord;

uniform sampler2D earthTexMap;
uniform sampler2D nightTexMap;
uniform sampler2D cloudTexMap;
uniform sampler2D moonTexMap;

uniform sampler2D spaceTexMap;

const float PI = 3.141592653589793;

vec4 renderEarth(vec2 texCoord);
vec4 renderMoon(vec2 texCoord);

void main() {
    vec3 n = normalize(fNormal.xyz);
    float u = 0.5 + atan(n.x, n.z) / (2.0 * PI);
    float v = 0.5 - asin(n.y) / PI;
    vec2 texCoord = vec2(u, v);

    gl_FragColor = renderEarth(texCoord);
    // gl_FragColor = renderMoon(texCoord);
}

vec4 renderEarth(vec2 texCoord) {
    vec4 baseColor = fColor * texture2D(earthTexMap, texCoord);
    vec4 nightColor = (vec4(1.0) - fColor) * texture2D(nightTexMap, texCoord);
    vec4 cloudColor = fColor * texture2D(cloudTexMap, texCoord);

    return baseColor + nightColor + cloudColor;
}

vec4 renderMoon(vec2 texCoord) {
    return fColor * texture2D(moonTexMap, texCoord);
}