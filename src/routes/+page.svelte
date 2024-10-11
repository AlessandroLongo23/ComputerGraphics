<script>
    import Button from "$lib/components/UI/Button.svelte";
    import { theme } from "$lib/stores";
</script>

<div class="flex flex-col justify-center items-center h-screen">
    <div class="flex flex-col justify-center items-center mb-16">
        <p class="text-3xl text-gray-900">Introductory course on</p>

        <div class="flex flex-row justify-center items-center me-9">
            <p class="text-8xl">Computer</p>
            <img src="/images/favicon-{ $theme }.png" alt="icon" class="w-16 h-16 mx-4">
            <p class="text-8xl">Graphics</p>
        </div>
    </div>

    <Button text="Start learning!" href="/home" style=""></Button> 
</div>