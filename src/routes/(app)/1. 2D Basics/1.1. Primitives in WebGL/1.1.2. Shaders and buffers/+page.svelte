<script>
    import { onMount } from 'svelte';
    import { WebGLUtils } from '$lib/utils.js';
    import CodeBlock from '$lib/components/CodeBlock.svelte';

    let canvas, gl;
    let vertices = [];
    let code_snippets = [];
    let code_snippets_info = [
        {
            name: 'main.js',
            language: 'JavaScript',
            path: '1.1.2. Exercise 2/main.js'
        },
        {
            name: 'index.html',
            language: 'HTML',
            path: '1.1.2. Exercise 2/index.html'
        },
        {
            name: 'vshader.glsl',
            language: 'GLSL',
            path: '1.1.2. Exercise 2/vshader.glsl'
        },
        {
            name: 'fshader.glsl',
            language: 'GLSL',
            path: '1.1.2. Exercise 2/fshader.glsl'
        }
    ];
    let isLoading = true;

    onMount(async () => {
        if (typeof window !== 'undefined') {
            gl = WebGLUtils.setupWebGL(canvas);
            if (!gl) {
                alert("WebGL isn’t available");
                return;
            }
        
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);

            render();

            await fetchCodeSnippets();
            isLoading = false;
        }
    });

    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.POINTS, 0, vertices.length);
    }

    async function fetchCodeSnippets() {
        try {
            for (let info of code_snippets_info) {
                const response = await fetch(info.path); 
                if (!response.ok)
                    throw new Error('Network response was not ok');
                
                const code = await response.text();

                code_snippets = [...code_snippets, {
                    name: info.name,
                    language: info.language,
                    code: code
                }];
                }
        } catch (error) {
            console.error('Error fetching the JavaScript file:', error);
        }
    }
</script>

<div class="flex flex-col justify-center items-start w-4/5 text-xl m-auto">
    <div class="w-3/5 m-auto">
        <ul>
            <li>Load and compile a shader program. Write a basic vertex shader and a constant color fragment shader. [Angel 2.8.3 to 2.8.8]</li>
            <li>Setup a vertex buffer with the corresponding attribute pointer. Add the coordinates and draw three points of size 20 pixels, like in the figure. [Angel 2.4, 2.8, and 2.5.3] [If using WebGPU, note that points can only be of size 1. These points then need to be drawn as two triangles forming a square.] Shaders and buffers.</li>
        </ul>
    </div>

    <!-- {#if !isLoading}
        <CodeBlock code_snippets={code_snippets} classes="w-full rounded-lg" style="" />
    {:else}
        <p>Loading code snippets...</p>
    {/if} -->

    <div class="flex flex-row justify-center items-center m-auto">
        {#if !isLoading}
            <CodeBlock code_snippets={code_snippets} classes="rounded-none rounded-l-lg" style="min-width: 512px; height: 512px;" />
        {:else}
            <p>Loading code snippets...</p>
        {/if}

        <canvas bind:this={canvas} id="gl-canvas" width="512" height="512" class="rounded-r-lg"></canvas>
    </div>
</div>

<style>
</style>
