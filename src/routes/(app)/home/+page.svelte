<script>
    import Section from "$lib/components/Section.svelte";

    let sections = [
        '1. 2D Basics',
        '2. 3D Rendering',
        '3. Advanced rendering',
        '4. Advanced techniques'
    ]
</script>

<div class="flex flex-row justify-evenly items-center w-3/4 m-auto">
    {#each sections as section}
        <Section title={section}></Section> 
    {/each}
</div>

<style>
</style>