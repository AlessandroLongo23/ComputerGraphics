<script>
    import Admonition from '$lib/components/UI/Admonition.svelte';
    import Section from '$lib/components/Section.svelte';
</script>

<div class="flex flex-col gap-12">
    <div class="flex flex-col gap-6 items-start w-1/2 m-auto">
        <p class="text-xl font-medium m-0">Introduction</p>
        
        <div class="flex flex-col gap-4 text-zinc-950/65 dark:text-zinc-50/65">
            <p>In this worksheet, we return to user interaction. Our goal is to implement interactive orbiting, dollying, and panning of the camera.</p>
        
            <ul class="list-disc list-inside">
                <li>Orbiting is moving spherically around the scene center</li>        
                <li>Dollying is moving radially to have the camera closer to the center or further away from it</li>        
                <li>Panning is moving the camera in a plane parallel to the image plane</li>        
            </ul>
                
            <p>These three interaction modes are typical for a trackball, but this is not a commonly available tool, so we implement a virtual trackball and attach it to the mouse. The virtual trackball can equally well be attached to a touch interface.</p>
        
            <Admonition type='tip'>
                {#snippet textContent()}
                    <p>Inspecting the code of the different steps in the webpage at the link below is useful as a kind of tutorial for solving the exercises. However, if you do this, be aware that the math library used for this tutorial is different. The vector math is simpler to write in the MV.js library that we are using in this course.</p>
                {/snippet}
            </Admonition>
        </div>
    </div>

    <Section IndexingLevel="Exercises"></Section>
</div>