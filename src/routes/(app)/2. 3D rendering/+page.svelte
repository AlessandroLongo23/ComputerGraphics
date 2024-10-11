<script>
    import { page } from '$app/stores'
    import { getChildren } from '$lib/data/pages.js';
    import Section from "$lib/components/Section.svelte";

    let sections = getChildren($page.url.pathname);
</script>

<div class="flex flex-row justify-evenly items-center w-3/4 m-auto">
    {#each sections as section}
        <Section title={section}></Section> 
    {/each}
</div>