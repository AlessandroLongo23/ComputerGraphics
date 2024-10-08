<script>
    import Section from "$lib/components/Section.svelte";

    let sections = [
        '1.3.1. Exercise 1',
        '1.3.2. Exercise 2',
    ]
</script>

<div class="flex flex-row justify-evenly items-center w-3/4 m-auto">
    {#each sections as section}
        <Section title={section}></Section> 
    {/each}
</div>

<style>
</style>