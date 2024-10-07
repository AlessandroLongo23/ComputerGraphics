<script>
    import Topbar from "$lib/components/Topbar.svelte";
    import { theme } from "$lib/stores";
</script>

<div class="{ theme }">
    <Topbar title="Computer Graphics" />
    <slot />
</div>

<style>
</style>