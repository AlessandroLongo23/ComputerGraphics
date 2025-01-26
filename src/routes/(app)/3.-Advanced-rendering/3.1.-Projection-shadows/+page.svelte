<script>
    import Section from '$lib/components/Section.svelte';
</script>

<div class="flex flex-col gap-12">
    <div class="flex flex-col gap-6 items-start w-1/2 m-auto">
        <p class="text-xl font-medium m-0">Introduction</p>
        
        <div class="flex flex-col gap-4 text-zinc-950/65 dark:text-zinc-50/65">
            <p>The purpose of this set of exercises is to produce simple shadows using projection matrices. As a side product, the aim is to get a better understanding of the rasterization pipeline. We are only concerned with generating the shadows.</p>
            <p>This means that the Phong illumination model is not needed for this set of exercises.</p>
        </div>
    </div>

    <Section IndexingLevel="Exercises"></Section>
</div>