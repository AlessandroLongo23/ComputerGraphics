<script>
    let {
        canvas = $bindable(),
        width = 512,
        contr,
        rounded,
    } = $props();
</script>

<div class="relative">
    <canvas bind:this={canvas} id="gl-canvas" width="{width}" height="512" class={rounded} ></canvas>

    {@render contr?.()}
</div>