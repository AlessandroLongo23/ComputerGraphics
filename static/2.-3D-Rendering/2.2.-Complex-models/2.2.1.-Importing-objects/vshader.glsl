attribute vec4 vPosition;
attribute vec4 vNormal;

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

uniform vec3 leftLight;
uniform vec3 rightLight;

varying vec4 fColor;

vec3 calcAmbientColor(float k, vec3 L);
vec3 calcDiffuseColor(vec3 n, vec3 w_i, float k, vec3 L);

void main() {
    vec4 pos = modelMatrix * vPosition;
    vec3 w_li = -normalize(leftLight);
    vec3 w_ri = -normalize(rightLight);

    float k_a = 1.0;
    vec3 L_a = vec3(0.1);
    vec3 ambientColor = calcAmbientColor(k_a, L_a);
    
    float k_d = 0.75;
    vec3 L_ld = vec3(0.0, 0.0, 1.0);
    vec3 leftDiffuseColor = calcDiffuseColor(vNormal.xyz, w_li, k_d, L_ld);

    vec3 L_rd = vec3(1.0, 0.0, 0.8);
    vec3 rightDiffuseColor = calcDiffuseColor(vNormal.xyz, w_ri, k_d, L_rd);

    vec3 diffuseColor = leftDiffuseColor + rightDiffuseColor;
    fColor = vec4(ambientColor + diffuseColor, 1.0);
    gl_Position = projectionMatrix * viewMatrix * pos;
}

vec3 calcAmbientColor(float k, vec3 L) {
    return k * vec3(L);
}

vec3 calcDiffuseColor(vec3 n, vec3 w_i, float k, vec3 L) {
    float diffuse = max(dot(n, -w_i), 0.0);
    return k * diffuse * vec3(L);
}