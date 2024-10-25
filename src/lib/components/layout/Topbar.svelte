<script>
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import { contentSequence } from "$lib/data/pages";
    import Toggle from "$lib/components/UI/Toggle.svelte";
    import { Sun, Moon } from "lucide-svelte";
    import { theme } from "$lib/stores";

    let title, subtitle
    let url, previousPageUrl, nextPageUrl;

    let themeIndex;
    $: themeIndex = $theme === 'light' ? 0 : 1;
    $: theme.set(themeIndex === 0 ? 'light' : 'dark');

    onMount(() => {
        url = $page.url.pathname;
        previousPageUrl = getPage(-1);
        nextPageUrl = getPage(1);
        updateTitle();
    });

    $: {
        url = $page.url.pathname;
        previousPageUrl = getPage(-1);
        nextPageUrl = getPage(1);
        updateTitle();
    }

    function updateTitle() {
        title = $page.url.pathname.split("/").pop()
        title = capitalize(title.replaceAll("%20", " "));
        subtitle = undefined;
        
        const parts = title.split('.');
        const count = parts.length - 1;

        if (count === 1) {
            subtitle = 'Section ' + parts[0] + '.';
            title = parts[1].trim();
        } else if (count === 2) {
            subtitle = 'Chapter ' + parts[0] + '.' + parts[1] + '.';
            title = parts[2].trim();
        } else if (count === 3) {
            subtitle = 'Exercise ' + parts[0] + '.' + parts[1] + '.' + parts[2] + '.';
            title = parts[3].trim();
        }
    }

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function getPage(off) {
        if (url == '/home')
            return undefined;

        let item = contentSequence.find(item => item.href?.split('/').pop() == url.split("/").pop().replaceAll("%20", " "))
        let index = contentSequence.indexOf(item);
        if (index + off < 0 || index + off >= contentSequence.length)
            return undefined;

        return contentSequence[index + off].href;
    }
</script>

<div class="flex flex-row justify-center items-center faded-border mx-16 mb-8 py-4">
    {#if previousPageUrl && url != "/home"}
        <a href="{previousPageUrl}">
            <i class="fa-solid fa-arrow-left text-2xl mx-6 m-auto text-black"></i>
        </a>
    {:else}
        <i class="px-6 text-black"></i>
    {/if}

    <div class="flex flex-col justify-center items-center {subtitle ? '' : 'my-4'} w-1/2">
        {#if subtitle}
            <p class="text-xl mb-1">{subtitle}</p>
        {/if}
        <p class="text-4xl font-bold">{title}</p>
    </div>

    {#if nextPageUrl && url != "/home"}
        <a href="{nextPageUrl}">
            <i class="fa-solid fa-arrow-right text-2xl mx-6 m-auto text-black"></i>
        </a>
    {:else}
        <i class="px-6 text-black"></i>
    {/if}

    <div class="absolute right-8">
        <Toggle icons={[Sun, Moon]} bind:value={themeIndex}/>
    </div>
</div>

<style>
    .faded-border {
        position: relative;
    }

    .faded-border::after {
        content: "";
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        height: 1px;
        background: linear-gradient(to right, transparent, black, transparent);
    }
</style>