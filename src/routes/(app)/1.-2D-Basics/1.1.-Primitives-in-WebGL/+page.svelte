<script>
    import Admonition from '$lib/components/UI/Admonition.svelte';
</script>

<div class="flex flex-col gap-1 items-start w-1/2 m-auto">
    <p>The purpose of this set of exercises is to get started with WebGL (if you prefer, you can use WebGPU instead of WebGL).</p>
    <p>You will setup a WebGL application from scratch, create a canvas and a WebGL context, compile and use simplistic shader programs, setup the needed buffers for drawing, and draw and animate simple shapes.</p>
    
    <Admonition type='tip'>
        {#snippet textContent()}
            <p>A handy WebGL quick reference card can be downloaded <a href="https://www.khronos.org/files/webgl/webgl-reference-card-1_0.pdf">here</a> and a Basic JavaScript reference can be found at this <a href="http://www.w3schools.com/jsref/">link</a>.</p>
        {/snippet}
    </Admonition>

    <Admonition type='tip'>
        {#snippet textContent()}
            <p>You can press F12 or right click and choose "Inspect [element]" in most browsers to show the developer/debug menus which can be quite helpful.</p>
        {/snippet}
    </Admonition>
</div>