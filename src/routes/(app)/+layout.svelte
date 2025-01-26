<script>
    import Header from "$lib/components/layout/Header.svelte";
    import LeftSidebar from "$lib/components/layout/LeftSidebar.svelte";
    
    let { children } = $props();

    let roundedRightLarge = 'rounded-r-lg';
</script>

<div class="bg-zinc-100 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
    <LeftSidebar>
        <Header/>
        {@render children?.()}
    </LeftSidebar>
</div>