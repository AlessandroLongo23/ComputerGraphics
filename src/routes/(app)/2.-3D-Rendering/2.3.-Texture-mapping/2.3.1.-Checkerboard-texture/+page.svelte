<script>
    import { WebGLUtils, fetchCodeSnippets, initShaders, convertToLatex } from '$lib/utils.svelte.js';
    import { vec2, vec4, flatten, perspective, mat4 } from '$lib/Libraries/MV.js';
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
    let textureLoc, texture;
    let modelViewMatrixLoc, projectionMatrixLoc;

    onMount(async () => {
        if (typeof window !== 'undefined') {
            convertToLatex();

            gl = WebGLUtils.setupWebGL(canvas);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);

            program = await initShaders(gl, program, $page.url.pathname + '/vshader.glsl', $page.url.pathname + '/fshader.glsl');

            vertices = [
                vec4(-4.0, -1.0, -1.0, 1.0), 
                vec4(4.0, -1.0, -1.0, 1.0), 
                vec4(4.0, -1.0, -21.0, 1.0),
                vec4(-4.0, -1.0, -21.0, 1.0),
            ];
            var vBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
            var vPosition = gl.getAttribLocation(program, "vPosition");
            gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(vPosition);

            gl.activeTexture(gl.TEXTURE0);
            texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            
            textureLoc = gl.getUniformLocation(program, "texMap");
            gl.uniform1i(textureLoc, 0);

            var texSize = 64;
            var numRows = 8;
            var numCols = 8;
            var myTexels = new Uint8Array(4 * texSize * texSize);
            for (var i = 0; i < texSize; ++i) {
                for (var j = 0; j < texSize; ++j) {
                    var patchx = Math.floor(i / (texSize / numRows));
                    var patchy = Math.floor(j / (texSize / numCols));
                    var c = patchx % 2 !== patchy % 2 ? 255 : 0;
                    myTexels[4 * i * texSize + 4 * j] = c;
                    myTexels[4 * i * texSize + 4 * j + 1] = c;
                    myTexels[4 * i * texSize + 4 * j + 2] = c;
                    myTexels[4 * i * texSize + 4 * j + 3] = 255;
                }
            }

            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, myTexels);

            var textCoords = [
                vec2(-1.5, 0.0),
                vec2(2.5, 0.0),
                vec2(2.5, 10.0),
                vec2(-1.5, 10.0),
            ];

            var tBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(textCoords), gl.STATIC_DRAW);
            var vTexCoord = gl.getAttribLocation(program, "vTexCoord");
            gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(vTexCoord);

            modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
            projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

            render();

            codeSnippets = await fetchCodeSnippets($page.url.pathname);
            isLoading = false;
        }
    });

    const render = () => {
        gl.clear(gl.COLOR_BUFFER_BIT);

        var projectionMatrix = perspective(90, canvas.width / canvas.height, .1, 30.0);
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

        var ctm = mat4();
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(ctm));

        gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length);

        requestAnimFrame(render);
    }
</script>

<div class="flex flex-col justify-center items-start {$textWidth} text-xl m-auto gap-6">
    <p class="text-xl font-medium m-0">Assignment</p>

    <div class="flex flex-col gap-4 text-zinc-950/65 dark:text-zinc-50/65">
        <p>Create a rectangle with vertices (-4, -1, -1), (4, -1, -1), (4, -1, -21), (-4, -1, -21). Set up a perspective camera with a 90° field of view. Use the default view matrix and draw the rectangle in white on a blue background.</p>
        <p>Map a procedurally generated checkerboard texture to the rectangle using the following steps:</p>
        <ul class="list-decimal list-inside">
            <li>Create a texture object and bind it as the current 2D texture object. [Angel 7.5.1]</li>
            <li>Generate a 64x64 resolution texture image that forms an 8x8 black-and-zinc-100 checkerboard, and set it to be used with the currently bound 2D texture. [Angel 7.5.2]</li>
            <li>Create texture coordinates (-1.5, 0.0), (2.5, 0.0), (2.5, 10.0), (-1.5, 10.0) for your rectangle, such that the texture repeats four times along the width and ten times along the length of the rectangle. Set up the texture coordinates to be received as an attribute in the vertex shader. [Angel 7.5.3]</li>
            <li>Set up the texture map as a uniform sampler2D in the fragment shader and link this sampler to the default texture (0). Pass the texture coordinates to the fragment shader and use them to replace the fragment color with a color from the texture map. [Angel 7.5.3]</li>
            <li>Set the texture filtering parameters to use nearest point sampling. This ensures texture completeness. You should now be able to draw the texture mapped rectangle. [Angel 7.5.4]</li>
        </ul>
    </div>
</div>

<Result bind:canvas={canvas} bind:viewIndex={viewIndex} isLoading={isLoading} codeSnippets={codeSnippets} folderPath={$page.url.pathname}/>
