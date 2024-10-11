<script>
    export let canvas;
    export let view_index;
    export let width = 512;
</script>

<div class="relative {view_index !== 0 ? 'visible' : 'hidden'}">
    <canvas bind:this={canvas} id="gl-canvas" width="{width}" height="512" class="rounded-lg {view_index == 1 ? 'rounded-l-none' : ''}"></canvas>

    <slot name='controls'/>
</div>

<style>
    canvas {
        transition: opacity 0.2s ease-in-out;
    }

    .visible {
        opacity: 1;
    }
    
    .hidden {
        opacity: 0;
    }
</style>