<script>
    import Topbar from "$lib/components/layout/Topbar.svelte";
    import LeftSidebar from "$lib/components/layout/LeftSidebar.svelte";
    import { themeIndex } from "$lib/stores.svelte.js";
    let { children } = $props();

    let roundedRightLarge = 'rounded-r-lg';
</script>

<div class="{ $themeIndex ? 'bg-neutral-900 text-white': 'bg-gray-100 text-neutral-900'}">
    <LeftSidebar>
        <Topbar/>
        {@render children?.()}
    </LeftSidebar>
</div>