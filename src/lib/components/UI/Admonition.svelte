<script>
    import * as ls from 'lucide-svelte'
    import { admonitions } from '$lib/data/admonitions.js';
    import { capitalize } from '$lib/utils.js';

    export let type = 'note';
    export let title = '';

    let ad;
    $: ad = admonitions.find(admonition => admonition.name === type);
</script>

{#if ad}
    <div class="{ad.backgroundColor} border-l-8 {ad.borderColor} text-black p-4 rounded-lg mb-4">
        <div class="flex flex-row justify-start items-center gap-4 mb-4">
            <svelte:component this={ad.icon} size={20} class="{ad.iconColor}"/>
            <p class="m-0">{title || capitalize(ad.name)}</p>
        </div>
        <slot name="textContent"/>
    </div>
{/if}