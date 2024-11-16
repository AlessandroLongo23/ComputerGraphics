attribute vec4 vPosition;

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

uniform vec3 lightDirection;

varying vec4 vColor;

vec3 calcDiffuseColor(vec3 n, vec3 w_i, float k);

void main() {
    vec3 n = normalize(pos.xyz);
    vec3 w_i = -normalize(lightDirection);
    
    vec3 diffuseColor = calcDiffuseColor(n, w_i, 1.0);

    vColor = vec4(diffuseColor, 1.0);
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vPosition;
}

vec3 calcDiffuseColor(vec3 n, vec3 w_i, float k) {
    float diffuse = max(dot(n, -w_i), 0.0);
    return k * diffuse * vec3(L);
}


