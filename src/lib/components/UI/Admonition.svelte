<script>
    import { admonitions } from '$lib/data/admonitions.svelte.js';
    import { themeStore } from '$lib/stores/theme.svelte.js';
    import { convertToLatex } from '$lib/utils.svelte.js';
    import { capitalize } from '$lib/utils.svelte.js';
    import * as ls from 'lucide-svelte';
    import { onMount } from 'svelte';

    let { type = 'note', title = '', textContent } = $props();

    let ad = $derived(admonitions.find(admonition => admonition.name === type));

    onMount(async () => {
        if (typeof window !== 'undefined')
            convertToLatex();
    });
</script>

{#if ad}
    <div class="{$themeStore == 0 ? ad.backgroundColor : ad.darkBackgroundColor} border-l-8 {$themeStore == 0 ? ad.borderColor : ad.darkBorderColor} text-zinc-900 dark:text-zinc-100 p-4 rounded-lg mb-4">
        <div class="flex flex-row justify-start items-center gap-4 mb-4">
            <ad.icon size={20} class={$themeStore == 0 ? ad.iconColor : ad.darkIconColor}/>
            <p class="m-0 font-bold {$themeStore == 0 ? ad.iconColor : ad.darkIconColor}">{title || capitalize(ad.name)}</p>
        </div>
        {@render textContent?.()}
    </div>
{/if}