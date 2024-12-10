precision mediump float;

varying vec3 texCoords;
varying vec4 fPosition;
varying vec4 fNormal;

uniform samplerCube cubeMap;
uniform sampler2D bumpMap;

uniform vec3 eye;
uniform bool reflective;

const float PI = 3.141592653589793;

vec3 rotate_to_normal(vec3 n, vec3 v) {
    vec3 T = normalize(vec3(-n.z, 0, n.x));
    vec3 B = cross(n, T);
    mat3 TBN = mat3(T, B, n);
    return TBN * v;
}  

void main() {
    vec4 fColor;
    if (reflective) {
        vec3 n = normalize(fNormal.xyz);
        float u = 0.5 + (atan(n.x, n.z) / (2.0 * PI));
        float v = 0.5 - (asin(-n.y) / PI);
        vec2 texCoord = vec2(u, v);

        n = texture2D(bumpMap, texCoord).xyz;
        n = rotate_to_normal(fNormal.xyz, n);
        vec3 incidentDirection = fPosition.xyz - eye;
        vec3 reflectionDirection = reflect(incidentDirection, n);
        fColor = textureCube(cubeMap, reflectionDirection);
    } else {
        fColor = textureCube(cubeMap, texCoords);
    }

    gl_FragColor = fColor;
}