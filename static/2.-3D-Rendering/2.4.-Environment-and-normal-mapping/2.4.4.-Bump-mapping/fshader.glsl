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
    float sgn_nz = sign(n.z + 1.0e-16);
    float a = -1.0 / (1.0 + abs(n.z));
    float b = n.x * n.y * a;
    return vec3(1.0 + n.x * n.x * a, b, -sgn_nz * n.x) * v.x + vec3(sgn_nz * b, sgn_nz * (1.0 + n.y * n.y * a), -n.y) * v.y + n * v.z;
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