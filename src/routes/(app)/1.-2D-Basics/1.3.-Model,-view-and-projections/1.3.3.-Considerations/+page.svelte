<script>
    import { convertToLatex } from '$lib/utils.svelte.js';
    import { textWidth } from '$lib/stores/layout.svelte.js';
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
        <p>Reflect on the theory of affine transformations and viewing transformations by doing the following:</p>

        <ul class="list-disc list-inside">
            <li>List the transformation matrices that you used in Parts 1 and 2 (use general expressions/functions rather than concrete numbers). [Angel 4.9, 5.3-5.5]</li>
            <li>For each cube, write down a formula showing how the matrices were concatenated to become the current transformation matrix (CTM) that was used to transform the vertices in the vertex shader. [Angel 4.10-4.11]</li>
        </ul>
    </div>

    <p class="text-xl font-medium m-0">Answers</p>
    
    <div class="flex flex-col gap-4 text-zinc-950/65 dark:text-zinc-50/65">
    </div>
</div>