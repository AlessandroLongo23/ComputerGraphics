<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores'
    import CodeBlock from '$lib/components/CodeBlock.svelte';
    import Toggle from '$lib/components/Toggle.svelte';
    import Canvas from '$lib/components/Canvas.svelte';
    import { Code, Play, Columns2 } from 'lucide-svelte';

    import { WebGLUtils } from '$lib/utils.js';
    import { vec2, flatten, sizeof } from '$lib/Libraries/MV.js';

    let view_index = 0;

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

    let vertexShaderSource, fragmentShaderSource;
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

    let canvas, gl, program;
    let vertices = [];
    let index;

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

                vertices = [ 
                    vec2(0.0, 0.0), 
                    vec2(1.0, 0.0), 
                    vec2(1.0, 1.0)
                ];
                index = vertices.length;

                var max_points = 100;
                var vBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec2'] * max_points, gl.STATIC_DRAW);
                
                gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));

                var vPosition = gl.getAttribLocation(program, "vPosition");
                gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(vPosition);

                canvas.addEventListener("click", function(event) {
                    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
                    var t = vec2(
                        -1 + 2 * (event.clientX - canvas.getBoundingClientRect().x) / canvas.width, 
                        -1 + 2 * (canvas.height - (event.clientY - canvas.getBoundingClientRect().y)) / canvas.height
                    );
                    var data = new Float32Array(t);
                    
                    if (index < max_points) {
                        gl.bufferSubData(gl.ARRAY_BUFFER, sizeof['vec2'] * index, data);
                        index++;
                    } else {
                        console.log("Max points reached!");
                    }
                });

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
        gl.drawArrays(gl.POINTS, 0, index);
        window.requestAnimFrame(render, canvas);
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
            <li>Start from your solution to Part 2 of Worksheet 1: A web application that clears the canvas and then draws three points. [Angel 2.8]</li>
            <li>Attach an event handler to the mouse click event and draw points on the canvas where the mouse was clicked. [Angel 3.7]</li>
            <li>Points are offset from the tip of the mouse cursor. This is not as desired. Get the bounding rectangle of the canvas in the client area using event.target.getBoundingClientRect() and correct the mouse position using the left and top coordinates of this rectangle.</li>
        </ul>
    </div>

    <div class="mx-auto my-4">
        <Toggle icons={[Code, Play, Columns2]} bind:selected={view_index}/>
    </div>

    <div class="flex flex-row justify-center items-center w-4/5 m-auto">
        <div class="{view_index !== 1 ? 'visible' : 'hidden'} w-full">
            {#if !isLoading}
                <CodeBlock code_snippets={code_snippets} classes="rounded-{view_index === 2 ? 'l-' : ''}lg" style="{view_index === 0 ? 'min-' : ''}width: 512px; height: 512px;" />
            {:else}
                <p>Loading code snippets...</p>
            {/if}
        </div>

        <Canvas bind:canvas={canvas} view_index={view_index}/>
    </div>
</div>

<style>
</style>