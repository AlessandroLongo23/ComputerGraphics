<script>
    import { vec3, vec4, flatten, perspective, lookAt, mat4, normalize, mix, mult, inverse } from '$lib/Libraries/MV.js';
    import { WebGLUtils, fetchCodeSnippets, initShaders, convertToLatex } from '$lib/utils.svelte.js';
    import { textWidth } from '$lib/stores/layout.svelte.js';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    
    import Result from '$lib/components/Result.svelte';
    import Admonition from '$lib/components/UI/Admonition.svelte';

    let viewIndex = $state(1);
    let isLoading = $state(true);
    let canvas = $state();
    let gl, program;
    let codeSnippets = $state([]);

    let projectionMatrixLoc, viewMatrixLoc, modelMatrixLoc, texMatrixLoc;
    let projectionMatrix, viewMatrix, modelMatrix;
    let eyeLoc, reflectiveLoc;
    let sphereVertices, sphereNormals;
    let thetaY;
    let backgroundBuffer, vertexBuffer, normalBuffer;
    let bumpTexture, bumpTextureLoc;

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
            initBumpMap();

            initBackgroundQuad();
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

        eyeLoc = gl.getUniformLocation(program, "eye");
        reflectiveLoc = gl.getUniformLocation(program, "reflective");
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

    const initBumpMap = () => {
        gl.activeTexture(gl.TEXTURE1);
        bumpTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, bumpTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        bumpTextureLoc = gl.getUniformLocation(program, "bumpMap");
        gl.uniform1i(bumpTextureLoc, 1);

        var myTexels = new Image();
        myTexels.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, bumpTexture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, myTexels);
            gl.generateMipmap(gl.TEXTURE_2D);
        }
        myTexels.src = "/assets/textures/bumpmaps/bumpMap2.png";
    }

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

    const initSphere = () => {
        sphereVertices = [];
        sphereNormals = [];

        thetaY = 0;

        const v0 = vec4(0.0, 0.0, -1.0, 1);
        const v1 = vec4(0.0, 0.942809, 0.333333, 1);
        const v2 = vec4(-0.816497, -0.471405, 0.333333, 1);
        const v3 = vec4(0.816497, -0.471405, 0.333333, 1);

        tetrahedron(v0, v1, v2, v3, 9);

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

    const render = () => {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        thetaY += 0.001;

        projectionMatrix = perspective(45, canvas.width / canvas.height, 0.1, 100.0);
        const dist = 5.0;
        const eye = vec3(dist * Math.cos(thetaY), 0.0, dist * Math.sin(thetaY));
        const at = vec3(0.0, 0.0, 0.0);
        const up = vec3(0.0, 1.0, 0.0);
        viewMatrix = lookAt(eye, at, up);
        modelMatrix = mat4();

        gl.uniform3fv(eyeLoc, eye);

        drawBackground();
        drawSphere();
        
        requestAnimationFrame(render);
    }

    const drawBackground = () => {
        gl.bindBuffer(gl.ARRAY_BUFFER, backgroundBuffer);
        const vPosition = gl.getAttribLocation(program, "vPosition");
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);
        
        gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(mat4()));
        gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(mat4()));
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(mat4()));
        
        const texMatrix = mult(inverse(viewMatrix), inverse(projectionMatrix));
        gl.uniformMatrix4fv(texMatrixLoc, false, flatten(texMatrix));

        gl.uniform1i(reflectiveLoc, false);
        
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    const drawSphere = () => {
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        const vPosition = gl.getAttribLocation(program, "vPosition");
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        const vNormal = gl.getAttribLocation(program, "vNormal");
        gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vNormal);
        
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
        gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(viewMatrix));
        gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
        gl.uniformMatrix4fv(texMatrixLoc, false, flatten(mat4()));
        
        gl.uniform1i(reflectiveLoc, true);

        gl.drawArrays(gl.TRIANGLES, 0, sphereVertices.length);
    }
</script>

<div class="flex flex-col justify-center items-start {$textWidth} text-xl m-auto gap-6">
    <p class="text-xl font-medium m-0">Assignment</p>
    
    <div class="flex flex-col gap-4 text-zinc-950/65 dark:text-zinc-50/65">
        <p>Finally, we will perturb the normal of the mirror ball using a normal map to give the impression that the ball surface is 'bumpy'. [Angel 7.9]</p>
        <p>Load the normal map texture from the file normalmap.png and map it onto the sphere using the same technique as in Part 3 of Worksheet 6. The first image for this part is the expected result.</p>
        <p>Bind the normal map to another texture (e.g. TEXTURE1) so that it can be used together with the cube map [Angel 7.5.6].</p>
        <Admonition type='warning'>
            {#snippet textContent()}
                <p class="m-0">
                    The color found in the normal map is in $[0, 1]$. Transform it to be in $[-1, 1]$ to get the actual normal. 
                </p>
            {/snippet}
        </Admonition>
        <p>The normal retrieved from the normal map is in tangent space. We need to transform it to world space to use it in place of the sphere normal when calculating the direction of reflection.</p>
        <Admonition type='tip'>
            {#snippet textContent()}
                <!-- <p class="m-0">Use the following function as an efficient way to perform this change of basis transformation:1          vec3 rotate_to_normal(vec3 n, vec3 v) {           float sgn_nz = sign(n.z + 1.0e-16);           float a = -1.0/(1.0 + abs(n.z));           float b = n.x*n.y*a;           return vec3(1.0 + n.x*n.x*a, b, -sgn_nz*n.x)*v.x                + vec3(sgn_nz*b, sgn_nz*(1.0 + n.y*n.y*a), -n.y)*v.y                + n*v.z;  }</p> -->
                <p class="m-0">The first argument is the surface normal n in world coordinates, the second argument is the tangent space vector to be transformed to world space. In our case, the tangent space vector is the normal retrieved from the normal map. The transformation returns the bump mapped normal to be used in place of the sphere normal when rendering reflective objects.</p>
            {/snippet}
        </Admonition>
    </div>
</div>

<Result bind:canvas={canvas} bind:viewIndex={viewIndex} isLoading={isLoading} codeSnippets={codeSnippets} folderPath={$page.url.pathname}/>