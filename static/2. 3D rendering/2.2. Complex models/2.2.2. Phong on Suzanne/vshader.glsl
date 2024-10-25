attribute vec4 vPosition;

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

varying vec3 fPosition;
varying vec3 fNormal;

void main() {
    vec4 worldPos = modelMatrix * vPosition;
    
    fPosition = worldPos.xyz;
    fNormal = normalize((modelMatrix * vec4(normalize(vPosition.xyz), 0.0)).xyz);
    
    gl_Position = projectionMatrix * viewMatrix * worldPos;
}