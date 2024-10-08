<script>
    import Section from "$lib/components/Section.svelte";

    let sections = [
        '1.1. Primitives in WebGL',
        '1.2. Inputs and interactions',
        '1.3. Model, view and projection'
    ]
</script>

<div class="flex flex-row justify-evenly items-center w-3/4 m-auto">
    {#each sections as section}
        <Section title={section}></Section> 
    {/each}
</div>

<style>
</style>