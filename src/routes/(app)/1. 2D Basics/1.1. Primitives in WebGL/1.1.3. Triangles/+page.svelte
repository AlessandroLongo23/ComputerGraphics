<script>
    import { onMount } from 'svelte';
    import { WebGLUtils } from '$lib/utils.js';
    import { vec2, vec4, flatten } from '$lib/Libraries/MV.js';
    import CodeBlock from '$lib/components/CodeBlock.svelte';

    let canvas, gl, program;
    let vertices = [];
    let colorsArray = [];
    let vertexShaderSource, fragmentShaderSource;
    let code_snippets = [];
    let code_snippets_info = [
        {
            name: 'main.js',
            language: 'JavaScript',
            path: '1.1.3. Exercise 3/main.js'
        },
        {
            name: 'index.html',
            language: 'HTML',
            path: '1.1.3. Exercise 3/index.html'
        },
        {
            name: 'vshader.glsl',
            language: 'GLSL',
            path: '1.1.3. Exercise 3/vshader.glsl'
        },
        {
            name: 'fshader.glsl',
            language: 'GLSL',
            path: '1.1.3. Exercise 3/fshader.glsl'
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
                vertexShaderSource = await fetchShader('/1. 2D Basics/1.1. Primitives in WebGL/1.1.3. Exercise 3/vshader.glsl');
                fragmentShaderSource = await fetchShader('/1. 2D Basics/1.1. Primitives in WebGL/1.1.3. Exercise 3/fshader.glsl');
                
                initShaders();

                // vertices
                vertices = [ vec2(0.0, 0.0), vec2(1.0, 0.0), vec2(1.0, 1.0) ];

                var vBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

                var vPosition = gl.getAttribLocation(program, "vPosition");
                gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(vPosition);

                // colors
                colorsArray = [ 
                    vec4(1.0, 0.0, 0.0, 1.0), 
                    vec4(0.0, 1.0, 0.0, 1.0), 
                    vec4(0.0, 0.0, 1.0, 1.0) 
                ];

                var cBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);

                var vColor = gl.getAttribLocation(program, "vColor");
                gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(vColor);

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
        gl.drawArrays(gl.TRIANGLES, 0, vertices.length);
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
            <li>Change the code in the previous example to draw triangles instead of points. [Angel 2.4.2]</li>
            <li>Extend the application to include a second buffer for vertex colors and draw the triangle with a red, a green, and a blue vertex color. [Angel 2.5.1 and 2.10]</li>
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