<script>
    import { onMount } from "svelte";
    import { page } from "$app/stores";

    // const singlseDigitPattern = /^\d\.\s/;
    // const doubleDigitPattern = /^\d\.\d\.\s/;
    // const tripleDigitPattern = /^\d\.\d\.\d\.\s/;

    let title, subtitle, url, parent_path;

    onMount(() => {
        url = $page.url.pathname;
        update_title();
        get_parent_path();
    });

    $: {
        url = $page.url.pathname;
        update_title();
        get_parent_path();
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

    function get_parent_path() {
        if (url.split("/").length == 2)
            parent_path = "/home";
        else
            parent_path = url + '/..'
    }
</script>

<div class="flex flex-row justify-evenly items-center faded-border mx-16 mb-8 py-4">
    <a href="{parent_path}">
        {#if url != "/home"}
            <i class="fa-solid fa-arrow-left text-2xl ms-6 m-auto text-black"></i>
        {:else}
            <i class="px-6 m-auto text-black"></i>
        {/if}
    </a>

    <div class="flex flex-col justify-center items-center {subtitle ? '' : 'my-4'} w-1/3">
        {#if subtitle}
            <p class="text-xl mb-1">{subtitle}</p>
        {/if}
        <p class="text-4xl font-bold">{title}</p>
    </div>

    <a href="/home">
        <img src="/favicon.png" alt="logo" class="w-12 h-12 top-4 right-4" />
    </a>
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