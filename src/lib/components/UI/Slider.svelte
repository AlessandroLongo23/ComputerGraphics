<script>
    export let min, max, value, step;
    export let id, label;
</script>

<div class="flex flex-row justify-start items-center">
    <label for="{id}" class="w-8 me-2 text-white text-lg">{label}</label>
    <input id={id}
    class="h-2 w-full appearance-none bg-gray-300 rounded-full
    [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:bg-black active:[&::-moz-range-thumb]:scale-110 [&::-moz-range-thumb]:dark:bg-white 
    [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:border-none [&::-webkit-slider-thumb]:bg-black active:[&::-webkit-slider-thumb]:scale-110 [&::-webkit-slider-thumb]:dark:bg-white [&::-webkit-slider-thumb]:rounded-full" 
    type="range" min={min} max={max} bind:value={value} step={step}
    >
</div>