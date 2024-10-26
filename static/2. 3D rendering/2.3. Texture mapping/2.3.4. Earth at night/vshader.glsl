attribute vec4 vPosition;
attribute vec4 vNormal;

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

uniform vec3 lightDirection;

uniform sampler2D heightTexMap;
uniform sampler2D moonHeightTexMap;

varying vec4 fColor;
varying vec4 fNormal;

const float PI = 3.141592653589793;

void main() {
    vec4 pos = modelMatrix * vPosition;
    
    // normal
    vec3 n = normalize(pos.xyz);
    // vec3 n = normalize()

    // texture
    float u = 0.5 + atan(n.x, n.z) / (2.0 * PI);
    float v = 0.5 - asin(n.y) / PI;
    vec2 texCoord = vec2(u, v);
    float height = texture2D(moonHeightTexMap, texCoord).r * 0.025;
    pos.x = pos.x + n.x * height;
    pos.y = pos.y + n.y * height;
    pos.z = pos.z + n.z * height;

    vec3 w_i = -normalize(lightDirection);

    float k_a = 0.1;
    vec3 L_a = vec3(1.0);
    vec3 ambientColor = L_a * k_a;
    
    float k_d = 1.0;
    float diffuse = max(dot(n, -w_i), 0.0);
    vec3 L_d = vec3(1.0);
    vec3 diffuseColor = k_d * diffuse * L_d;

    fNormal = vNormal;
    fColor = vec4(ambientColor + diffuseColor, 1.0);
    gl_Position = projectionMatrix * viewMatrix * pos;
}