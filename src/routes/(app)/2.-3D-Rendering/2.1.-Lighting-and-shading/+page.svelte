<script>
    import Section from '$lib/components/Section.svelte';
</script>

<div class="flex flex-col gap-12">
    <div class="flex flex-col gap-6 items-start w-1/2 m-auto">
        <p class="text-xl font-medium m-0">Introduction</p>
        
        <div class="flex flex-col gap-4 text-zinc-950/65 dark:text-zinc-50/65">
            <p>The purpose of this set of exercises is to get acquainted with lighting and shading in WebGL and GLSL.</p>
            <p>We compute the local illumination of an object based on ambient, diffuse and specular material properties, and a light source.</p>
            <p>When working on the following exercises, please consider the <a href="http://dtu.cnwiki.dk/angel02561/page/3665/chapter-6-worksheet-4">Wiki with clarifications</a> for the textbook.</p>
        </div>
    </div>

    <Section IndexingLevel="Exercises"></Section>
</div>