<script>
    import { ChevronRight, ChevronLeft, Home, Sun, Moon } from "lucide-svelte";
    import { contentSequence } from "$lib/data/pages.svelte.js";
    import { themeStore } from "$lib/stores/theme.svelte.js";
    import { page } from "$app/stores";
    import { getPage } from "$lib/utils/pages.svelte.js";

    import Toggle from "$lib/components/UI/Toggle.svelte";
    
    const capitalize = (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    
    let [title, subtitle, isExercise, isLastExercise, isFirstExercise, isFirstChapter, isLastChapter, previousText, nextText] = $derived.by(() => {
        let title = $page.url.pathname.split("/").pop();
        title = capitalize(title.replaceAll("-", " "));
        let subtitle = undefined;
        let isExercise = false;
        let isLastExercise = false;
        let isFirstExercise = false;
        let isFirstChapter = false;
        let isLastChapter = false;
        
        const parts = title.split('.');
        const count = parts.length - 1;
        
        if (count >= 1) {
            subtitle = 'Section ' + parts[0]
            title = parts[1].trim();
        }

        if (count >= 2) {
            subtitle = 'Chapter ' + parts[0] + '.' + parts[1]
            title = parts[2].trim();
            
            let currentPath = $page.url.pathname.split("/");
            let sameLevel = contentSequence.filter(it => {
                let path = it.href?.split("/");
                return path?.length === currentPath.length && 
                        path.slice(0, -1).join("/") === currentPath.slice(0, -1).join("/");
            });
            
            let index = sameLevel.findIndex(it => it.href?.split('/').pop() === currentPath[currentPath.length - 1]);
            isLastChapter = index === sameLevel.length - 1;
            isFirstChapter = index === 0;
        }

        if (count >= 3) {
            subtitle = 'Exercise ' + parts[0] + '.' + parts[1] + '.' + parts[2]
            title = parts[3].trim();
            isExercise = true;
            
            let exercisePath = $page.url.pathname.split("/");
            let sameLevelExercises = contentSequence.filter(it => {
                let path = it.href?.split("/");
                return path?.length === exercisePath.length && 
                        path.slice(0, -1).join("/") === exercisePath.slice(0, -1).join("/");
            });
            let exerciseIndex = sameLevelExercises.findIndex(it => it.href?.split('/').pop() === exercisePath[exercisePath.length - 1]);
            isLastExercise = exerciseIndex === sameLevelExercises.length - 1;
            isFirstExercise = exerciseIndex === 0;
        }

        let previousText = isExercise && isFirstExercise ? 'Back to Chapter' :
                          isFirstChapter ? 'Back to Section' :
                          isExercise ? 'Previous Exercise' :
                          subtitle?.startsWith('Chapter') ? 'Previous Chapter' :
                          subtitle?.startsWith('Section') ? 'Previous Section' :
                          'Previous';

        let nextText = isExercise && isLastExercise && isLastChapter ? 'Go to next Section' :
                      isExercise && isLastExercise ? 'Go to next Chapter' :
                      isLastChapter ? 'Go to next Section' :
                      isExercise ? 'Next Exercise' :
                      subtitle?.startsWith('Chapter') ? 'Next Chapter' :
                      subtitle?.startsWith('Section') ? 'Next Section' :
                      'Next';

        return [title, subtitle, isExercise, isLastExercise, isFirstExercise, isFirstChapter, isLastChapter, previousText, nextText];
    });

    let prevPageUrl = $derived.by(() => getPage($page.url.pathname, -1));
    let nextPageUrl = $derived.by(() => getPage($page.url.pathname, 1));
</script>

<div class="flex flex-row justify-center items-center faded-border mx-16 mb-8 py-4">
    {#if prevPageUrl}
        <a 
            href="{prevPageUrl}" 
            class="flex flex-row items-center gap-2 text-zinc-950 dark:text-zinc-50 opacity-65 hover:opacity-100 relative after:absolute after:bg-zinc-850 after:dark:bg-zinc-200 after:-bottom-[3px] after:left-0 after:h-[1px] after:w-0 hover:after:w-full transition-opacity duration-300 after:transition-all after:duration-300"
        >
            <ChevronLeft size={16}/>
            <p>{previousText}</p>
        </a>
    {:else if $page.url.pathname != "/home"}
        <a 
            href="/home" 
            class="flex flex-row items-center gap-2 text-zinc-950 dark:text-zinc-50 opacity-65 hover:opacity-100 relative after:absolute after:bg-zinc-850 after:dark:bg-zinc-200 after:-bottom-[3px] after:right-0 after:h-[1px] after:w-0 hover:after:w-full transition-opacity duration-300 after:transition-all after:duration-300"
        >
            <Home size={16}/>
            <p>Home</p>
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
            class="flex flex-row items-center gap-2 text-zinc-950 dark:text-zinc-50 opacity-65 hover:opacity-100 relative after:absolute after:bg-zinc-850 after:dark:bg-zinc-200 after:-bottom-[3px] after:left-0 after:h-[1px] after:w-0 hover:after:w-full transition-opacity duration-300 after:transition-all after:duration-300"
        >
            <p>{nextText}</p>
            <ChevronRight size={16}/>
        </a>
    {:else}
        <i class="px-6 {$themeStore == 0 ? 'text-zinc-900' : 'text-zinc-100'}"></i>
    {/if}

    <div class="absolute right-8">
        <Toggle bind:selected={$themeStore} icons={[Sun, Moon]}/>
    </div>
</div>