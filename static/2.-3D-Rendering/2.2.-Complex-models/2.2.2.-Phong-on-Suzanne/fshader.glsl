precision mediump float;

varying vec3 fPosition;
varying vec3 fNormal;

uniform vec3 eye;
uniform vec3 lightDirection;

vec3 calcAmbientColor(float k, vec3 L);
vec3 calcDiffuseColor(vec3 n, vec3 w_i, float k, vec3 L);
vec3 calcSpecularColor(vec3 n, vec3 w_i, vec3 pos, float k, vec3 L, float s);

void main() {
    vec3 n = normalize(fNormal);
    vec3 w_i = normalize(-lightDirection);

    float k = 0.2;
    vec3 L = vec3(1.0);
    vec3 ambientColor = calcAmbientColor(k, L);
    vec3 diffuseColor = calcDiffuseColor(n, w_i, k, L);

    float ks = 0.2;
    float s = 100.0;
    vec3 specularColor = calcSpecularColor(n, w_i, fPosition, ks, L, s);
    
    gl_FragColor = vec4(ambientColor + diffuseColor + specularColor, 1.0);
}

vec3 calcAmbientColor(float k, vec3 L) {
    return k * L;
}

vec3 calcDiffuseColor(vec3 n, vec3 w_i, float k, vec3 L) {
    float diffuse = max(dot(n, w_i), 0.0);
    return k * diffuse * L;
}

vec3 calcSpecularColor(vec3 n, vec3 w_i, vec3 pos, float k, vec3 L, float s) {
    vec3 w_r = reflect(-w_i, n);
    vec3 w_o = normalize(eye - pos);
    float specular = pow(max(dot(w_r, w_o), 0.0), s);
    return k * specular * L;
}
