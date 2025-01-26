<script>
    let {
        label,
        options,
        value = $bindable(),
        width = '32px'
    } = $props();
</script>

<div class="flex flex-col bg-zinc-100 rounded-lg p-1 {width}">
    <label for={label} class="flex text-sm h-8 items-center justify-center text-zinc-900 rounded-lg">{label}</label>
    <select id={label} bind:value class="flex text-sm h-8 bg-zinc-300 text-zinc-900 ps-4 rounded-lg">
        {#each options as option}
            <option class="bg-zinc-100" value={option.value}>{option.label}</option>
        {/each}
    </select> 
</div>