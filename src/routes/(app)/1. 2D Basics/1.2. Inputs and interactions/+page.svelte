<script>
    import Section from "$lib/components/Section.svelte";

    let sections = [
        '1.2.1. Add points',
        '1.2.2. Clear canvas',
        '1.2.3. Triangles drawing mode',
        '1.2.4. Circles drawing mode',
    ]
</script>

<div class="flex flex-row justify-evenly items-center w-3/4 m-auto">
    {#each sections as section}
        <Section title={section}></Section> 
    {/each}
</div>

<style>
</style>