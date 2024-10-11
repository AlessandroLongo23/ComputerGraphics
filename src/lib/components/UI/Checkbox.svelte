<script>
    import { Check } from 'lucide-svelte' 

    export let checked;
    export let label;
</script>

<div class="flex flex-row justify-center gap-2 items-center p-1 bg-gray-300 rounded-full">
    <label class="flex cursor-pointer items-center gap-2">
        <span class="text-black text-lg ms-4">{label}</span>
        <div class="relative flex items-center">
            <input bind:checked={checked} type="checkbox" class="before:content[''] shadow-md relative size-8 cursor-pointer appearance-none  rounded-full border before:absolute before:inset-0 disabled:cursor-not-allowed bg-white"/>
            <svelte:component this={Check} size={18} class="absolute transition-all duration-100 {checked ? 'text-black' : 'text-white'} left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"/>
        </div>
    </label>
</div>



