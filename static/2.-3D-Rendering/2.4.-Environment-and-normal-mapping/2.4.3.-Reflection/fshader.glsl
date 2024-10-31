precision mediump float;

varying vec3 texCoords;
varying vec4 fPosition;
uniform samplerCube cubeMap;

uniform vec3 eye;
uniform bool reflective;

void main() {
    vec4 fColor;
    if (reflective) {
        vec3 incidentDirection = fPosition.xyz - eye;
        vec3 reflectionDirection = reflect(incidentDirection, fPosition.xyz);
        fColor = textureCube(cubeMap, reflectionDirection);
    } else {
        fColor = textureCube(cubeMap, texCoords);
    }

    gl_FragColor = fColor;
}