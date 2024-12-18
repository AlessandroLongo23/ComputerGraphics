<script>
    let {
        type = 'normal',
        min,
        max,
        value = $bindable(),
        step,
        id,
        label,
        precision = 2,
        showValue = true,
        f = (x) => x
    } = $props();
</script>

{#if type == 'normal'}
    <div class="flex flex-col justify-center gap-2 items-center bg-white text-black p-4 rounded-lg">
        <label for="{id}" class="text-lg">{label}<span class="text-lg">: {f(value)}</span></label>

        <input id={id}
            class="
                h-2 w-full appearance-none bg-gray-300 rounded-full hover:cursor-pointer
                [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-2 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:bg-black active:[&::-moz-range-thumb]:scale-110 [&::-moz-range-thumb]:dark:bg-blue-500 [&::-moz-range-thumb]:rounded-full 
                [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:border-none [&::-webkit-slider-thumb]:bg-black active:[&::-webkit-slider-thumb]:scale-110 [&::-webkit-slider-thumb]:dark:bg-blue-500 [&::-webkit-slider-thumb]:rounded-full
            "
            type="range" min={min} max={max} bind:value={value} step={step}
        >
    </div>
{:else if type == 'compact'}
    <div class="flex flex-row justify-center gap-2 items-center bg-white text-black px-4 py-2 rounded-lg">
        <label for="{id}" class="text-lg">{label}</label>

        <input id={id}
            class="
                h-2 w-full appearance-none bg-gray-300 rounded-full hover:cursor-pointer
                [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-2 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:bg-black active:[&::-moz-range-thumb]:scale-110 [&::-moz-range-thumb]:dark:bg-blue-500 [&::-moz-range-thumb]:rounded-full 
                [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:border-none [&::-webkit-slider-thumb]:bg-black active:[&::-webkit-slider-thumb]:scale-110 [&::-webkit-slider-thumb]:dark:bg-blue-500 [&::-webkit-slider-thumb]:rounded-full
            "
            type="range" min={min} max={max} bind:value={value} step={step}
        >

        <span class="text-lg">{f(value)?.toFixed(precision)}</span>
    </div>
{/if}
