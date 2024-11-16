attribute vec4 vPosition;

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

uniform vec3 eye;
uniform vec3 lightDirection;
uniform float k;
uniform float L;
uniform float ks;
uniform float s;

varying vec4 vColor;

vec3 calcAmbientColor();
vec3 calcDiffuseColor(vec3 n, vec3 w_i);
vec3 calcSpecularColor(vec3 n, vec3 w_i, vec4 pos);

void main() {
    vec4 pos = modelMatrix * vPosition;
    vec3 n = normalize(pos.xyz);
    vec3 w_i = normalize(-lightDirection);

    vec3 ambientColor = calcAmbientColor();
    vec3 diffuseColor = calcDiffuseColor(n, w_i);
    vec3 specularColor = calcSpecularColor(n, w_i, pos);

    vColor = vec4(ambientColor + diffuseColor + specularColor, 1.0);
    gl_Position = projectionMatrix * viewMatrix * pos;
}

vec3 calcAmbientColor() {
    return k * vec3(L);
}

vec3 calcDiffuseColor(vec3 n, vec3 w_i) {
    float diffuse = max(dot(n, -w_i), 0.0);
    return k * diffuse * vec3(L);
}

vec3 calcSpecularColor(vec3 n, vec3 w_i, vec4 pos) {
    vec3 w_r = reflect(w_i, n);
    vec3 w_o = normalize(eye - pos.xyz);
    float specular = pow(max(dot(w_r, w_o), 0.0), s);
    return ks * specular * vec3(L);
}