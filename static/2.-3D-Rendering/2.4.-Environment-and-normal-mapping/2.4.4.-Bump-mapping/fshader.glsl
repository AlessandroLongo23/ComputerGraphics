precision mediump float;

varying vec3 texCoords;
varying vec4 fPosition;
varying vec3 fNormal;

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
        vec2 uvCoords = vec2(
            0.5 + (atan(fNormal.x, fNormal.z) / (2.0 * PI)),
            0.5 - (asin(-fNormal.y) / PI)
        );

        vec3 tangentNormal = texture2D(bumpMap, uvCoords).rgb * 2.0 - 1.0;
        vec3 worldNormal = rotate_to_normal(fNormal, tangentNormal);
        vec3 incidentDirection = fPosition.xyz - eye;
        vec3 reflectionDirection = reflect(incidentDirection, worldNormal);
        fColor = textureCube(cubeMap, reflectionDirection);
    } else {
        fColor = textureCube(cubeMap, texCoords);
    }

    gl_FragColor = fColor;
}