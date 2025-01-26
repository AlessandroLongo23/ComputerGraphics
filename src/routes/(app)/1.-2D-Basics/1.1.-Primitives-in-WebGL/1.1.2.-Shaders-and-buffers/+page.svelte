<script>
    import { WebGLUtils, fetchCodeSnippets, initShaders, convertToLatex } from '$lib/utils.svelte.js';
    import { textWidth } from '$lib/stores/layout.svelte.js';
    import { vec2, flatten} from '$lib/Libraries/MV.js';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    
    import Admonition from '$lib/components/UI/Admonition.svelte';
    import Result from '$lib/components/Result.svelte';

    let viewIndex = $state(1);
    let isLoading = $state(true);
    let canvas = $state();
    let gl, program;
    let codeSnippets = $state([]);

    let vertices = [];

    onMount(async () => {
        if (typeof window !== 'undefined') {
            convertToLatex();
            
            gl = WebGLUtils.setupWebGL(canvas);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);

            program = await initShaders(gl, program, $page.url.pathname + '/vshader.glsl', $page.url.pathname + '/fshader.glsl');

            initVertices();
            render();

            codeSnippets = await fetchCodeSnippets($page.url.pathname);
            isLoading = false;
        }
    });

    const initVertices = () => {
        vertices = [ 
            vec2(0.0, 0.0), vec2(1.0, 0.0), vec2(1.0, 1.0) 
        ];

        var vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

        var vPosition = gl.getAttribLocation(program, "vPosition");
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);
    }

    const render = () => {
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.POINTS, 0, vertices.length);
    }
</script>

<div class="flex flex-col justify-center items-start {$textWidth} text-xl m-auto gap-6">
    <p class="text-xl font-medium m-0">Assignment</p>
    
    <div class="flex flex-col gap-4 text-zinc-950/65 dark:text-zinc-50/65">
        <p>Load and compile a shader program. Write a basic vertex shader and a constant color fragment shader. [Angel 2.8.3 to 2.8.8]</p>
        <p>Setup a vertex buffer with the corresponding attribute pointer. Add the coordinates and draw three points of size 20 pixels, like in the figure. [Angel 2.4, 2.8, and 2.5.3]</p>

        <Admonition type="warning">
            {#snippet textContent()}
                <p>If using WebGPU, note that points can only be of size 1. These points then need to be drawn as two triangles forming a square.</p>
            {/snippet}
        </Admonition>
    </div>
</div>

<Result bind:canvas={canvas} bind:viewIndex={viewIndex} isLoading={isLoading} codeSnippets={codeSnippets} folderPath={$page.url.pathname}/>