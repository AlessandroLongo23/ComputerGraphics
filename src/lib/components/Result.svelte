<script>
    import CodeBlock from '$lib/components/CodeBlock.svelte';
    import Canvas from '$lib/components/Canvas.svelte';
    
    import Toggle from '$lib/components/UI/Toggle.svelte';
    import { Code, Columns2, Play } from 'lucide-svelte';

    let {
        viewIndex = $bindable(),
        canvas = $bindable(),
        isLoading,
        codeSnippets,
        folderPath,
        icons = [Code, Columns2, Play],
        width = 512,
        height = 512,
        controls
    } = $props();
</script>

<div class="flex flex-col justify-center items-center text-xl m-auto mt-16 mb-32">
    <div class="mx-auto my-4">
        <Toggle bind:selected={viewIndex} icons={icons}/>
    </div>

    <div class="flex flex-row justify-evenly items-center m-auto">
        <div class="{((icons.length == 3 && viewIndex !== 2) || (icons.length == 2 && viewIndex == 0)) ? 'visible' : 'hidden'} w-full">
            {#if !isLoading}
                <CodeBlock codeSnippets={codeSnippets} viewIndex={viewIndex} folderPath={folderPath} style="width: {viewIndex == 1 ? '768' : '1024'}px; height: 512px;"/>
            {:else}
                <p>Loading code snippets...</p>
            {/if}
        </div>

        <div class="{viewIndex !== 0 ? 'visible' : 'hidden'}"> 
            <Canvas bind:canvas={canvas} width={width} height={height} rounded="rounded-lg {icons.length == 3 && viewIndex == 1 && 'rounded-l-none'}">  
                {#snippet contr()}
                    {@render controls?.()}
                {/snippet}
            </Canvas>
        </div>
    </div>
</div>
