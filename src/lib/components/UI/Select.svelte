<script>
    let {
        label,
        options,
        value = $bindable(),
        width = '32px'
    } = $props();
</script>

<div class="flex flex-col bg-white rounded-lg p-1 {width}">
    <label for={label} class="flex text-sm h-8 items-center justify-center text-black rounded-lg">{label}</label>
    <select id={label} bind:value class="flex text-sm h-8 bg-gray-300 text-black ps-4 rounded-lg">
        {#each options as option}
            <option class="bg-white" value={option.value}>{option.label}</option>
        {/each}
    </select> 
</div>