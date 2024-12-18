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

<div class="relative h-10 rounded-full bg-slate-200 p-1 transition-all duration-300 ease-in-out dark:bg-gray-300 {width}">
    <div class="relative flex h-full w-full items-center justify-between">
        <button onclick={() => decrement()} class="transform shadow-md transition-all duration-100 rounded-full p-2 {count === min ? 'cursor-not-allowed' : 'cursor-pointer bg-white/50 hover:bg-white hover:scale-110 active:scale-100'}">
            <Minus size={16}/>
        </button>

        <p class="m-0 mx-4">{count} {label}</p>

        <button onclick={() => increment()} class="transform shadow-md transition-all duration-100 rounded-full p-2 {count === max ? 'cursor-not-allowed' : 'cursor-pointer bg-white/50 hover:bg-white hover:scale-110 active:scale-100'}">
            <Plus size={16}/>
        </button>
    </div>
</div>