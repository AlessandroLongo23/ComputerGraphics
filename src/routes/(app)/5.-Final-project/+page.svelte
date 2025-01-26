<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { Code, Play, Download } from 'lucide-svelte';
    import { WebGLUtils, fetchCodeSnippets, initShaders, convertToLatex } from '$lib/utils.svelte.js';
    import { readOBJFile } from '$lib/Libraries/OBJParser.js';
    import { vec2, vec3, vec4, mat4, perspective, flatten, lookAt, normalize, mix, mult, translate, inverse } from '$lib/Libraries/MV.js';
    import Result from '$lib/components/Result.svelte';
    import Select from '$lib/components/UI/Select.svelte';
    import Slider from '$lib/components/UI/Slider.svelte';
    import Counter from '$lib/components/UI/Counter.svelte';
    // import Admonition from '$lib/components/UI/Admonition.svelte';

    let modelOptions = [
        {
            value: 'sphere',
            label: 'Sphere',
        },
        {
            value: 'suzanne',
            label: 'Suzanne',
        },
        {
            value: 'teapot',
            label: 'Teapot',
        },
        {
            value: 'pumpkin',
            label: 'Pumpkin',
        },
        {
            value: 'marble_bust',
            label: 'Marble Bust',
        },
        {
            value: 'rubber_duck',
            label: 'Rubber Duck',
        },
        {
            value: 'watering_can',
            label: 'Watering Can',
        }
    ];

    let texturePackOptions = [
        {
            value: 'bark_willow_02_2k',
            label: 'Bark Willow',
        },
        {
            value: 'blue_metal_plate_2k',
            label: 'Blue Metal Plate',
        },
        {
            value: 'brick_wall_04_2k',
            label: 'Brick Wall',
        },
        {
            value: 'concrete_wall_007_2k',
            label: 'Concrete Wall',
        },
        {
            value: 'corrugated_iron_2k',
            label: 'Corrugated Iron',
        },
        {
            value: 'denim_fabric_02_2k',
            label: 'Denim Fabric',
        },
        {
            value: 'fabric_leather_02_2k',
            label: 'Fabric Leather',
        },
        {
            value: 'fabric_pattern_07_2k',
            label: 'Fabric Pattern',
        },        
        {
            value: 'ganges_river_pebbles_2k',
            label: 'Ganges River Pebbles',
        },
        {
            value: 'gravel_stones_2k',
            label: 'Gravel Stones',
        },
        {
            value: 'gray_rocks_2k',
            label: 'Gray Rocks',
        },
        {
            value: 'herringbone_brick_2k',
            label: 'Herringbone Brick',
        },
        {
            value: 'metal_plate_2k',
            label: 'Metal Plate',
        },
        {
            value: 'metal_plate_02_2k',
            label: 'Metal Plate 2',
        },
        {
            value: 'mud_cracked_dry_riverbed_002_2k',
            label: 'Mud Cracked Dry Riverbed',
        },
        {
            value: 'oak_veneer_01_2k',
            label: 'Oak Veneer',
        },        
        {
            value: 'raw_plank_wall_2k',
            label: 'Raw Plank Wall',
        },
        {
            value: 'recycled_brick_floor_2k',
            label: 'Recycled Brick Floor',
        },
        {
            value: 'rock_embedded_concrete_wall_2k',
            label: 'Rock Embedded Concrete Wall',
        }
    ]

    let cubemapOptions = [
        {
            value: 'autumn',
            label: 'Autumn',
        },
        {
            value: 'brightday',
            label: 'Bright Day',
        },
        {
            value: 'greenhill',
            label: 'Green Hill',
        },
        {
            value: 'nvidia',
            label: 'Nvidia',
        },
        {
            value: 'terrain',
            label: 'Terrain',
        }
    ];

    let viewIndex = $state(1);
    let isLoading = $state(true);
    let canvas = $state();
    let gl, program;
    let codeSnippets = $state([]);

    let numRepeats = $state(1);
    let displacementScale = $state(0.0);
    let model = $state('sphere');
    let obj, isModelLoaded, yOffset;
    let texturePack = $state('metal_plate_02_2k');
    let cubemapPack = $state('autumn');
    let cubeTexture;
    let theta, minDist, dist, maxDist, scale, reverse;
    let isLeftButtonDown, prevMouse;
    let viewMatrixLoc, modelMatrixLoc, projectionMatrixLoc, texMatrixLoc, eyeLoc, reflectiveLoc, displacementScaleLoc, patternRepeatLoc;
    let projectionMatrix, viewMatrix, modelMatrix, texMatrix;
    let eye, at, up;
    let backgroundBuffer, vertexBuffer, normalBuffer;
    let sphereVertices, sphereNormals;

    let textureObjects = {
        colorTexture: null,
        displacementTexture: null,
        normalTexture: null,
        armTexture: null,
        metalTexture: null
    };

    onMount(async () => {
        if (typeof window !== 'undefined') {
            convertToLatex();

            gl = WebGLUtils.setupWebGL(canvas);

            gl.enable(gl.DEPTH_TEST);
            gl.enable(gl.CULL_FACE);
            gl.cullFace(gl.FRONT);

            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);

            program = await initShaders(gl, program, $page.url.pathname + '/vshader.glsl', $page.url.pathname + '/fshader.glsl');

            obj = null;
            isModelLoaded = false;
            yOffset = 0.0;
            cubeTexture = null;

            configureWebGL();
            initEventHandlers(document.getElementById("gl-canvas"));

            minDist = 3.0;
            dist = 4.0;
            maxDist = 10.0;
            initUniforms();
            initMatrices();
            
            initBackgroundQuad();
            initModel(model);
            if (program) {
                initCubeMap(cubemapPack);
                initTextures(texturePack);
            }

            initLight();

            render();

            codeSnippets = await fetchCodeSnippets([
                {
                    name: 'main.js',
                    language: 'JavaScript',
                    path: $page.url.pathname + '/main.js'
                },
                {
                    name: 'loaders.js',
                    language: 'JavaScript',
                    path: $page.url.pathname + '/loaders.js'
                },
                {
                    name: 'sphere.js',
                    language: 'JavaScript',
                    path: $page.url.pathname + '/sphere.js'
                },
                {
                    name: 'index.html',
                    language: 'HTML',
                    path: $page.url.pathname + '/index.html'
                },
                {
                    name: 'vShader.glsl',
                    language: 'GLSL',
                    path: $page.url.pathname + '/vshader.glsl'
                },
                {
                    name: 'fShader.glsl',
                    language: 'GLSL',
                    path: $page.url.pathname + '/fshader.glsl'
                },
            ]);
            isLoading = false;
        }
    });

    const initBackgroundQuad = () => {
        const backgroundVertices = [
            vec4(-1.0, -1.0, 0.999, 1.0),
            vec4(1.0, 1.0, 0.999, 1.0),
            vec4(1.0, -1.0, 0.999, 1.0),
            vec4(-1.0, -1.0, 0.999, 1.0),
            vec4(-1.0, 1.0, 0.999, 1.0),
            vec4(1.0, 1.0, 0.999, 1.0),
        ];

        backgroundBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, backgroundBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(backgroundVertices), gl.STATIC_DRAW);
    }

    const configureWebGL = () => {
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.FRONT);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0.0, 0.0, 0.0, 0.0);
    }

    const initMatrices = () => {
        theta[0] = Math.PI / 6.0;
        theta[1] = Math.PI / 15.0;

        at = vec3(0.0, 0.0, 0.0);
        up = vec3(0.0, 1.0, 0.0);
    }

    const initUniforms = () => {
        viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix");
        modelMatrixLoc = gl.getUniformLocation(program, "modelMatrix");
        projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
        texMatrixLoc = gl.getUniformLocation(program, "texMatrix");

        eyeLoc = gl.getUniformLocation(program, "eye");
        reflectiveLoc = gl.getUniformLocation(program, "reflective");

        displacementScaleLoc = gl.getUniformLocation(program, "displacementScale");
        gl.uniform1f(displacementScaleLoc, displacementScale);

        patternRepeatLoc = gl.getUniformLocation(program, "patternRepeat");
        gl.uniform1f(patternRepeatLoc, numRepeats);

        projectionMatrix = perspective(60, canvas.width / canvas.height, 0.1, 100.0);
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

        modelMatrix = mat4();
        gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
    }

    $effect(() => {
        gl.uniform1f(patternRepeatLoc, numRepeats);
    });

    $effect(() => {
        gl.uniform1f(displacementScaleLoc, displacementScale);
    });
    
    $effect(() => {
        initModel(model);
    });

    $effect(() => {
        if (texturePack) {
            try {
                initTextures(texturePack);
            } catch (error) {
                console.error('Error initializing textures:', error);
            }
        }
    });

    $effect(() => {
        if (cubemapPack) {
            try {
                initCubeMap(cubemapPack);
            } catch (error) {
                console.error('Error initializing cubemap:', error);
            }
        }
    });

    const initLight = () => {
        var lightDirection = vec3(0.0, 1.0, 1.0);
        var lightDirectionLoc = gl.getUniformLocation(program, "lightDirection");
        gl.uniform3fv(lightDirectionLoc, flatten(lightDirection));
    };

    const render = () => {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        eye = vec3(
            dist * Math.sin(theta[0]) * Math.cos(theta[1]),
            dist * Math.sin(theta[1]),
            dist * Math.cos(theta[0]) * Math.cos(theta[1])
        );
        
        viewMatrix = lookAt(eye, at, up);
        modelMatrix = mat4();
        modelMatrix = mult(modelMatrix, translate(0.0, -yOffset, 0.0));
        texMatrix = mult(inverse(viewMatrix), inverse(projectionMatrix));
        gl.uniform3fv(eyeLoc, eye);

        drawBackground();

        if (isModelLoaded)
            drawModel();

        requestAnimationFrame(render);
    };

    const drawBackground = () => {
        gl.bindBuffer(gl.ARRAY_BUFFER, backgroundBuffer);
        gl.cullFace(gl.FRONT);

        const vPosition = gl.getAttribLocation(program, "vPosition");
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);

        gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(mat4()));
        gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(mat4()));
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(mat4()));
        
        gl.uniformMatrix4fv(texMatrixLoc, false, flatten(texMatrix));
        gl.uniform1i(reflectiveLoc, false);
        
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    const drawModel = () => {
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
        gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
        gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(viewMatrix));
        gl.uniformMatrix4fv(texMatrixLoc, false, flatten(texMatrix));
        
        gl.uniform1i(reflectiveLoc, true);
        if (model === 'sphere') {
            gl.cullFace(gl.FRONT);

            const vPosition = gl.getAttribLocation(program, "vPosition");
            gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(vPosition);
            
            gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
            const vNormal = gl.getAttribLocation(program, "vNormal");
            gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(vNormal);

            gl.drawArrays(gl.TRIANGLES, 0, sphereVertices.length);
        } else {
            gl.cullFace(gl.BACK);

            const vPosition = gl.getAttribLocation(program, "vPosition");
            gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(vPosition);
            
            gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
            const vNormal = gl.getAttribLocation(program, "vNormal");
            gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(vNormal);

            gl.drawElements(gl.TRIANGLES, obj.indices.length, gl.UNSIGNED_SHORT, 0);
        }
    }

    const initEventHandlers = (canvas) => {
        theta = vec2();
        isLeftButtonDown = false
        prevMouse = vec2();

        canvas.addEventListener('mousedown', (event) => {
            event.preventDefault();

            if (event.button == 0) {
                isLeftButtonDown = true;

                prevMouse[0] = event.clientX;
                prevMouse[1] = event.clientY;
            }
        });

        canvas.addEventListener('mouseup', (event) => {
            event.preventDefault();

            isLeftButtonDown = false;
        });

        canvas.addEventListener('mousemove', (event) => {
            event.preventDefault();

            if (isLeftButtonDown) {
                theta[0] -= (event.clientX - prevMouse[0]) / canvas.width * Math.PI * 2;
                theta[1] += (event.clientY - prevMouse[1]) / canvas.height * Math.PI * 2;

                theta[1] = Math.min(Math.max(theta[1], -Math.PI / 2.0), Math.PI / 2.0);
                
                prevMouse[0] = event.clientX;
                prevMouse[1] = event.clientY;
            }
        });

        canvas.addEventListener('wheel', (event) => {
            event.preventDefault();
            
            const ZOOM_SPEED = 0.01;
            
            dist += event.deltaY * ZOOM_SPEED;
            dist = Math.max(minDist, Math.min(maxDist, dist));
        });
    }

    const initCubeMap = (cubemapPack) => {
        if (cubeTexture)
            gl.deleteTexture(cubeTexture);

        cubeTexture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeTexture);
        
        const faces = [
            { target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, url: '/assets/textures/cubemaps/' + cubemapPack + '/posx.png' },
            { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, url: '/assets/textures/cubemaps/' + cubemapPack + '/negx.png' },
            { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, url: '/assets/textures/cubemaps/' + cubemapPack + '/posy.png' },
            { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, url: '/assets/textures/cubemaps/' + cubemapPack + '/negy.png' },
            { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, url: '/assets/textures/cubemaps/' + cubemapPack + '/posz.png' },
            { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, url: '/assets/textures/cubemaps/' + cubemapPack + '/negz.png' }
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
        Object.values(textureObjects).forEach(texture => {
            if (texture)
                gl.deleteTexture(texture);
        });

        textureObjects = {
            colorTexture: null,
            displacementTexture: null,
            normalTexture: null,
            armTexture: null,
            metalTexture: null
        };

        initTexture("/assets/textures/PBRpacks/" + texturePack + "/textures/" + texturePack.slice(0, -2) + "diff_" + texturePack.slice(-2) + ".jpg", "albedoMap", 1);
        initTexture("/assets/textures/PBRpacks/" + texturePack + "/textures/" + texturePack.slice(0, -2) + "disp_" + texturePack.slice(-2) + ".jpg", "displacementTexture", 2);
        initTexture("/assets/textures/PBRpacks/" + texturePack + "/textures/" + texturePack.slice(0, -2) + "nor_gl_" + texturePack.slice(-2) + ".png", "normalTexture", 3);
        initTexture("/assets/textures/PBRpacks/" + texturePack + "/textures/" + texturePack.slice(0, -2) + "arm_" + texturePack.slice(-2) + ".jpg", "armTexture", 4);
        initTexture("/assets/textures/PBRpacks/" + texturePack + "/textures/" + texturePack.slice(0, -2) + "metal_" + texturePack.slice(-2) + ".jpg", "metalTexture", 5);
    }

    const initTexture = (srcPath, textureKey, textureUnit) => {
        gl.activeTexture(gl[`TEXTURE${textureUnit}`]);
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        
        textureObjects[textureKey] = texture;
        
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

        const textureLoc = gl.getUniformLocation(program, textureKey);
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
        myTexels.onerror = (error) => {
            console.error(`Failed to load texture: ${srcPath}`, error);
        };
        myTexels.src = srcPath;
    };

    const initModel = (model) => {
        isModelLoaded = false;

        if (model === 'sphere') {
            initSphere();
            isModelLoaded = true;
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

            readOBJFile('/assets/models/' + model + '.obj', scale, reverse)
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
            
                    isModelLoaded = true;
                })
                .catch(error => {
                    console.error("Error loading OBJ file:", error);
                });
        }
    };

    const initSphere = () => {
        sphereVertices = [];
        sphereNormals = [];

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
</script>

<div class="flex flex-col justify-center items-start w-4/5 text-xl m-auto mb-16">
    <div class="w-4/5 m-auto">
        <p>This last page is dedicated to the final project of the course, which consists in the following:</p>
        <p>Collect texture assets from <a href="https://polyhaven.com/textures">Poly Haven</a> with layers such as diffuse, displacement, normal, roughness, ambient occlusion, and use these layers to render a sphere (and perhaps another object as well) with a high level of detail.</p>
    </div>

    <Result bind:canvas={canvas} bind:viewIndex={viewIndex} icons={[Code, Play]} width="700" height="700" isLoading={isLoading} codeSnippets={codeSnippets} folderPath={$page.url.pathname}>
        {#snippet controls()}
        <div class="absolute left-0 top-0 flex flex-row justify-center items-center gap-4 w-full p-4 bg-zinc-900/25 rounded-{viewIndex == 1 && 'r-'}lg">    
            <Select label="Model" bind:value={model} options={modelOptions} width="w-40"/>
            <Select label="Texture Pack" bind:value={texturePack} options={texturePackOptions} width="w-64"/>
            <Select label="Cubemap" bind:value={cubemapPack} options={cubemapOptions} width="w-40"/>
        </div>
        
        <div class="absolute left-0 bottom-0 flex flex-row justify-center items-center gap-4 w-full p-4 bg-zinc-900/25 rounded-{viewIndex == 1 && 'r-'}lg">    
            <Slider min={0} max={.25} bind:value={displacementScale} step={0.01} id={displacementScale} label="Displacement scale"/>
            <Counter bind:count={numRepeats} min={1} max={4} label="texture repeats"/>
        </div>
        {/snippet}
    </Result>
    
    <a href="/assets/Computer_graphics_Final_project.pdf" download class="flex flex-row items-center mt-4 m-auto px-4 py-2 rounded-xl text-xl text-zinc-900 bg-zinc-300 hover:bg-zinc-400 transition-all duration-200">Full PDF<Download size=20 class="ms-4"/></a>
</div>