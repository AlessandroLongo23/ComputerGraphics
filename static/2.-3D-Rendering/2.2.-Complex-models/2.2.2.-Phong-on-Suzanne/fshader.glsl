precision mediump float;

varying vec3 fPosition;
varying vec3 fNormal;

uniform vec3 eye;
uniform vec3 lightDirection;

void main() {
    vec3 n = normalize(fNormal);
    vec3 w_i = normalize(-lightDirection);

    // ambient
    float k = 0.2;
    float L = 1.0;
    vec3 ambient_color = k * vec3(L);

    // diffuse    
    float diffuse = max(dot(n, w_i), 0.0);
    vec3 diffuseColor = k * diffuse * vec3(L);
    
    // specular
    float ks = 0.2;
    float s = 100.0;
    vec3 w_r = reflect(-w_i, n);
    vec3 w_o = normalize(eye - fPosition);
    float specular = pow(max(dot(w_r, w_o), 0.0), s);
    vec3 specular_color = ks * specular * vec3(L);
    
    gl_FragColor = vec4(ambient_color + diffuseColor + specular_color, 1.0);
}
