<script>
    let {
        canvas = $bindable(),
        width,
        height,
        contr,
        rounded,
    } = $props();
</script>

<div class="relative">
    <canvas bind:this={canvas} id="gl-canvas" width="{width}" height="{height}" class={rounded} ></canvas>

    {@render contr?.()}
</div>