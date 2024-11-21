<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores'
    import { WebGLUtils, fetchCodeSnippets, initShaders, convertToLatex } from '$lib/utils.svelte.js';
    import { vec2, vec4, flatten, perspective, mat4 } from '$lib/Libraries/MV.js';
    import Result from '$lib/components/Result.svelte';
    import Admonition from '$lib/components/UI/Admonition.svelte';

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

            program = await initShaders(gl, program, $page.url.pathname + '/vshader.glsl', $page.url.pathname + '/fshader.glsl');

            initVertices();
            initMatrices();

            initGroundTexture();
            initRectTexture();
            initTextureCoordinates();
            
            isGroundLoc = gl.getUniformLocation(program, "isGround");

            render();

            codeSnippets = await fetchCodeSnippets($page.url.pathname);
            isLoading = false;
        }
    });

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

    const initRectTexture = () => {
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
        modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
        var modelViewMatrix = mat4();
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

        projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
        var projectionMatrix = perspective(90, canvas.width / canvas.height, .1, 30.0);
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
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
        <p>The scene to be rendered consists of three quadrilaterals (quads). One is a large texture mapped quad in the plane $y=-1\ (x\in[-2,2], z\in[-1,-5])$, the others are smaller quads colored red. Let us refer to the large quad as the ground.</p>
        <p>One of the two smaller quads should be parallel to $y=-1$, but placed above the ground $(y=-0.5,\ x\in[0.25,0.75],\ z\in[-1.25,-1.75])$.</p>
        <p>The other should be perpendicular to $y=-1$ with two vertices intersecting the ground $(x=-1,\ y\in[-1,0],\ z\in[-2.5,-3])$.</p>
        <p>Create a WebGL program that draws this scene. Here are some steps:</p> 
        <ul>
            <li>Start from Part 1 of Worksheet 6. Use the coordinates given above to set the vertex coordinates of the ground. Adjust the texture coordinates of the ground so that the texture fills out the square without being repeated.</li>
            <li>Replace the checkerboard texture by the texture image in xamp23.png (available on DTU Learn).</li>
            <li>In initialization, switch to gl.TEXTURE1 using gl.activeTexture and create a new texture of $1\times1$ resolution, where you store just a single red color: Uint8Array([255, 0, 0]). [Angel 7.5.6]</li>
            <li>Add the two smaller quads to your vertex and texture coordinate buffers. Draw the ground quad with texture 0 and the smaller red quads with texture 1. [Angel 7.5.6]</li>
        </ul>

        <Admonition type='tip'>
            {#snippet textContent()}
                <p>In WebGPU, create two different bind groups: one using the marble texture loaded from xamp23.png and one using the red texture. In the render pass, set the first bind group when drawing the ground quad and the second bind group when drawing the two red quads.</p>
                <p>For Part 2, create a third bind group that uses the red texture but a new buffer for uniform matrix variables suitable for the projection shadows. Use the third bind group when drawing the shadow polygons.</p>
            {/snippet}
        </Admonition>
    </div>

    <Result bind:canvas={canvas} bind:viewIndex={viewIndex} isLoading={isLoading} codeSnippets={codeSnippets} folderPath={$page.url.pathname}/>
</div>

