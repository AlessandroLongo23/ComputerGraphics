<script>
    import Topbar from "$lib/components/layout/Topbar.svelte";
    import LeftSidebar from "$lib/components/layout/LeftSidebar.svelte";
    import { theme } from "$lib/stores";
</script>

<div class="{ theme }">
    <LeftSidebar>
        <Topbar/>
        <slot />
    </LeftSidebar>
</div>