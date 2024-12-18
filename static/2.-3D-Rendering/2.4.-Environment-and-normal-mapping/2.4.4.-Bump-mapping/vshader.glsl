attribute vec4 vPosition;
attribute vec4 vNormal;

varying vec3 texCoords;
varying vec4 fPosition;
varying vec3 fNormal;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 texMatrix;

void main() {
    vec4 transformedPos = texMatrix * vPosition;
    texCoords = normalize(transformedPos.xyz / transformedPos.w);

    fPosition = vPosition;
    fNormal = normalize((modelMatrix * vec4(vNormal.xyz, 0.0)).xyz);
    
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vPosition;
}