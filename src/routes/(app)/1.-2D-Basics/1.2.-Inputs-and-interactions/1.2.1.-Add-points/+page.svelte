<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores'
    import { WebGLUtils, fetchCodeSnippets, initShaders, convertToLatex } from '$lib/utils.svelte.js';
    import { vec2, flatten, sizeof } from '$lib/Libraries/MV.js';
    import Result from '$lib/components/Result.svelte';

    let viewIndex = $state(1);
    let isLoading = $state(true);
    let canvas = $state();
    let gl, program;
    let codeSnippets = $state([]);

    let vertices = [];
    let index;

    onMount(async () => {
        if (typeof window !== 'undefined') {
            convertToLatex();
            
            gl = WebGLUtils.setupWebGL(canvas);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);

            program = await initShaders(gl, program, $page.url.pathname + '/vshader.glsl', $page.url.pathname + '/fshader.glsl');

            vertices = [ 
                vec2(0.0, 0.0), 
                vec2(1.0, 0.0), 
                vec2(1.0, 1.0)
            ];
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
                gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
                var t = vec2(
                    -1 + 2 * (event.clientX - canvas.getBoundingClientRect().x) / canvas.width, 
                    -1 + 2 * (canvas.height - (event.clientY - canvas.getBoundingClientRect().y)) / canvas.height
                );
                var data = new Float32Array(t);
                
                if (index < maxPoints) {
                    gl.bufferSubData(gl.ARRAY_BUFFER, sizeof['vec2'] * index, data);
                    index++;
                } else {
                    alert("Max points reached!");
                }
            });

            render();

            codeSnippets = await fetchCodeSnippets($page.url.pathname);
            isLoading = false;
        }
    });

    const render = () => {
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.POINTS, 0, index);
        window.requestAnimFrame(render, canvas);
    }
</script>

<div class="flex flex-col justify-center items-start w-4/5 text-xl m-auto">
    <div class="w-4/5 m-auto">
        <p>Start from your solution to Part 2 of Worksheet 1: A web application that clears the canvas and then draws three points. [Angel 2.8]</p>
        <p>Attach an event handler to the mouse click event and draw points on the canvas where the mouse was clicked. [Angel 3.7]</p>
        <p>Points are offset from the tip of the mouse cursor. This is not as desired. Get the bounding rectangle of the canvas in the client area using event.target.getBoundingClientRect() and correct the mouse position using the left and top coordinates of this rectangle.</p>
    </div>

    <Result bind:canvas={canvas} bind:viewIndex={viewIndex} isLoading={isLoading} codeSnippets={codeSnippets} zipFolderPath={$page.url.pathname}/>
</div>