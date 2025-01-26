const initCubeMap = (cubemapPack) => {
    if (cubeTexture)
        gl.deleteTexture(cubeTexture);

    cubeTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeTexture);
    
    const faces = [
        { target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, url: '../assets/textures/cubemaps/' + cubemapPack + '/posx.png' },
        { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, url: '../assets/textures/cubemaps/' + cubemapPack + '/negx.png' },
        { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, url: '../assets/textures/cubemaps/' + cubemapPack + '/posy.png' },
        { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, url: '../assets/textures/cubemaps/' + cubemapPack + '/negy.png' },
        { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, url: '../assets/textures/cubemaps/' + cubemapPack + '/posz.png' },
        { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, url: '../assets/textures/cubemaps/' + cubemapPack + '/negz.png' }
    ];

    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    faces.forEach(face => {
        gl.texImage2D(face.target, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
    });

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);

    let loadedImages = 0;
    const images = faces.map(face => {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => {
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeTexture);
                gl.texImage2D(face.target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
                loadedImages++;
                resolve();
            };
            image.onerror = () => {
                console.error(`Failed to load cubemap texture: ${face.url}`);
                reject(new Error(`Failed to load ${face.url}`));
            };
            image.src = face.url;
        });
    });

    Promise.all(images)
        .then(() => {
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeTexture);
            gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        })
        .catch(error => {
            console.error('Error loading cubemap:', error);
        });

    const cubeMapLoc = gl.getUniformLocation(program, "cubeMap");
    gl.uniform1i(cubeMapLoc, 0);
}

const initTextures = (texturePack) => {
    initTexture("../assets/textures/PBRpacks/" + texturePack + "/textures/" + texturePack.slice(0, -2) + "diff_" + texturePack.slice(-2) + ".jpg", "albedoMap", 1);
    initTexture("../assets/textures/PBRpacks/" + texturePack + "/textures/" + texturePack.slice(0, -2) + "disp_" + texturePack.slice(-2) + ".jpg", "displacementTexture", 2);
    initTexture("../assets/textures/PBRpacks/" + texturePack + "/textures/" + texturePack.slice(0, -2) + "nor_gl_" + texturePack.slice(-2) + ".png", "normalTexture", 3);
    initTexture("../assets/textures/PBRpacks/" + texturePack + "/textures/" + texturePack.slice(0, -2) + "arm_" + texturePack.slice(-2) + ".jpg", "armTexture", 4);
    initTexture("../assets/textures/PBRpacks/" + texturePack + "/textures/" + texturePack.slice(0, -2) + "metal_" + texturePack.slice(-2) + ".jpg", "metalTexture", 5);
}

const initTexture = (srcPath, shader_keyword, textureUnit) => {
    gl.activeTexture(gl[`TEXTURE${textureUnit}`]);
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

    const textureLoc = gl.getUniformLocation(program, shader_keyword);
    gl.uniform1i(textureLoc, textureUnit);

    const myTexels = new Image();
    myTexels.texture = texture;
    myTexels.onload = (event) => {
        gl.activeTexture(gl[`TEXTURE${textureUnit}`]);
        gl.bindTexture(gl.TEXTURE_2D, event.target.texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, myTexels);
        gl.generateMipmap(gl.TEXTURE_2D);
    };
    myTexels.src = srcPath;
};

const initModel = (model) => {
    modelLoaded = false;

    if (model === 'sphere') {
        initSphere();
        modelLoaded = true;
        yOffset = 0.0;
    } else {
        switch (model) {
            case 'sphere':
                scale = 1.0;
                yOffset = 0.0;
                reverse = false;
                break;
            case 'teapot':
                scale = .5;
                yOffset = 0.5;
                reverse = false;
                break;
            case 'suzanne':
                scale = 1.0;
                yOffset = 0.0;
                reverse = false;
                break;
            case 'pumpkin':
                scale = 0.01;
                yOffset = 0.5;
                reverse = true;
                break;
            case 'marble_bust':
                scale = 4;
                yOffset = 1;
                reverse = false;
                break;
            case 'rubber_duck':
                scale = 6;
                yOffset = 1;
                reverse = false;
                break;
            case 'watering_can':
                scale = 6;
                yOffset = 0.5;
                reverse = false;
                break;
        }

        readOBJFile(fileName = '../assets/models/' + model + '.obj', scale = scale, reverse = reverse)
            .then(objInfo => {
                obj = objInfo;

                var newVertices = [];
                var newNormals = [];
                for (let i = 0; i < obj.vertices.length; i++) {
                    if (i % 4 != 3) {
                        newVertices.push(obj.vertices[i]);
                        newNormals.push(obj.normals[i]);
                    }
                }
        
                obj.vertices = newVertices;
                obj.normals = newNormals;
        
                vertexBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, flatten(obj.vertices), gl.STATIC_DRAW);
                var vPosition = gl.getAttribLocation(program, "vPosition");
                gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(vPosition);
        
                normalBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, flatten(obj.normals), gl.STATIC_DRAW);
                var vNormal = gl.getAttribLocation(program, "vNormal");
                gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(vNormal);
        
                var indices = new Uint16Array(obj.indices);
                var iBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
        
                modelLoaded = true;
            })
            .catch(error => {
                console.error("Error loading OBJ file:", error);
            });
    }
};