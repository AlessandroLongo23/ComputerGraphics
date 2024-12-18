attribute vec4 vPosition;
attribute vec4 vNormal;

varying vec3 cubeMapCoords;
varying vec2 texCoords;
varying vec3 fNormal;
varying vec4 fPosition;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 texMatrix;

uniform sampler2D displacementTexture;
uniform float displacementScale;
uniform float patternRepeat;
uniform bool reflective;

const float PI = 3.141592653589793;

void main() {
    vec4 transformedPos = texMatrix * vPosition;
    cubeMapCoords = normalize(transformedPos.xyz / transformedPos.w);

    if (reflective) {
        fNormal = normalize((modelMatrix * vec4(vNormal.xyz, 0.0)).xyz);

        vec4 worldPos = modelMatrix * vPosition;
        cubeMapCoords = normalize(worldPos.xyz);

        texCoords = vec2(
            (0.5 + (atan(cubeMapCoords.x, cubeMapCoords.z) / (2.0 * PI))) * patternRepeat,
            (0.5 - (asin(-cubeMapCoords.y) / PI)) * patternRepeat
        );

        float displacement = texture2D(displacementTexture, texCoords).r;
        vec3 displacedPos = worldPos.xyz + fNormal.xyz * displacement * displacementScale / patternRepeat;
        fPosition = vec4(displacedPos, 1.0);
        gl_Position = projectionMatrix * viewMatrix * vec4(displacedPos, 1.0);
    } else {
        gl_Position = projectionMatrix * viewMatrix * vPosition;
    }
}
