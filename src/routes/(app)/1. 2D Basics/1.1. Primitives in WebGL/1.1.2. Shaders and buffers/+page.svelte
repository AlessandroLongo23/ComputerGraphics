<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores'
    import { WebGLUtils, fetchCodeSnippets, initShaders } from '$lib/utils.js';
    import * as mv from '$lib/Libraries/MV.js';
    import Result from '$lib/components/Result.svelte';

    let view_index = 1;
    let loading = true;
    let canvas, gl, program;
    let code_snippets = [];

    let vertices = [];

    onMount(async () => {
        if (typeof window !== 'undefined') {
            gl = WebGLUtils.setupWebGL(canvas);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);

            try {
                [gl, program] = await initShaders(gl, program, $page.url.pathname + '/vshader.glsl', $page.url.pathname + '/fshader.glsl');

                vertices = [ 
                    mv.vec2(0.0, 0.0), 
                    mv.vec2(1.0, 0.0), 
                    mv.vec2(1.0, 1.0) 
                ];
                var vBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, mv.flatten(vertices), gl.STATIC_DRAW);

                var vPosition = gl.getAttribLocation(program, "vPosition");
                gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(vPosition);

                render();
            } catch (error) {
                console.error(error);
            }

            code_snippets = await fetchCodeSnippets($page.url.pathname);
            loading = false;
        }
    });

    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.POINTS, 0, vertices.length);
    }
</script>

<div class="flex flex-col justify-center items-start w-4/5 text-xl m-auto">
    <div class="w-3/5 m-auto">
        <ul>
            <li>Load and compile a shader program. Write a basic vertex shader and a constant color fragment shader. [Angel 2.8.3 to 2.8.8]</li>
            <li>Setup a vertex buffer with the corresponding attribute pointer. Add the coordinates and draw three points of size 20 pixels, like in the figure. [Angel 2.4, 2.8, and 2.5.3] [If using WebGPU, note that points can only be of size 1. These points then need to be drawn as two triangles forming a square.] Shaders and buffers.</li>
        </ul>
    </div>

    <Result bind:canvas={canvas} bind:view_index={view_index} loading={loading} code_snippets={code_snippets}/>
</div>

<style>
</style>
