<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { WebGLUtils, fetchCodeSnippets, initShaders, convertToLatex } from '$lib/utils.svelte.js';
    import { vec2, vec4, flatten, sizeof } from '$lib/Libraries/MV.js';
    import Result from '$lib/components/Result.svelte';
    import { textWidth } from '$lib/stores/layout.svelte.js';

    let viewIndex = $state(1);
    let isLoading = $state(true);
    let canvas = $state();
    let gl, program;
    let codeSnippets = $state([]);
    
    let vertices = [];
    let colors = [];
    let cBuffer, vColor;
    let index;

    onMount(async () => {
        if (typeof window !== 'undefined') {
            convertToLatex();
            
            gl = WebGLUtils.setupWebGL(canvas);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);

            program = await initShaders(gl, program, $page.url.pathname + '/vshader.glsl', $page.url.pathname + '/fshader.glsl');

            colors = []
            vertices = [];
            index = vertices.length;

            var maxPoints = 100;
            var vBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec2'] * maxPoints, gl.STATIC_DRAW);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));
            
            var vPosition = gl.getAttribLocation(program, "vPosition");
            gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(vPosition);

            canvas.addEventListener("click", function(event) {
                switch(document.getElementById("pointscolor").selectedIndex) {
                    case 0:
                        colors.push(vec4(0.0, 0.0, 0.0, 1.0));
                        break;
                    case 1:
                        colors.push(vec4(1.0, 1.0, 1.0, 1.0));
                        break;
                }

                cBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
                vColor = gl.getAttribLocation(program, "vColor");
                gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(vColor);

                gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
                var t = vec2(-1 + 2 * (event.clientX - canvas.getBoundingClientRect().x) / canvas.width, -1 + 2 * (canvas.height - (event.clientY - canvas.getBoundingClientRect().y)) / canvas.height);
                var data = new Float32Array(t);
                
                if (index < maxPoints) {
                    gl.bufferSubData(gl.ARRAY_BUFFER, sizeof['vec2'] * index, data);
                    index++;
                } else {
                    alert("Max points reached!");
                }
            });

            render();

            document.getElementById("clear").addEventListener("click", () => {
                switch(document.getElementById("mymenu").selectedIndex) {
                    case 0:
                        gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
                        break;
                    case 1:
                        gl.clearColor(87 / 255, 218 / 255, 122 / 255, 1);
                        break;
                    case 2:
                        gl.clearColor(218 / 255, 98 / 255, 87 / 255, 1.0);
                        break;
                }

                colors = [];
                cBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
                vColor = gl.getAttribLocation(program, "vColor");
                gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(vColor);

                gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
                gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(vertices));
                index = 0;
            });

            codeSnippets = await fetchCodeSnippets($page.url.pathname);
            isLoading = false;
        }
    });

    const render = () => {
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.POINTS, 0, index);
        requestAnimFrame(render, canvas);
    }
</script>

<div class="flex flex-col justify-center items-start {$textWidth} text-xl m-auto">
    <p>Add a second triangle to the previous part such that you have a quadrilateral (which is maybe even a square). [Angel 2.4]</p>
    <p>Center your quad (short form of quadrilateral) and rotate it such that it has its vertices on the coordinate axes.</p>
    <p>Add a rotation so the quad rotates around its center. Animate the rotation angle over time. Use requestAnimationFrame to continuously call your render function. [Angel 3.1]</p>
</div>

<Result bind:canvas={canvas} bind:viewIndex={viewIndex} isLoading={isLoading} codeSnippets={codeSnippets} folderPath={$page.url.pathname}>
    {#snippet controls()}
        <div class="absolute left-0 top-0 flex flex-row justify-evenly items-center gap-4 w-full p-4 bg-zinc-900/25">    
            <button id="clear" class="flex w-32 h-8 items-center justify-center px-auto py-4 transition-colors duration-200 text-sm bg-zinc-100 hover:bg-zinc-300 text-zinc-900 rounded-lg">
                Clear canvas
            </button>
            
            <div class="flex flex-row justify-between gap-4">
                <div class="flex flex-col w-32 bg-zinc-100 rounded-lg p-1">
                    <label for="mymenu" class="flex text-sm h-8 items-center justify-center text-zinc-900 rounded-lg">Background</label>
                    <select id="mymenu" class="flex text-sm h-8 bg-zinc-300 text-zinc-900 ps-4 rounded-lg">
                        <option class="bg-zinc-100" value="0" selected>Blue</option>
                        <option class="bg-zinc-100" value="1">Green</option>
                        <option class="bg-zinc-100" value="2">Red</option>
                    </select>
                </div>
                
                <div class="flex flex-col w-32 bg-zinc-100 rounded-lg p-1">
                    <label for="pointscolor" class="flex text-sm h-8 items-center justify-center text-zinc-900 rounded-lg">Point color</label>
                    <select id="pointscolor" class="flex text-sm h-8 bg-zinc-300 text-zinc-900 ps-4 rounded-lg">
                        <option class="bg-zinc-100" value="0" selected>Black</option>
                        <option class="bg-zinc-100" value="1">White</option>
                    </select>
                </div>
            </div>
        </div>
    {/snippet}
</Result>