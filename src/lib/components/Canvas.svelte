<script>
    export let canvas;
    export let view_index;
</script>

<div class="relative {view_index !== 0 ? 'visible' : 'hidden'}">
    <canvas bind:this={canvas} id="gl-canvas" width="512" height="512" class="rounded-{view_index == 2 ? 'r-' : ''}lg"></canvas>

    <slot name='input/output'></slot>
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