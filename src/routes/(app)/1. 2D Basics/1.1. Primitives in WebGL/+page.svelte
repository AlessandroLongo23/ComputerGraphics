<script>
    import Section from "$lib/components/Section.svelte";

    let sections = [
        '1.1.1. WebGL environment setup',
        '1.1.2. Shades and buffers',
        '1.1.3. Triangles',
        '1.1.4. Rotating square',
        '1.1.5. Fan of triangles'
    ]
</script>

<div class="flex flex-row justify-evenly items-center w-3/4 m-auto">
    {#each sections as section}
        <Section title={section}></Section> 
    {/each}
</div>

<style>
</style>