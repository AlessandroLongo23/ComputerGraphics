<script>
    import { inject } from '@vercel/analytics'
	import ThemeProvider from '$lib/components/ThemeProvider.svelte';

    import "../app.css";
    let { children } = $props();
</script>

<div class="bg-zinc-200 text-zinc-850 dark:bg-zinc-850 dark:text-zinc-200">
    <ThemeProvider>
        {@render children?.()}
    </ThemeProvider>
</div>

<style>
    :global(*) {
        user-select: none;
	    font-size: 16px;
    }
</style>