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
        <p>
            Reflect on the theory of affine transformations and viewing 
            transformations by doing the following:
        </p>
        <ul>
            <li>List the transformation matrices that you used in Parts 1 and 2 (use general expressions/functions rather than concrete numbers). [Angel 4.9, 5.3-5.5]</li>
            <li>For each cube, write down a formula showing how the matrices were concatenated to become the current transformation matrix (CTM) that was used to transform the vertices in the vertex shader. [Angel 4.10-4.11]</li>
        </ul>

        <hr class="my-8 border-black">

        <p>
            
        </p>
    </div>
</div>