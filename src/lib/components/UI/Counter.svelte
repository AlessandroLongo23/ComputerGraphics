<script>
    import { Plus, Minus } from 'lucide-svelte'
    
    let { 
        count = $bindable(), 
        min, 
        max,
        width = '',
        label = '',     
    } = $props();
    
    const decrement = () => {
        if (count > min)
            count--;
    }

    const increment = () => {
        if (count < max)
            count++;
    }
</script>

<div class="relative h-10 rounded-full bg-zinc-200 p-1 transition-all duration-300 ease-in-out dark:bg-zinc-800 {width}">
    <div class="relative flex h-full w-full items-center justify-between">
        <button onclick={() => decrement()} class="transform shadow-md transition-all duration-100 rounded-full p-2 text-zinc-900 dark:text-zinc-50 {count === min ? 'cursor-not-allowed' : 'cursor-pointer bg-zinc-100/50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:scale-110 active:scale-100'}">
            <Minus size={16}/>
        </button>

        <p class="m-0 mx-4 text-zinc-900 dark:text-zinc-50">{count} {label}</p>

        <button onclick={() => increment()} class="transform shadow-md transition-all duration-100 rounded-full p-2 text-zinc-900 dark:text-zinc-50 {count === max ? 'cursor-not-allowed' : 'cursor-pointer bg-zinc-100/50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:scale-110 active:scale-100'}">
            <Plus size={16}/>
        </button>
    </div>
</div>