<script>
    import { themeIndex } from "$lib/stores.svelte.js";
    import Toggle from "$lib/components/UI/Toggle.svelte";
    import { Sun, Moon } from "lucide-svelte";
</script>

<div class="flex flex-col justify-center items-center h-screen {$themeIndex ? 'bg-neutral-900 text-white': 'bg-gray-100 text-neutral-900'}">
    <div class="absolute top-14 right-28">
        <Toggle bind:selected={$themeIndex} icons={[Sun, Moon]}/>
    </div>

    <div class="flex flex-col justify-center items-center mb-16">
        <p class="text-3xl">Introductory course on</p>

        <div class="flex flex-row justify-center items-center gap-4 me-9">
            <p class="text-8xl">Computer</p> 
            <img src="/assets/images/favicon-{ $themeIndex == 0 ? 'light' : 'dark' }.png" alt="icon" class="size-16 mb-4">
            <p class="text-8xl">Graphics</p>
        </div>
    </div>

    <a href='/home' class="bg-red-500 hover:bg-red-600 transition-colors text-white text-lg px-4 py-2 rounded-lg hover:no-underline">
        Start learning!
    </a>

    <div class="absolute flex flex-row justify-start items-center text-sm italic bottom-4 left-4">
        <img src="/assets/images/dtu.png" alt="DTU logo" class="w-5 me-4">
        <p class="text-sm m-0">
            Based on the content of the <a class="mx-1 hover:text-red-700 transition-all duration-75 hover:no-underline" href="https://www.dtu.dk/english/">DTU</a> course on Computer Graphics
        </p>
    </div>
</div>