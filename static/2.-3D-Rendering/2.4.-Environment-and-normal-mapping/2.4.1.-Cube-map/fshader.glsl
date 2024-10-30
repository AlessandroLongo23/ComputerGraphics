precision mediump float;

varying vec4 fNormal;
uniform samplerCube cubeMap;

void main() {
    vec3 normal = normalize(fNormal.xyz);
    gl_FragColor = textureCube(cubeMap, normal);
}