<script>
    import { onMount } from 'svelte';
    import { convertToLatex } from '$lib/utils.svelte.js';

    onMount(async () => {
        if (typeof window !== 'undefined') {
            convertToLatex();
        }
    });
</script>

<div class="flex flex-col justify-center items-start w-4/5 text-xl m-auto">
    <div class="w-4/5 m-auto">
        <p class="text-3xl self-center mx-auto mb-8">Questions</p>

        <p class="text-zinc-900 text-lg mb-4">Answer the following questions: [Angel 5.2, 6.2, 6.3, 6.5, 6.8].</p>
        <ul class="text-zinc-900 text-lg">
            <li class="text-zinc-900 text-lg">a) What is the difference between Phong shading and Phong lighting (the Phong reflection model)?</li>
            <li class="text-zinc-900 text-lg">b) What is the difference between flat shading, Gouraud shading, and Phong shading? List pros and cons of each. Is Gouraud or Phong shading the best method for simulating highlights? Explain.</li>
            <li class="text-zinc-900 text-lg">c) What is the difference between a directional light and a point light?</li>
            <li class="text-zinc-900 text-lg">d) Does the eye position influence the shading of an object in any way?</li>
            <li class="text-zinc-900 text-lg">e) What is the effect of setting the specular term to $(0, 0, 0)$?</li>
            <li class="text-zinc-900 text-lg">f) What is the effect of increasing the shininess exponent $\alpha$?</li> 
            <li class="text-zinc-900 text-lg">g) In what coordinate space did you compute the lighting?</li>
        </ul>

        <p class="text-3xl mt-16">Answers</p>
        <ul>
            <li class="text-zinc-900 text-lg">a)</li>
            <li class="text-zinc-900 text-lg">b)</li>
            <li class="text-zinc-900 text-lg">c)</li>
            <li class="text-zinc-900 text-lg">d)</li>
            <li class="text-zinc-900 text-lg">e)</li>
            <li class="text-zinc-900 text-lg">f)</li>
            <li class="text-zinc-900 text-lg">g)</li>
        </ul>
    </div>
</div>