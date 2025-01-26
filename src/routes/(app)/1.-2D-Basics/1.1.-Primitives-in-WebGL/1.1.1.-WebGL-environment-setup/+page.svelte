<script>
    import { WebGLUtils, fetchCodeSnippets, convertToLatex } from '$lib/utils.svelte.js';
    import { textWidth } from '$lib/stores/layout.svelte.js';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    
    import Result from '$lib/components/Result.svelte';
    
    let viewIndex = $state(1);
    let isLoading = $state(true);
    let canvas = $state(), gl;
    let codeSnippets = $state([]);

    let vertices = [];

    onMount(async () => {
        if (typeof window !== 'undefined') {
            convertToLatex();
            
            gl = WebGLUtils.setupWebGL(canvas);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);

            render();

            codeSnippets = await fetchCodeSnippets($page.url.pathname);
            isLoading = false;
        }
    });

    const render = () => {
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.POINTS, 0, vertices.length);
    }
</script>

<div class="flex flex-col justify-center items-start {$textWidth} text-xl m-auto gap-6">
    <p class="text-xl font-medium m-0">Assignment</p>
    
    <div class="flex flex-col gap-4">
        <p>Create a HTML document with a 512x512 canvas element and write a script to create a WebGL context. [Angel 2.8]</p>
        <p>Setup a viewport and clear the canvas with the color cornflower blue (0.3921, 0.5843, 0.9294, 1.0). [Angel 2.5.1]</p>
        <p>If not already done, move the script to a separate JavaScript file and include it in the HTML document.</p>
        <p>Setup the WebGL context using Angel's “setupWebGL”. You can use the window.onload event to initialize and setup the application. [Angel 2.8]</p>
    </div>
</div>

<Result bind:canvas={canvas} bind:viewIndex={viewIndex} isLoading={isLoading} codeSnippets={codeSnippets} folderPath={$page.url.pathname}/>
