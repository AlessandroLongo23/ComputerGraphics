<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores'
    import CodeBlock from '$lib/components/CodeBlock.svelte';
    
    import { WebGLUtils } from '$lib/utils.js';
    import { vec2, vec4, flatten } from '$lib/Libraries/MV.js';

    let canvas, gl, program;
    let vertices = [];
    let theta, thetaLoc;

    let vertexShaderSource, fragmentShaderSource;
    let code_snippets = [];
    let code_snippets_info = [
        {
            name: 'main.js',
            language: 'JavaScript',
            path: $page.url.pathname + '/main.js'
        },
        {
            name: 'index.html',
            language: 'HTML',
            path: $page.url.pathname + '/index.html'
        },
        {
            name: 'vshader.glsl',
            language: 'GLSL',
            path: $page.url.pathname + '/vshader.glsl'
        },
        {
            name: 'fshader.glsl',
            language: 'GLSL',
            path: $page.url.pathname + '/fshader.glsl'
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
                vertexShaderSource = await fetchShader($page.url.pathname + '/vshader.glsl');
                fragmentShaderSource = await fetchShader($page.url.pathname + '/fshader.glsl');
                                
                initShaders();

                // theta
                theta = 0.0;
                thetaLoc = gl.getUniformLocation(program, "theta");

                // vertices
                vertices = [ vec2(-0.5, 0.5), vec2(0.5, 0.5), vec2(-0.5, -0.5), vec2(0.5, -0.5) ];

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

        theta += 0.025;
        gl.uniform1f(thetaLoc, theta);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertices.length);

        requestAnimFrame(render);
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
            <li>Add a second triangle to the previous part such that you have a quadrilateral (which is maybe even a square). [Angel 2.4]</li>
            <li>Center your quad (short form of quadrilateral) and rotate it such that it has its vertices on the coordinate axes.</li>
            <li>Add a rotation so the quad rotates around its center. Animate the rotation angle over time. Use requestAnimationFrame to continuously call your render function. [Angel 3.1]</li>
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