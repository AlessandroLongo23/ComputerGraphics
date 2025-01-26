<script>
    import { themeStore } from '$lib/stores/theme.svelte.js';
    import { onMount } from 'svelte';
    let { children } = $props();

    onMount(() => {
        const storedTheme = parseInt(localStorage.getItem('theme') || '0');
        themeStore.setTheme(storedTheme);

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleThemeChange = (e) => {
            themeStore.setTheme(e.matches ? 1 : 0);
        };
        
        mediaQuery.addEventListener('change', handleThemeChange);
        return () => mediaQuery.removeEventListener('change', handleThemeChange);
    });
</script>

{@render children()}