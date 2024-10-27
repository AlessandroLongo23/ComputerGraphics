<script>
    import { inject } from '@vercel/analytics'
    import "../style/app.css";
    let { children } = $props();
</script>
  
{@render children?.()}

<style>
    :global(*) {
        user-select: none;
        font-size: 16px;
    }
</style>