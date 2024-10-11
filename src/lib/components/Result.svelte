<script>
    import Toggle from '$lib/components/UI/Toggle.svelte';
    import CodeBlock from '$lib/components/CodeBlock.svelte';
    import Canvas from '$lib/components/Canvas.svelte';

    import { Code, Columns2, Play } from 'lucide-svelte';

    export let view_index;
    export let canvas;
    export let loading;
    export let code_snippets;
    export let width = 512;
</script>

<div class="mx-auto my-4">
    <Toggle icons={[Code, Columns2, Play]} bind:selected={view_index}/>
</div>

<div class="flex flex-row justify-evenly items-center m-auto">
    <div class="{view_index !== 2 ? 'visible' : 'hidden'} w-full">
        {#if !loading}
            <CodeBlock code_snippets={code_snippets} view_index={view_index} style="width: {view_index == 1 ? '768' : '1024'}px; height: 512px;"/>
        {:else}
            <p>Loading code snippets...</p>
        {/if}
    </div>

    <Canvas bind:canvas={canvas} view_index={view_index} width={width}>
        <div slot='controls'>
            <slot name='controls'/>
        </div>
    </Canvas>
</div>

<style>
</style>