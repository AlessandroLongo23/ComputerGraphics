<script>
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import { content_sequence } from "$lib/data";

    let title, subtitle
    let url, previous_page_url, next_page_url;

    onMount(() => {
        url = $page.url.pathname;
        previous_page_url = get_page(-1);
        next_page_url = get_page(1);
        update_title();
    });

    $: {
        url = $page.url.pathname;
        previous_page_url = get_page(-1);
        next_page_url = get_page(1);
        update_title();
    }

    function update_title() {
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
            subtitle = 'Paragraph ' + parts[0] + '.' + parts[1] + '.' + parts[2] + '.';
            title = parts[3].trim();
        }
    }

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function get_page(off) {
        if (url == '/home')
            return undefined;

        let item = content_sequence.find(item => item.label == url.split("/").slice(-1)[0].replaceAll("%20", " "))
        let index = content_sequence.indexOf(item);
        return content_sequence[index + off].href;
    }
</script>

<div class="flex flex-row justify-center items-center faded-border mx-16 mb-8 py-4">
    {#if previous_page_url}
        <a href="{previous_page_url}">
            {#if url != "/home"}
                <i class="fa-solid fa-arrow-left text-2xl mx-6 m-auto text-black"></i>
            {:else}
                <i class="px-6 m-auto text-black"></i>
            {/if}
        </a>
    {/if}

    <div class="flex flex-col justify-center items-center {subtitle ? '' : 'my-4'} w-1/2">
        {#if subtitle}
            <p class="text-xl mb-1">{subtitle}</p>
        {/if}
        <p class="text-4xl font-bold">{title}</p>
    </div>

    {#if next_page_url}
        <a href="{next_page_url}">
            {#if url != "/home"}
                <i class="fa-solid fa-arrow-right text-2xl mx-6 m-auto text-black"></i>
            {:else}
                <i class="px-6 m-auto text-black"></i>
            {/if}
        </a>
    {/if}
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