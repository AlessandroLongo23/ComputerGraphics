precision mediump float;

varying vec3 texCoords;
varying vec4 fPosition;
uniform samplerCube cubeMap;

uniform vec3 eye;
uniform bool reflective;

void main() {
    if (reflective) {
        vec3 incidentDirection = fPosition.xyz - eye;
        vec3 reflectionDirection = reflect(incidentDirection, fPosition.xyz);
        gl_FragColor = textureCube(cubeMap, reflectionDirection);
    } else {
        gl_FragColor = textureCube(cubeMap, texCoords);
    }
}