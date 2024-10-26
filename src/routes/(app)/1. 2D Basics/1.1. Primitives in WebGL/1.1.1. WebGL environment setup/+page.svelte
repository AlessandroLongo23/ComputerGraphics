<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores'
    import { WebGLUtils, fetchCodeSnippets } from '$lib/utils.js';
    import Result from '$lib/components/Result.svelte';

    let viewIndex = $state(1);
    let loading = $state(true);
    let canvas = $state(), gl;
    let codeSnippets = $state([]);

    let vertices = [];

    onMount(async () => {
        if (typeof window !== 'undefined') {
            gl = WebGLUtils.setupWebGL(canvas);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);

            render();

            codeSnippets = await fetchCodeSnippets($page.url.pathname);
            loading = false;
        }
    });

    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.POINTS, 0, vertices.length);
    }
</script>

<div class="flex flex-col justify-center items-start w-4/5 text-xl m-auto">
    <div class="w-4/5 m-auto">
        <p>Create a HTML document with a 512x512 canvas element and write a script to create a WebGL context. [Angel 2.8]</p>
        <p>Setup a viewport and clear the canvas with the color cornflower blue (0.3921, 0.5843, 0.9294, 1.0). [Angel 2.5.1]</p>
        <p>If not already done, move the script to a separate JavaScript file and include it in the HTML document.</p>
        <p>Setup the WebGL context using Angel’s “setupWebGL”. You can use the window.onload event to initialize and setup the application. [Angel 2.8]</p>
    </div>

    <Result bind:canvas={canvas} bind:viewIndex={viewIndex} loading={loading} codeSnippets={codeSnippets}/>
</div>
