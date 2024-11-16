<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores'
    import { WebGLUtils, fetchCodeSnippets, initShaders, convertToLatex } from '$lib/utils.svelte.js';
    import * as mv from '$lib/Libraries/MV.js';
    import Result from '$lib/components/Result.svelte';

    let viewIndex = $state(1);
    let isLoading = $state(true);
    let canvas = $state();
    let gl, program;
    let codeSnippets = $state([]);

    let vertices;
    let modelViewMatrixLoc, projectionMatrixLoc;
    let isGroundLoc;
    let redTexLoc, redTex;
    let groundTexLoc, groundTexture;

    onMount(async () => {
        if (typeof window !== 'undefined') {
            convertToLatex();

            gl = WebGLUtils.setupWebGL(canvas);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);

            try {
                [gl, program] = await initShaders(gl, program, $page.url.pathname + '/vshader.glsl', $page.url.pathname + '/fshader.glsl');

                initializeVertices();
                initializeMatrices();

                initializeGroundTexture();
                initializeRectTexture();
                initializeTextureCoordinates();
                
                isGroundLoc = gl.getUniformLocation(program, "isGround");

                render();
            } catch (error) {
                console.error(error);
            }

            codeSnippets = await fetchCodeSnippets($page.url.pathname);
            isLoading = false;
        }
    });

    const initializeVertices = () => {
        vertices = [
            mv.vec4(-2.0, -1.0, -1.0, 1.0), 
            mv.vec4(-2.0, -1.0, -5.0, 1.0), 
            mv.vec4(2.0, -1.0, -5.0, 1.0),
            mv.vec4(-2.0, -1.0, -1.0, 1.0), 
            mv.vec4(2.0, -1.0, -5.0, 1.0),
            mv.vec4(2.0, -1.0, -1.0, 1.0),

            mv.vec4(0.25, -0.5, -1.25, 1.0),
            mv.vec4(0.25, -0.5, -1.75, 1.0),
            mv.vec4(0.75, -0.5, -1.75, 1.0),
            mv.vec4(0.25, -0.5, -1.25, 1.0),
            mv.vec4(0.75, -0.5, -1.75, 1.0),
            mv.vec4(0.75, -0.5, -1.25, 1.0),

            mv.vec4(-1.0, -1.0, -2.5, 1.0),
            mv.vec4(-1.0, -1.0, -3.0, 1.0),
            mv.vec4(-1.0, -0.0, -3.0, 1.0),
            mv.vec4(-1.0, -1.0, -2.5, 1.0),
            mv.vec4(-1.0, -0.0, -3.0, 1.0),
            mv.vec4(-1.0, -0.0, -2.5, 1.0),
        ];
        var vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, mv.flatten(vertices), gl.STATIC_DRAW);
        var vPosition = gl.getAttribLocation(program, "vPosition");
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);
    }

    const initializeGroundTexture = () => {
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

    const initializeRectTexture = () => {
        var redImg = new Uint8Array([255, 0, 0, 255]);

        redTex = gl.createTexture();
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, redTex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, redImg);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        redTexLoc = gl.getUniformLocation(program, "redTex");
        gl.uniform1i(redTexLoc, 1);
    }

    const initializeTextureCoordinates = () => {
        var textCoords = [
            mv.vec2(-.5, -.5), mv.vec2(.5, -.5), mv.vec2(.5, .5),
            mv.vec2(-.5, -.5), mv.vec2(.5, .5), mv.vec2(-.5, .5),
        ];

        var tBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, mv.flatten(textCoords), gl.STATIC_DRAW);
        var vTexCoord = gl.getAttribLocation(program, "vTexCoord");
        gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vTexCoord);
    }

    const initializeMatrices = () => {
        modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
        var modelViewMatrix = mv.mat4();
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, mv.flatten(modelViewMatrix));

        projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
        var projectionMatrix = mv.perspective(90, canvas.width / canvas.height, .1, 30.0);
        gl.uniformMatrix4fv(projectionMatrixLoc, false, mv.flatten(projectionMatrix));
    }

    const render = () => {
        gl.clear(gl.COLOR_BUFFER_BIT);

        renderGround();
        renderRects();

        requestAnimFrame(render);
    }

    const renderGround = () => {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, groundTexture);
        gl.uniform1i(groundTexLoc, 0);
        gl.uniform1i(isGroundLoc, true);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    const renderRects = () => {
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, redTex);
        gl.uniform1i(redTexLoc, 1);
        gl.uniform1i(isGroundLoc, false);
        gl.drawArrays(gl.TRIANGLES, 6, 18);
    }
</script>

<div class="flex flex-col justify-center items-start w-4/5 text-xl m-auto">
    <div class="w-4/5 m-auto">
        <p>Create a rectangle with vertices (-4, -1, -1), (4, -1, -1), (4, -1, -21), (-4, -1, -21). Set up a perspective camera with a 90° field of view. Use the default view matrix and draw the rectangle in white on a blue background.</p>
        <p>Map a procedurally generated checkerboard texture to the rectangle using the following steps:</p>
        <p>1) Create a texture object and bind it as the current 2D texture object. [Angel 7.5.1]</p>
        <p>2) Generate a 64x64 resolution texture image that forms an 8x8 black-and-white checkerboard, and set it to be used with the currently bound 2D texture. [Angel 7.5.2]</p>
        <p>3) Create texture coordinates (-1.5, 0.0), (2.5, 0.0), (2.5, 10.0), (-1.5, 10.0) for your rectangle, such that the texture repeats four times along the width and ten times along the length of the rectangle. Set up the texture coordinates to be received as an attribute in the vertex shader. [Angel 7.5.3]</p>
        <p>4) Set up the texture map as a uniform sampler2D in the fragment shader and link this sampler to the default texture (0). Pass the texture coordinates to the fragment shader and use them to replace the fragment color with a color from the texture map. [Angel 7.5.3]</p>
        <p>5) Set the texture filtering parameters to use nearest point sampling. This ensures texture completeness. You should now be able to draw the texture mapped rectangle. [Angel 7.5.4]</p>
    </div>

    <Result bind:canvas={canvas} bind:viewIndex={viewIndex} isLoading={isLoading} codeSnippets={codeSnippets} folderPath={$page.url.pathname}/>
</div>

