precision mediump float;

varying vec3 fPosition;
varying vec3 fNormal;

uniform vec3 eye;
uniform vec3 lightDirection;
uniform float k;
uniform float L;
uniform float ks;
uniform float s;

void main() {
    vec3 n = normalize(fNormal);
    vec3 w_i = normalize(-lightDirection);

    // ambient
    vec3 ambient_color = k * vec3(L);

    // diffuse    
    float diffuse = max(dot(n, -w_i), 0.0);
    vec3 diffuseColor = k * diffuse * vec3(L);
    
    // specular
    vec3 w_r = reflect(w_i, n);
    vec3 w_o = normalize(eye - fPosition);
    float specular = pow(max(dot(w_r, w_o), 0.0), s);
    vec3 specular_color = ks * specular * vec3(L);
    
    gl_FragColor = vec4(ambient_color + diffuseColor + specular_color, 1.0);
}
