<script>
    let {
        min,
        max,
        value = $bindable(),
        step,
        id,
        label,
        showValue = true,
        f = (x) => x
    } = $props();
</script>

<div class="flex flex-row justify-start gap-2 items-center">
    <label for="{id}" class="w-8 text-white text-lg">{label}</label>
    <input id={id}
    class="
    h-2 w-full appearance-none bg-gray-300 rounded-full hover:cursor-pointer
    [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-2 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:bg-black active:[&::-moz-range-thumb]:scale-110 [&::-moz-range-thumb]:dark:bg-white [&::-moz-range-thumb]:rounded-full 
    [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:border-none [&::-webkit-slider-thumb]:bg-black active:[&::-webkit-slider-thumb]:scale-110 [&::-webkit-slider-thumb]:dark:bg-white [&::-webkit-slider-thumb]:rounded-full
    "
    type="range" min={min} max={max} bind:value={value} step={step}
    >
    
    {#if showValue}
        <output class="w-8 text-right text-white text-lg">{f(value)}</output>
    {/if}
</div>