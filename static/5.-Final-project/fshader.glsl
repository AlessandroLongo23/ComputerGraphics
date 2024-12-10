precision mediump float;

varying vec3 cubeMapCoords;
varying vec2 texCoords;
varying vec3 fNormal;
varying vec4 fPosition;

uniform samplerCube cubeMap;

uniform sampler2D colorTexture;
uniform sampler2D normalTexture;
uniform sampler2D armTexture;
uniform sampler2D metalTexture;

uniform vec3 eye;
uniform vec3 lightDirection;
uniform bool reflective;

vec3 calcAmbientColor(float ka, vec3 La) {
    return ka * La;
}

vec3 calcDiffuseColor(vec3 n, vec3 w_i, float kd, vec3 Ld) {
    float diffuse = max(dot(n, -w_i), 0.0);
    return kd * diffuse * Ld;
}

vec3 calcSpecularColor(vec3 n, vec3 w_i, vec3 pos, float s, float ks, vec3 baseColor, vec3 Ls, float metal) {
    vec3 w_r = reflect(w_i, n);
    vec3 w_o = normalize(eye - pos);
    float specular = pow(max(dot(w_r, w_o), 0.0), s) * max(dot(n, -w_i), 0.0);
    
    vec3 specularColor = mix(vec3(1.0), baseColor, metal);
    return ks * specular * specularColor * Ls;
}

vec3 rotate_to_normal(vec3 n, vec3 v) {
    vec3 T = normalize(vec3(-n.z, 0, n.x));
    vec3 B = cross(n, T);
    mat3 TBN = mat3(T, B, n);
    return TBN * v;
}  

void main() {
    vec4 fColor;
    if (reflective) {
        vec3 baseColor = texture2D(colorTexture, texCoords).rgb;
        float ao = texture2D(armTexture, texCoords).r;
        float roughness = texture2D(armTexture, texCoords).g;
        float metal = texture2D(metalTexture, texCoords).r;

        vec3 N = normalize(fNormal);
        vec3 tangentNormal = texture2D(normalTexture, texCoords).rgb * 2.0 - 1.0;
        vec3 worldNormal = rotate_to_normal(N, tangentNormal);
        
        vec3 w_i = normalize(-lightDirection);
        vec3 viewDir = normalize(eye - fPosition.xyz);

        vec3 ambientColor = calcAmbientColor(0.2, vec3(1.0));
        vec3 diffuseColor = calcDiffuseColor(worldNormal, w_i, 1.0, vec3(1.0));

        float s = pow(1.0 - roughness, 4.0) * 128.0;
        float ks = mix(0.04, 1.0, metal);
        vec3 specularColor = calcSpecularColor(worldNormal, w_i, fPosition.xyz, s, ks, baseColor, vec3(1.0), metal);

        vec3 lightColor = ambientColor + diffuseColor + specularColor;

        // Calculate reflection vector in world space
        vec3 reflectionDirection = reflect(-viewDir, worldNormal);
        vec3 cubeMapReflection = textureCube(cubeMap, reflectionDirection).rgb;

        fColor = vec4(clamp(mix(baseColor, cubeMapReflection, metal) * ao * lightColor, 0.0, 1.0), 1.0);
    } else {
        fColor = textureCube(cubeMap, cubeMapCoords);
    }

    gl_FragColor = fColor;
}
