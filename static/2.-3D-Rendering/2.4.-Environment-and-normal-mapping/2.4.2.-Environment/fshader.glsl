precision mediump float;

varying vec3 texCoords;
uniform samplerCube cubeMap;

void main() {
    gl_FragColor = textureCube(cubeMap, texCoords);
}