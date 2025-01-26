<script>
    import { ChevronRight, ChevronLeft, Home, Sun, Moon } from "lucide-svelte";
    import { contentSequence } from "$lib/data/pages.svelte.js";
    import { themeStore } from "$lib/stores/theme.svelte.js";
    import { page } from "$app/stores";

    import Toggle from "$lib/components/UI/Toggle.svelte";
    
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
                subtitle = 'Section ' + parts[0]
                title = parts[1].trim();
                break;
            case 2:
                subtitle = 'Chapter ' + parts[0] + '.' + parts[1]
                title = parts[2].trim();
                break;
            case 3:
                subtitle = 'Exercise ' + parts[0] + '.' + parts[1] + '.' + parts[2]
                title = parts[3].trim();
                break;
        }

        return [title, subtitle];
    });

    let previousPageUrl = $derived.by(() => getPage(-1));
    let nextPageUrl = $derived.by(() => getPage(1));
</script>

<div class="flex flex-row justify-center items-center faded-border mx-16 mb-8 py-4">
    {#if previousPageUrl}
        <a 
            href="{previousPageUrl}" 
            class="flex flex-row items-center gap-2 text-zinc-950 dark:text-zinc-100 opacity-50 hover:opacity-100 relative after:absolute after:bg-zinc-850 after:dark:bg-zinc-200 after:-bottom-[3px] after:left-0 after:h-[1px] after:w-0 hover:after:w-full transition-opacity duration-300 after:transition-all after:duration-300"
        >
            <ChevronLeft size={16}/>
            Previous
        </a>
    {:else if $page.url.pathname != "/home"}
        <a 
            href="/home" 
            class="flex flex-row items-center gap-2 text-zinc-950 dark:text-zinc-100 opacity-50 hover:opacity-100 relative after:absolute after:bg-zinc-850 after:dark:bg-zinc-200 after:-bottom-[3px] after:right-0 after:h-[1px] after:w-0 hover:after:w-full transition-opacity duration-300 after:transition-all after:duration-300"
        >
            <Home size={16}/>
            Home
        </a>
    {/if}

    <div class="flex flex-col justify-center items-center {subtitle ? '' : 'my-4'} w-3/5 gap-2">
        {#if subtitle}
            <p class="text-zinc-500 m-0">{subtitle}</p>
        {/if}
        <p class="text-2xl font-bold">{title}</p>
    </div>

    {#if nextPageUrl && $page.url.pathname != "/home"}
        <a 
            href="{nextPageUrl}" 
            class="flex flex-row items-center gap-2 text-zinc-950 dark:text-zinc-100 opacity-50 hover:opacity-100 relative after:absolute after:bg-zinc-850 after:dark:bg-zinc-200 after:-bottom-[3px] after:left-0 after:h-[1px] after:w-0 hover:after:w-full transition-opacity duration-300 after:transition-all after:duration-300"
        >
            Next
            <ChevronRight size={16}/>
        </a>
    {:else}
        <i class="px-6 {$themeStore == 0 ? 'text-zinc-900' : 'text-zinc-100'}"></i>
    {/if}

    <div class="absolute right-8">
        <Toggle bind:selected={$themeStore} icons={[Sun, Moon]}/>
    </div>
</div>

<!-- <style>
    .faded-border {
        position: relative;
    }

    .faded-border::after {
        content: "";
        position: absolute;
        left: 12.50%;
        bottom: 0;
        width: 75%;
        height: 1px;
        background: linear-gradient(to right, transparent, black, transparent);
    }
</style> -->