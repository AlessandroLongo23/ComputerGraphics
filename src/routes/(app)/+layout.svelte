<script>
    import Topbar from "$lib/components/Topbar.svelte";
    import LeftSidebar from "$lib/components/LeftSidebar.svelte";
    import { theme } from "$lib/stores";
</script>

<div class="{ theme }">
    <LeftSidebar>
        <Topbar/>
        <slot />
    </LeftSidebar>
</div>

<style>
</style>