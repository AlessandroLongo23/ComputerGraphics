<script>
    import { textWidth } from '$lib/stores/layout.svelte.js';
    import { convertToLatex } from '$lib/utils.svelte.js';
    import { onMount } from 'svelte';

    onMount(async () => {
        if (typeof window !== 'undefined') {
            convertToLatex();
        }
    });
</script>

<div class="flex flex-col justify-center items-start {$textWidth} text-xl m-auto gap-6">
    <p class="text-xl font-medium m-0">Questions</p>
    
    <div class="flex flex-col gap-4 text-zinc-950/65 dark:text-zinc-50/65">
        <p>Answer the following questions: [Angel 5.2, 6.2, 6.3, 6.5, 6.8].</p>
        <ul class="list-disc list-inside">
            <li>a) What is the difference between Phong shading and Phong lighting (the Phong reflection model)?</li>
            <li>b) What is the difference between flat shading, Gouraud shading, and Phong shading? List pros and cons of each. Is Gouraud or Phong shading the best method for simulating highlights? Explain.</li>
            <li>c) What is the difference between a directional light and a point light?</li>
            <li>d) Does the eye position influence the shading of an object in any way?</li>
            <li>e) What is the effect of setting the specular term to $(0, 0, 0)$?</li>
            <li>f) What is the effect of increasing the shininess exponent $\alpha$?</li> 
            <li>g) In what coordinate space did you compute the lighting?</li>
        </ul>
    </div>

    <p class="text-xl font-medium m-0">Answers</p>

    <div class="flex flex-col gap-4 text-zinc-950/65 dark:text-zinc-50/65">
        <ul class="list-disc list-inside">
            <li>a)</li>
            <li>b)</li>
            <li>c)</li>
            <li>d)</li>
            <li>e)</li>
            <li>f)</li>
            <li>g)</li>
        </ul>
    </div>
</div>