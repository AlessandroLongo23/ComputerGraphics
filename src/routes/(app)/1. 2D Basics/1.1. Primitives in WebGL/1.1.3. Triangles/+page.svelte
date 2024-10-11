<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores'
    import { WebGLUtils, fetchCodeSnippets, initShaders } from '$lib/utils.js';
    import * as mv from '$lib/Libraries/MV.js';
    import Result from '$lib/components/Result.svelte'

    let loading = true;
    let view_index = 1;
    let canvas, gl, program;
    let code_snippets = [];

    let vertices = [];
    let colors_array = [];

    onMount(async () => {
        if (typeof window !== 'undefined') {
            gl = WebGLUtils.setupWebGL(canvas);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);

            try {
                [gl, program] = await initShaders(gl, program, $page.url.pathname + '/vshader.glsl', $page.url.pathname + '/fshader.glsl');

                // vertices
                vertices = [ mv.vec2(0.0, 0.0), mv.vec2(1.0, 0.0), mv.vec2(1.0, 1.0) ];

                var vBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, mv.flatten(vertices), gl.STATIC_DRAW);

                var vPosition = gl.getAttribLocation(program, "vPosition");
                gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(vPosition);

                // colors
                colors_array = [ 
                    mv.vec4(1.0, 0.0, 0.0, 1.0), 
                    mv.vec4(0.0, 1.0, 0.0, 1.0), 
                    mv.vec4(0.0, 0.0, 1.0, 1.0) 
                ];

                var cBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, mv.flatten(colors_array), gl.STATIC_DRAW);

                var vColor = gl.getAttribLocation(program, "vColor");
                gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(vColor);

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
        gl.drawArrays(gl.TRIANGLES, 0, vertices.length);
    }
</script>

<div class="flex flex-col justify-center items-start w-4/5 text-xl m-auto">
    <div class="w-4/5 m-auto">
        <ul>
            <li>Change the code in the previous example to draw triangles instead of points. [Angel 2.4.2]</li>
            <li>Extend the application to include a second buffer for vertex colors and draw the triangle with a red, a green, and a blue vertex color. [Angel 2.5.1 and 2.10]</li>
        </ul>
    </div>

    <Result bind:canvas={canvas} bind:view_index={view_index} loading={loading} code_snippets={code_snippets}/>
</div>

<style>
</style>