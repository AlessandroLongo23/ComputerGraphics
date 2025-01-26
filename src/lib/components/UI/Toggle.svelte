<script>
    import * as LucideIcons from 'lucide-svelte';

    const selectIcon = (index) => {
        selected = index;
    }

    let off = 2.25;
    let { selected = $bindable(0), icons } = $props();

    let options = [];
    for (let i in icons)
        options.push({
            icon: icons[i],
            translateClass: 'transform: translateX(' + (off * i) + 'rem);'
        })
</script>

<div class="relative h-10 rounded-full bg-zinc-200 p-1 transition-all duration-300 ease-in-out hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700" aria-label={`Selected icon: ${selected}`} style="width: {off * icons.length + 0.25}rem">
    <div class="absolute left-1 w-8 aspect-square transform rounded-full bg-zinc-100 shadow-md transition-all duration-500 ease-in-out dark:bg-zinc-900" style="{options[selected].translateClass}"></div>

    <div class="relative flex h-full w-full items-center justify-between px-2">
        {#each options as option, i}
            <button onclick={() => selectIcon(i)} class="transform transition-all duration-300 cursor-pointer hover:scale-110 {selected === i ? 'scale-110 text-zinc-900 dark:text-zinc-100' : 'scale-90 text-zinc-600 dark:text-zinc-400'}">
                <option.icon size={selected === i ? 16 : 14}/>
            </button>
        {/each}
    </div>
</div>