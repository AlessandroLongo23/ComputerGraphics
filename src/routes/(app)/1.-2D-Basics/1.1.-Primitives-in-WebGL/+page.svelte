<script>
    import Admonition from '$lib/components/UI/Admonition.svelte';
    import Section from '$lib/components/Section.svelte';
</script>

<div class="flex flex-col gap-12">
    <div class="flex flex-col gap-6 items-start w-1/2 m-auto">
        <p class="text-xl font-medium m-0">Introduction</p>

        <div class="flex flex-col gap-4 text-zinc-950/65 dark:text-zinc-50/65">
            <p>The purpose of this set of exercises is to get started with WebGL (if you prefer, you can use WebGPU instead of WebGL).</p>
            <p>You will setup a WebGL application from scratch, create a canvas and a WebGL context, compile and use simplistic shader programs, setup the needed buffers for drawing, and draw and animate simple shapes.</p>
            
            <Admonition type='tip'>
                {#snippet textContent()}
                    <p>A handy WebGL quick reference card can be downloaded <a class="text-teal-400 hover:text-teal-500" href="https://www.khronos.org/files/webgl/webgl-reference-card-1_0.pdf">here</a> and a Basic JavaScript reference can be found at this <a class="text-teal-400 hover:text-teal-500" href="http://www.w3schools.com/jsref/">link</a>.</p>
                {/snippet}
            </Admonition>
            
            <Admonition type='tip'>
                {#snippet textContent()}
                    <p>You can press F12 or right click and choose "Inspect [element]" in most browsers to show the developer/debug menus which can be quite helpful.</p>
                {/snippet}
            </Admonition>
        </div>
    </div>

    <Section IndexingLevel="Exercises"></Section>
</div>
