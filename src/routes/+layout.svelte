<script>
    import "../style/app.css";
    let { children } = $props();
</script>
  
{@render children?.()}

<style>
    /* :global(*) {
        user-select: none;
        font-size: 16px;
    } */
</style>