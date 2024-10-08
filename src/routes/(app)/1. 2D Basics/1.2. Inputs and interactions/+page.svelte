<script>
    import Section from "$lib/components/Section.svelte";

    let sections = [
        '1.2.1. Exercise 1',
        '1.2.2. Exercise 2',
        '1.2.3. Exercise 3',
        '1.2.4. Exercise 4',
    ]
</script>

<div class="flex flex-row justify-evenly items-center w-3/4 m-auto">
    {#each sections as section}
        <Section title={section}></Section> 
    {/each}
</div>

<style>
</style>