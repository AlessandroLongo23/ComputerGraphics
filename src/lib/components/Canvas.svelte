<script>
    export let canvas;
    export let viewIndex;
    export let width = 512;
</script>

<div class="relative {viewIndex !== 0 ? 'visible' : 'hidden'}">
    <canvas bind:this={canvas} id="gl-canvas" width="{width}" height="512" class="rounded-lg {viewIndex == 1 ? 'rounded-l-none' : ''}"></canvas>

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