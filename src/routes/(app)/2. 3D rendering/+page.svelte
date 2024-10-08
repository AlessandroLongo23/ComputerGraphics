<script>
    import Section from "$lib/components/Section.svelte";

    let sections = [
        '2.1. Lighting and shading',
        '2.2. Chapter',
    ]
</script>

<div class="flex flex-row justify-evenly items-center w-3/4 m-auto">
    {#each sections as section}
        <Section title={section}></Section> 
    {/each}
</div>

<style>
</style>