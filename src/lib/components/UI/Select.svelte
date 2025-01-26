<script>
    let {
        label,
        options,
        value = $bindable(),
        width = '32px'
    } = $props();
</script>

<div class="flex flex-col bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1 {width}">
    <label for={label} class="flex text-sm h-8 items-center justify-center text-zinc-900 dark:text-zinc-100 rounded-lg">{label}</label>
    <select id={label} bind:value class="flex text-sm h-8 bg-zinc-300 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 ps-4 rounded-lg">
        {#each options as option}
            <option class="bg-zinc-100 dark:bg-zinc-800" value={option.value}>{option.label}</option>
        {/each}
    </select> 
</div>