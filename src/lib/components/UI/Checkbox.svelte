<script>
    import { Check } from 'lucide-svelte' 

    let { checked = $bindable(), label } = $props();
</script>

<div class="flex flex-row justify-center gap-2 items-center p-1 bg-zinc-300 rounded-full">
    <label class="flex cursor-pointer items-center gap-2">
        <span class="text-zinc-900 text-lg ms-4">{label}</span>
        <div class="relative flex items-center">
            <input bind:checked={checked} type="checkbox" class="before:content[''] shadow-md relative size-8 cursor-pointer appearance-none  rounded-full border before:absolute before:inset-0 disabled:cursor-not-allowed bg-zinc-100"/>
            <Check size={18} class="absolute transition-all duration-100 text-zinc-900 {checked ? 'opacity-100' : 'opacity-0'} left-1/2 -translate-x-1/2"/>
        </div>
    </label>
</div>