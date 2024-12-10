const initSphere = () => {
    sphereVertices = [];
    sphereNormals = [];

    thetaY = 0;

    const v0 = vec4(0.0, 0.0, -1.0, 1);
    const v1 = vec4(0.0, 0.942809, 0.333333, 1);
    const v2 = vec4(-0.816497, -0.471405, 0.333333, 1);
    const v3 = vec4(0.816497, -0.471405, 0.333333, 1);

    tetrahedron(v0, v1, v2, v3, 8);

    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(sphereVertices), gl.STATIC_DRAW);
    
    normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(sphereNormals), gl.STATIC_DRAW);
}

const tetrahedron = (a, b, c, d, n) => {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}

const divideTriangle = (a, b, c, count) => {
    if (count === 0) {
        triangle(a, b, c);
        return;
    }

    const ab = normalize(mix(a, b, 0.5), true);
    const ac = normalize(mix(a, c, 0.5), true);
    const bc = normalize(mix(b, c, 0.5), true);

    divideTriangle(a, ab, ac, count - 1);
    divideTriangle(ab, b, bc, count - 1);
    divideTriangle(bc, c, ac, count - 1);
    divideTriangle(ab, bc, ac, count - 1);
}

const triangle = (a, b, c) => {
    sphereVertices.push(a);
    sphereNormals.push(a);
    sphereVertices.push(b);
    sphereNormals.push(b);
    sphereVertices.push(c);
    sphereNormals.push(c);
}