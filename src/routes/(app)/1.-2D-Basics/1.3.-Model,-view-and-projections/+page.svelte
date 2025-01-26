<script>
    import Section from '$lib/components/Section.svelte';
</script>

<div class="flex flex-col gap-12">
    <div class="flex flex-col gap-6 items-start w-1/2 m-auto">
        <p class="text-xl font-medium m-0">Introduction</p>

        <div class="flex flex-col gap-4 text-zinc-950/65 dark:text-zinc-50/65">
            <p>The purpose of this set of exercises is to investigate the virtual camera and start drawing in 3D.</p>
            <p>We will work with various methods for setting up the virtual camera and adjust the parameters of the camera.</p> 
            <p>This requires that we define the matrices in the viewing pipeline and concatenate them into a transformation matrix.</p>
            <p>We will also make different pictures of the scene using various projection methods based on perspective projection and orthographic projection (axonometric views). We do this by drawing a cube using WebGL.</p>
        </div>
    </div>

    <Section IndexingLevel="Exercises"></Section>
</div>