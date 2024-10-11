<script>
    import * as ls from 'lucide-svelte'
    import { admonitions } from '$lib/data/admonitions.js';
    import { capitalize } from '$lib/utils.js';

    export let type = 'note';
    export let title = '';

    let admonition;
    $: admonition = admonitions.find(ad => ad.name == type);
</script>

<div class="border-l-8 border-{admonition.color}-500 bg-{admonition.color}-300/25 text-black p-4 rounded-lg">
    <div class="flex flex-row justify-start items-center gap-4 mb-4">
        <svelte:component this={admonition.icon} size={20} class="text-{admonition.color}-700"/>
        <p class="m-0">{title || capitalize(admonition.name)}</p>
    </div>
    <slot name="text_content"/>
</div>