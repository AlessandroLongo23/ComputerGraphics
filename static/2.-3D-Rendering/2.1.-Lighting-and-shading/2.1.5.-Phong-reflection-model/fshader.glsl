precision mediump float;

varying vec3 fPosition;
varying vec3 fNormal;

uniform vec3 eye;
uniform vec3 lightDirection;
uniform float k;
uniform float L;
uniform float ks;
uniform float s;

vec3 calcAmbientColor();
vec3 calcDiffuseColor(vec3 n, vec3 w_i);
vec3 calcSpecularColor(vec3 n, vec3 w_i, vec3 pos);

void main() {
    vec3 n = normalize(fNormal);
    vec3 w_i = normalize(-lightDirection);

    vec3 ambientColor = calcAmbientColor();
    vec3 diffuseColor = calcDiffuseColor(n, w_i);
    vec3 specularColor = calcSpecularColor(n, w_i, fPosition);
    
    gl_FragColor = vec4(ambientColor + diffuseColor + specularColor, 1.0);
}

vec3 calcAmbientColor() {
    return k * vec3(L);
}

vec3 calcDiffuseColor(vec3 n, vec3 w_i) {
    float diffuse = max(dot(n, -w_i), 0.0);
    return k * diffuse * vec3(L);
}

vec3 calcSpecularColor(vec3 n, vec3 w_i, vec3 pos) {
    vec3 w_r = reflect(w_i, n);
    vec3 w_o = normalize(eye - pos.xyz);
    float specular = pow(max(dot(w_r, w_o), 0.0), s);
    return ks * specular * vec3(L);
}