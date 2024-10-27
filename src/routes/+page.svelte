<script>
    import { theme } from "$lib/stores.svelte.js";
</script>

<div class="flex flex-col justify-center items-center h-screen">
    <div class="flex flex-col justify-center items-center mb-16">
        <p class="text-3xl text-gray-900">Introductory course on</p>

        <div class="flex flex-row justify-center items-center me-9">
            <p class="text-8xl">Computer</p>
            <img src="./images/favicon-{ $theme }.png" alt="icon" class="w-16 h-16 mx-4">
            <p class="text-8xl">Graphics</p>
        </div>
    </div>

    <a href='/home' class="bg-red-500 hover:bg-red-600 transition-colors text-white text-lg px-4 py-2 rounded-lg hover:no-underline">
        Start learning!
    </a>

    <div class="absolute flex flex-row justify-start items-center text-sm italic bottom-4 left-4">
        <img src="images/dtu.png" alt="DTU logo" class="w-5 me-4">
        Based on the content of the <a class="mx-1 hover:text-red-700 transition-all duration-75 hover:no-underline" href="https://www.dtu.dk/english/">DTU</a> course on Computer Graphics
    </div>
</div>