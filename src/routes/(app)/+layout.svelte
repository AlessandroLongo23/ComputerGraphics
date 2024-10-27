<script>
    import Topbar from "$lib/components/layout/Topbar.svelte";
    import LeftSidebar from "$lib/components/layout/LeftSidebar.svelte";
    import { theme } from "$lib/stores.svelte.js";
    let { children } = $props();
</script>

<div class="{ theme }">
    <LeftSidebar>
        <Topbar/>
        {@render children?.()}
    </LeftSidebar>
</div>