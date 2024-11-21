<script>
    import { page } from "$app/stores";
    import { contentSequence } from "$lib/data/pages.svelte.js";
    import Toggle from "$lib/components/UI/Toggle.svelte";
    import { Sun, Moon } from "lucide-svelte";
    import { themeIndex } from "$lib/stores.svelte.js";

    const capitalize = (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    const getPage = (off) => {
        if ($page.url.pathname == '/home')
            return undefined;

        let item = contentSequence.find(it => it.href?.split('/').pop() == $page.url.pathname.split("/").pop())
        let index = contentSequence.indexOf(item);
        if (index + off < 0 || index + off >= contentSequence.length)
            return undefined;

        return contentSequence[index + off].href;
    }

    let [title, subtitle] = $derived.by(() => {
        let title = $page.url.pathname.split("/").pop();
        title = capitalize(title.replaceAll("-", " "));
        let subtitle = undefined;
        
        const parts = title.split('.');
        const count = parts.length - 1;
        
        switch (count) {
            case 1:
                subtitle = 'Section ' + parts[0] + '.';
                title = parts[1].trim();
                break;
            case 2:
                subtitle = 'Chapter ' + parts[0] + '.' + parts[1] + '.';
                title = parts[2].trim();
                break;
            case 3:
                subtitle = 'Exercise ' + parts[0] + '.' + parts[1] + '.' + parts[2] + '.';
                title = parts[3].trim();
                break;
        }

        return [title, subtitle];
    });

    let previousPageUrl = $derived.by(() => getPage(-1));
    let nextPageUrl = $derived.by(() => getPage(1));
</script>

<div class="flex flex-row justify-center items-center faded-border mx-16 mb-8 py-4">
    {#if previousPageUrl && $page.url.pathname != "/home"}
        <a href="{previousPageUrl}" aria-label="Previous page">
            <i class="fa-solid fa-arrow-left text-2xl mx-6 m-auto {$themeIndex == 0 ? 'text-black' : 'text-white'}"></i>
        </a>
    {:else}
        <i class="px-6 {$themeIndex == 0 ? 'text-black' : 'text-white'}"></i>
    {/if}

    <div class="flex flex-col justify-center items-center {subtitle ? '' : 'my-4'} w-1/2">
        {#if subtitle}
            <p class="text-xl mb-1">{subtitle}</p>
        {/if}
        <p class="text-4xl font-bold">{title}</p>
    </div>

    {#if nextPageUrl && $page.url.pathname != "/home"}
        <a href="{nextPageUrl}" aria-label="Next page">
            <i class="fa-solid fa-arrow-right text-2xl mx-6 m-auto {$themeIndex == 0 ? 'text-black' : 'text-white'}"></i>
        </a>
    {:else}
        <i class="px-6 {$themeIndex == 0 ? 'text-black' : 'text-white'}"></i>
    {/if}

    <div class="absolute right-8">
        <Toggle bind:selected={$themeIndex} icons={[Sun, Moon]}/>
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