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
    let textureLoc, texture;
    let modelViewMatrixLoc, projectionMatrixLoc;

    onMount(async () => {
        if (typeof window !== 'undefined') {
            convertToLatex();

            gl = WebGLUtils.setupWebGL(canvas);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);

            try {
                [gl, program] = await initShaders(gl, program, $page.url.pathname + '/vshader.glsl', $page.url.pathname + '/fshader.glsl');

                vertices = [
                    mv.vec4(-4.0, -1.0, -1.0, 1.0), 
                    mv.vec4(4.0, -1.0, -1.0, 1.0), 
                    mv.vec4(4.0, -1.0, -21.0, 1.0),
                    mv.vec4(-4.0, -1.0, -21.0, 1.0),
                ];
                var vBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, mv.flatten(vertices), gl.STATIC_DRAW);
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
                gl.generateMipmap(gl.TEXTURE_2D);

                var textCoords = [
                    mv.vec2(-1.5, 0.0),
                    mv.vec2(2.5, 0.0),
                    mv.vec2(2.5, 10.0),
                    mv.vec2(-1.5, 10.0),
                ];

                var tBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, mv.flatten(textCoords), gl.STATIC_DRAW);
                var vTexCoord = gl.getAttribLocation(program, "vTexCoord");
                gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(vTexCoord);

                modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
                projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

                document.getElementById("wrapping").addEventListener("change", () => {
                    switch(parseInt(document.getElementById("wrapping").value)) {
                        case 0:
                            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                            break;
                        case 1:
                            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
                            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
                            break;
                    }
                });

                document.getElementById("filtering").addEventListener("change", () => {
                    switch(parseInt(document.getElementById("filtering").value)) {
                        case 0:
                            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                            break;
                        case 1:
                            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                            break;
                        case 2:
                            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
                            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                            break;
                        case 3:
                            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
                            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                            break;
                        case 4:
                            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
                            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                            break;
                        case 5:
                            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                            break;
                    }
                });

                render();
            } catch (error) {
                console.error(error);
            }

            codeSnippets = await fetchCodeSnippets($page.url.pathname);
            isLoading = false;
        }
    });

    const render = () => {
        gl.clear(gl.COLOR_BUFFER_BIT);

        var projectionMatrix = mv.perspective(90, canvas.width / canvas.height, .1, 30.0);
        gl.uniformMatrix4fv(projectionMatrixLoc, false, mv.flatten(projectionMatrix));

        var ctm = mv.mat4();
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, mv.flatten(ctm));

        gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length);

        requestAnimFrame(render);
    }
</script>

<div class="flex flex-col justify-center items-start w-4/5 text-xl m-auto">
    <div class="w-4/5 m-auto">
        <p>Create buttons and/or selection menus that enable you to switch between different texture wrapping modes (repeat or clamp-to-edge) and all six different texture filtering modes (nearest, linear, nearest mipmap nearest, linear mipmap nearest, nearest mipmap linear, linear mipmap linear). [Angel 3.6, 7.5.3, 7.5.4]</p>
        <p>Explain the effect of the different filtering modes and their influence on texture magnification and minification issues.</p>
    </div>

    <Result bind:canvas={canvas} bind:viewIndex={viewIndex} isLoading={isLoading} codeSnippets={codeSnippets} folderPath={$page.url.pathname}>
        {#snippet controls()}
            <div class="absolute left-0 top-0 flex flex-row justify-evenly items-center gap-4 w-full p-4 bg-gray-900/25 rounded-{viewIndex == 1 && 'r-'}lg">    
                <div class="flex flex-row justify-evenly w-full">
                    <div class="flex flex-col w-40 bg-white rounded-lg p-1">
                        <label for="wrapping" class="flex text-sm h-8 items-center justify-center text-black rounded-lg">Wrapping</label>
                        <select name="wrapping" id="wrapping" class="flex text-sm h-8 bg-gray-300 text-black ps-4 rounded-lg">
                            <option value="0">clamp to edge</option>
                            <option value="1" selected>repeat</option>
                        </select>
                    </div>
            
                    <div class="flex flex-col w-56 bg-white rounded-lg p-1">
                        <label for="filtering" class="flex text-sm h-8 items-center justify-center text-black rounded-lg">Filtering</label>
                        <select name="filtering" id="filtering" class="flex text-sm h-8 bg-gray-300 text-black ps-4 rounded-lg">
                            <option value="0" selected>nearest</option>
                            <option value="1">linear</option>
                            <option value="2">nearest mipmap nearest</option>
                            <option value="3">linear mipmap nearest</option>
                            <option value="4">nearest mipmap linear</option>
                            <option value="5">linear mipmap linear</option>
                        </select>
                    </div>
                </div>
            </div>
        {/snippet}
    </Result>
</div>

