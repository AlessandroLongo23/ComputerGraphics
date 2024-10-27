attribute vec4 vPosition;

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

uniform vec3 eyePos;
uniform vec3 lightDirection;
uniform float k;
uniform float L;
uniform float ks;
uniform float s;

varying vec4 vColor;

void main() {
    vec4 pos = modelMatrix * vPosition;
    vec3 n = normalize(pos.xyz);
    vec3 w_i = normalize(-lightDirection);

    // ambient lighting
    vec3 ambient_color = k * vec3(L);
    
    // diffuse lighting
    float diffuse = max(dot(n, -w_i), 0.0);
    vec3 diffuseColor = k * diffuse * vec3(L);

    // specular lighting
    vec3 w_r = reflect(w_i, n);
    vec3 w_o = normalize(eyePos - pos.xyz);
    float specular = pow(max(dot(w_r, w_o), 0.0), s);
    vec3 specular_color = ks * specular * vec3(L);

    // final color and position
    vColor = vec4(ambient_color + diffuseColor + specular_color, 1.0);
    gl_Position = projectionMatrix * viewMatrix * pos;
}