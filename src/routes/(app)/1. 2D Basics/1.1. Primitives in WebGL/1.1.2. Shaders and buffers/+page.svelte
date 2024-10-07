<script>
    import { onMount } from 'svelte';
    import { WebGLUtils } from '$lib/utils.js';
    import { vec2, flatten } from '$lib/Libraries/MV.js';
    import CodeBlock from '$lib/components/CodeBlock.svelte';

    let canvas, gl, program;
    let vertices = [];
    let vertexShaderSource, fragmentShaderSource;
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

    async function fetchShader(url) {
        const response = await fetch(url);
        if (!response.ok)
            throw new Error(`Failed to fetch shader: ${url}`);

        return await response.text();
    }

    function initShaders() {
        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vertexShaderSource);
        gl.compileShader(vertexShader);

        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragmentShaderSource);
        gl.compileShader(fragmentShader);

        program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        gl.useProgram(program);
    }

    onMount(async () => {
        if (typeof window !== 'undefined') {
            gl = WebGLUtils.setupWebGL(canvas);
            if (!gl) {
                alert("WebGL isn’t available");
                return;
            }
        
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);

            try {
                vertexShaderSource = await fetchShader('/1. 2D Basics/1.1. Primitives in WebGL/1.1.2. Exercise 2/vshader.glsl');
                fragmentShaderSource = await fetchShader('/1. 2D Basics/1.1. Primitives in WebGL/1.1.2. Exercise 2/fshader.glsl');
                
                initShaders();

                vertices = [ vec2(0.0, 0.0), vec2(1.0, 0.0), vec2(1.0, 1.0) ];
                var vBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

                var vPosition = gl.getAttribLocation(program, "vPosition");
                gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(vPosition);

                render();
            } catch (error) {
                console.error(error);
            }

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
