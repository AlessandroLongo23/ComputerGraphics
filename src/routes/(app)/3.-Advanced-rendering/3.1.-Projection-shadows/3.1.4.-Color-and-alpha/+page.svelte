<script>
    import { vec2, vec3, vec4, flatten, perspective, mat4, lookAt, mult, translate } from '$lib/Libraries/MV.js';
    import { WebGLUtils, fetchCodeSnippets, initShaders, convertToLatex } from '$lib/utils.svelte.js';
    import { textWidth } from '$lib/stores/layout.svelte.js';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';

    import Result from '$lib/components/Result.svelte';

    let viewIndex = $state(1);
    let isLoading = $state(true);
    let canvas = $state();
    let gl, program;
    let codeSnippets = $state([]);

    let vertices;
    let modelViewMatrixLoc, projectionMatrixLoc;
    let modelViewMatrix, projectionMatrix;
    let at, up, eye;
    let isGroundLoc;
    let groundTexLoc, groundTexture, visibilityLoc;
    let time;
    let pointLightCenter, pointLightRadius, pointLightPosition;

    onMount(async () => {
        if (typeof window !== 'undefined') {
            convertToLatex();

            gl = WebGLUtils.setupWebGL(canvas);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(1.0, 1.0, 1.0, 0.0);

            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LESS);
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

            program = await initShaders(gl, program, $page.url.pathname + '/vshader.glsl', $page.url.pathname + '/fshader.glsl');

            time = 0.0;
            initPointLight();
            initVertices();
            initGroundTexture();
            initTextureCoordinates();
            initMatrices();
            
            visibilityLoc = gl.getUniformLocation(program, "visibility");
            isGroundLoc = gl.getUniformLocation(program, "isGround");

            render();

            codeSnippets = await fetchCodeSnippets($page.url.pathname);
            isLoading = false;
        }
    });

    const initPointLight = () => {
        pointLightCenter = vec3(0.0, 2.0, -2.0);
        pointLightRadius = 2.0;
    }

    const initVertices = () => {
        vertices = [
            vec4(-2.0, -1.0, -1.0, 1.0), 
            vec4(-2.0, -1.0, -5.0, 1.0), 
            vec4(2.0, -1.0, -5.0, 1.0),
            vec4(-2.0, -1.0, -1.0, 1.0), 
            vec4(2.0, -1.0, -5.0, 1.0),
            vec4(2.0, -1.0, -1.0, 1.0),

            vec4(0.25, -0.5, -1.25, 1.0),
            vec4(0.25, -0.5, -1.75, 1.0),
            vec4(0.75, -0.5, -1.75, 1.0),
            vec4(0.25, -0.5, -1.25, 1.0),
            vec4(0.75, -0.5, -1.75, 1.0),
            vec4(0.75, -0.5, -1.25, 1.0),

            vec4(-1.0, -1.0, -2.5, 1.0),
            vec4(-1.0, -1.0, -3.0, 1.0),
            vec4(-1.0, -0.0, -3.0, 1.0),
            vec4(-1.0, -1.0, -2.5, 1.0),
            vec4(-1.0, -0.0, -3.0, 1.0),
            vec4(-1.0, -0.0, -2.5, 1.0),
        ];

        var vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
        var vPosition = gl.getAttribLocation(program, "vPosition");
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);
    }

    const initGroundTexture = () => {
        groundTexture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, groundTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        groundTexLoc = gl.getUniformLocation(program, "groundTex");
        gl.uniform1i(groundTexLoc, 0);

        var myTexels = new Image();
        myTexels.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, groundTexture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, myTexels);
            gl.generateMipmap(gl.TEXTURE_2D);
        }
        myTexels.src = "/assets/textures/groundTexture.png";
    }

    const initTextureCoordinates = () => {
        var textCoords = [
            vec2(-.5, -.5), vec2(.5, -.5), vec2(.5, .5),
            vec2(-.5, -.5), vec2(.5, .5), vec2(-.5, .5),
        ];

        var tBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(textCoords), gl.STATIC_DRAW);
        var vTexCoord = gl.getAttribLocation(program, "vTexCoord");
        gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vTexCoord);
    }

    const initMatrices = () => {
        projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
        projectionMatrix = perspective(90, canvas.width / canvas.height, .1, 30.0);
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
        
        at = vec3(0.0, 0.0, 0.0);
        up = vec3(0.0, 1.0, 0.0);
        eye = vec3(0.0, 0.0, 0.0);
        modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    }

    const render = () => {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        time += 0.01;
        updateLightPosition();

        gl.uniform1i(isGroundLoc, true);
        renderGround();

        gl.uniform1i(isGroundLoc, false);
        renderShadow();
        renderRects();
        
        requestAnimFrame(render);
    }

    const updateLightPosition = () => {
        pointLightPosition = vec3(
            pointLightCenter[0] + pointLightRadius * Math.cos(time),
            pointLightCenter[1],
            pointLightCenter[2] + pointLightRadius * Math.sin(time),
        );
    }

    const renderGround = () => {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, groundTexture);
        gl.uniform1i(groundTexLoc, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    const renderShadow = () => {
        gl.depthFunc(gl.GREATER);

        modelViewMatrix = lookAt(eye, at, up);
        let epsilon = 0.001;
        let m = mat4();
        m[3][3] = 0.0;
        m[3][1] = -1.0 / (pointLightPosition[1] + 1.0 + epsilon);
        modelViewMatrix = mult(modelViewMatrix, translate(pointLightPosition));
        modelViewMatrix = mult(modelViewMatrix, m);
        modelViewMatrix = mult(modelViewMatrix, translate(-pointLightPosition[0], -pointLightPosition[1], -pointLightPosition[2]));
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

        gl.uniform1i(visibilityLoc, false);
        gl.drawArrays(gl.TRIANGLES, 6, 18);

        gl.depthFunc(gl.LESS);
    }

    const renderRects = () => {
        modelViewMatrix = lookAt(eye, at, up);
        
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
        gl.uniform1i(visibilityLoc, true);
        gl.drawArrays(gl.TRIANGLES, 6, 18);
    }
</script>

<div class="flex flex-col justify-center items-start {$textWidth} text-xl m-auto gap-6">
    <p class="text-xl font-medium m-0">Assignment</p>
    
    <div class="flex flex-col gap-4 text-zinc-950/65 dark:text-zinc-50/65">
        <p>The black shadows seem too dark. We would like to see a darker version of the ground texture in the shadows. Semi-transparent shadow polygons can achieve this effect.</p>
        <p>Enable blending and set an appropriate blending function to render a darker version of the ground texture in the shadows. [Angel 7.10-7.10.3]</p> 
        <!-- <p>Blending in WebGL is influenced by browser compositing. Use var gl = WebGLUtils.setupWebGL(canvas, { alpha: false }); to switch off this effect.</p> -->
    </div>
</div>

<Result bind:canvas={canvas} bind:viewIndex={viewIndex} isLoading={isLoading} codeSnippets={codeSnippets} folderPath={$page.url.pathname}/>

