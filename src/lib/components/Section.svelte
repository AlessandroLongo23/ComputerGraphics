<script>
    import { page } from '$app/stores';
    import { getChildren } from '$lib/data/pages.svelte.js';

    let { IndexingLevel } = $props();

    let chapters = getChildren($page.url.pathname).map(chapter => {
        return {
            title: chapter.replaceAll('-', ' '),
            href: $page.url.pathname.replace('/home', '') + "/" + chapter
        }
    })
</script>

<div class="flex flex-col gap-8 w-1/2 m-auto mb-32">
    <div class="flex flex-col gap-6">
        <p class="text-xl font-medium m-0">{IndexingLevel}</p>

        <div class="flex flex-col gap-4">
            {#each chapters as chapter}
                <div class="relative">
                    <a class="text-zinc-950 dark:text-zinc-50 opacity-65 hover:opacity-100 relative after:absolute after:bg-zinc-850 after:dark:bg-zinc-200 after:-bottom-[3px] after:left-0 after:h-[1px] after:w-0 hover:after:w-full transition-opacity duration-300 after:transition-all after:duration-300" href={chapter.href}>{chapter.title}</a>
                </div>
            {/each}
        </div>
    </div>
</div>