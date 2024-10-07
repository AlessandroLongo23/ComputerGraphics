<script>
    export let text;
    export let style;
    export let href;
</script>

<a href={href} class="bg-blue-500 hover:bg-blue-600 transition-colors text-white text-lg px-4 py-2 rounded-lg hover:no-underline" style={style}>
    {text}
</a>

<style>
</style>