<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores'
    
    import { WebGLUtils, fetchCodeSnippets, initShaders, convertToLatex } from '$lib/utils.svelte.js';
    import { vec3, vec4, flatten, perspective, mat4, normalize, mix, lookAt} from '$lib/Libraries/MV.js';

    import Result from '$lib/components/Result.svelte';
    import Admonition from '$lib/components/UI/Admonition.svelte';

    let viewIndex = $state(1);
    let isLoading = $state(true);
    let canvas = $state();
    let gl, program;
    let codeSnippets = $state([]);

    let projectionMatrixLoc, viewMatrixLoc, modelMatrixLoc, texMatrixLoc;
    let sphereVertices, sphereNormals;
    let subdivisions, thetaY;

    onMount(async () => {
        if (typeof window !== 'undefined') {
            convertToLatex();

            gl = WebGLUtils.setupWebGL(canvas);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);

            program = await initShaders(gl, program, $page.url.pathname + '/vshader.glsl', $page.url.pathname + '/fshader.glsl');

            configureWebGL();
            initUniforms();
            initCubeMap();
            initSphere();

            render();

            codeSnippets = await fetchCodeSnippets($page.url.pathname);
            isLoading = false;
        }
    });

    const configureWebGL = () => {
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.FRONT);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(1.0, 1.0, 1.0, 1.0);
    }

    const initUniforms = () => {
        viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix");
        modelMatrixLoc = gl.getUniformLocation(program, "modelMatrix");
        projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
        texMatrixLoc = gl.getUniformLocation(program, "texMatrix");
    }

    const initCubeMap = () => {
        const cubeTexture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeTexture);
        
        const faces = [
            { target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, url: '/assets/textures/cubemaps/brightday/posx.png' },
            { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, url: '/assets/textures/cubemaps/brightday/negx.png' },
            { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, url: '/assets/textures/cubemaps/brightday/posy.png' },
            { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, url: '/assets/textures/cubemaps/brightday/negy.png' },
            { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, url: '/assets/textures/cubemaps/brightday/posz.png' },
            { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, url: '/assets/textures/cubemaps/brightday/negz.png' }
        ];

        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        let loadedImages = 0;
        faces.forEach(face => {
            gl.texImage2D(face.target, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));

            const image = new Image();
            image.onload = () => {
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeTexture);
                gl.texImage2D(face.target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
                loadedImages++;
                
                if (loadedImages === 6)
                    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
            };

            image.src = face.url;
        });

        const cubeMapLoc = gl.getUniformLocation(program, "cubeMap");
        gl.uniform1i(cubeMapLoc, 0);
    }

    const initSphere = () => {
        sphereVertices = [];
        sphereNormals = [];

        subdivisions = 6;
        thetaY = 0;

        const v0 = vec4(0.0, 0.0, -1.0, 1);
        const v1 = vec4(0.0, 0.942809, 0.333333, 1);
        const v2 = vec4(-0.816497, -0.471405, 0.333333, 1);
        const v3 = vec4(0.816497, -0.471405, 0.333333, 1);

        tetrahedron(v0, v1, v2, v3, subdivisions);

        setupBuffer(sphereVertices, 'vPosition', 4);
        setupBuffer(sphereNormals, 'vNormal', 4);
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

    const setupBuffer = (data, attributeName, size) => {
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(data), gl.STATIC_DRAW);
        
        const location = gl.getAttribLocation(program, attributeName);
        gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(location);
    }

    const render = () => {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        thetaY += 0.001;

        updateMatrices();

        gl.drawArrays(gl.TRIANGLES, 0, sphereVertices.length);
        
        requestAnimationFrame(render);
    }

    const updateMatrices = () => {
        const aspect = canvas.width / canvas.height;
        const projectionMatrix = perspective(45, aspect, 0.1, 100.0);

        const dist = 5.0;
        const eye = vec3(dist * Math.cos(thetaY), 0.0, dist * Math.sin(thetaY));
        const at = vec3(0.0, 0.0, 0.0);
        const up = vec3(0.0, 1.0, 0.0);
        const viewMatrix = lookAt(eye, at, up);

        const modelMatrix = mat4();

        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
        gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(viewMatrix));
        gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
    }
</script>

<div class="flex flex-col justify-center items-start w-4/5 text-xl m-auto">
    <div class="w-4/5 m-auto">
        <p>Start from a textured sphere (Part 3 of Worksheet 6). Instead of the ordinary 2D texture, we will now use a cube map to texture the sphere. [Angel 7.8]</p>
        <p>Modify your texture initialization such that it loads a cube map from six image files, one file for each face. The files are in textures.zip (on DTU  Learn).</p>    
        
        <Admonition type='tip'>
            {#snippet textContent()}
                <p class="m-0">The file names and their orientation in the cube map are:</p>
                <p>
                    <!-- var cubemap = [
                        'textures/cm_left.png',    // POSITIVE_X
                        'textures/cm_right.png',   // NEGATIVE_X
                        'textures/cm_top.png',     // POSITIVE_Y
                        'textures/cm_bottom.png',  // NEGATIVE_Y
                        'textures/cm_back.png',    // POSITIVE_Z
                        'textures/cm_front.png'    // NEGATIVE_Z
                    ]; -->
                </p>
            {/snippet}
        </Admonition>
            
        <Admonition type='warning'>
            {#snippet textContent()}
                <p class="m-0">If you use a loop to load the image files, you must retrieve the image from the event variable in the onload function</p>
                <p class="m-0">
                    <!-- ```
                    image.onload = function(event) {       
                        var image = event.target;       // Insert cube face texture initialization here
                    };
                    ```   -->
                </p>
            {/snippet}
        </Admonition>
    
        <p>Once the cube map is initialized, no inverse map is needed to compute texture coordinates. Simply use the world space normal as texture coordinates when looking up the texture color in the fragment shader.</p>
    </div>

    <Result bind:canvas={canvas} bind:viewIndex={viewIndex} isLoading={isLoading} codeSnippets={codeSnippets} folderPath={$page.url.pathname}/>
</div>