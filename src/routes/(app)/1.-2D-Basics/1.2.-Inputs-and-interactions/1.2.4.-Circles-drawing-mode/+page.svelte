<script>
    import { WebGLUtils, fetchCodeSnippets, initShaders, convertToLatex } from '$lib/utils.svelte.js';
    import { vec2, vec4, flatten, sizeof } from '$lib/Libraries/MV.js';
    import { textWidth } from '$lib/stores/layout.svelte.js';
    import { Dot, Triangle, Circle } from 'lucide-svelte';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';

    import Toggle from '$lib/components/UI/Toggle.svelte';
    import Result from '$lib/components/Result.svelte';

    let viewIndex = $state(1);
    let isLoading = $state(true);
    let canvas = $state();
    let gl, program;
    let codeSnippets = $state([]);

    let cBuffer, vColor;
    let mode = 'points';
    let side = 20;
    let count = 0;
    let maxPoints = 1000;
    let numTriangles = 32;
    let modeIndex = $state(0);
    let colors;
    let vertices;

    onMount(async () => {
        if (typeof window !== 'undefined') {
            convertToLatex();

            gl = WebGLUtils.setupWebGL(canvas);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);

            program = await initShaders(gl, program, $page.url.pathname + '/vshader.glsl', $page.url.pathname + '/fshader.glsl');

            colors = [];
            vertices = [];
            
            var vBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec2'] * maxPoints, gl.STATIC_DRAW);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));
            
            var vPosition = gl.getAttribLocation(program, "vPosition");
            gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(vPosition);

            canvas.addEventListener("click", function(event) {
                if (mode == 'points') {
                    switch(document.getElementById("pointscolor").selectedIndex) {
                        case 0:
                            for (let i = 0; i < 6; i++)
                                colors.push(vec4(0.0, 0.0, 0.0, 1.0));
                            break;
                        case 1:
                            for (let i = 0; i < 6; i++)
                                colors.push(vec4(1.0, 1.0, 1.0, 1.0));
                            break;
                    }
                } else if (mode == 'triangles') {
                    count++;
                    if (count == 3) {
                        var firstVertexColor = colors[colors.length - 6];
                        var secondVertexColor = colors[colors.length - 3];
                        colors = colors.slice(0, colors.length - 12);
                        colors.push(firstVertexColor);
                        colors.push(secondVertexColor);
                        switch(document.getElementById("pointscolor").selectedIndex) {
                            case 0:
                                colors.push(vec4(0.0, 0.0, 0.0, 1.0)); 
                                break;
                            case 1:
                                colors.push(vec4(1.0, 1.0, 1.0, 1.0));
                                break;
                        }
                    } else {
                        switch(document.getElementById("pointscolor").selectedIndex) {
                            case 0:
                                for (let i = 0; i < 6; i++)
                                    colors.push(vec4(0.0, 0.0, 0.0, 1.0));
                                break;
                            case 1:
                                for (let i = 0; i < 6; i++)
                                    colors.push(vec4(1.0, 1.0, 1.0, 1.0));
                                break;
                        }
                    }
                } else if (mode == 'circles') {
                    count++;
                    if (count == 2) {
                        var centerColor = colors[colors.length - 1];
                        switch(document.getElementById("pointscolor").selectedIndex) {
                            case 0:
                                for (let i = 0; i < numTriangles; i++) {
                                    colors.push(vec4(0.0, 0.0, 0.0, 1.0));
                                    colors.push(vec4(0.0, 0.0, 0.0, 1.0));
                                    colors.push(centerColor);
                                }
                                break;
                            case 1:
                                for (let i = 0; i < numTriangles; i++) {
                                    colors.push(vec4(1.0, 1.0, 1.0, 1.0));
                                    colors.push(vec4(1.0, 1.0, 1.0, 1.0));
                                    colors.push(centerColor);
                                }
                                break;
                        }
                    } else {
                        switch(document.getElementById("pointscolor").selectedIndex) {
                            case 0:
                                for (let i = 0; i < 6; i++)
                                    colors.push(vec4(0.0, 0.0, 0.0, 1.0));
                                break;
                            case 1:
                                for (let i = 0; i < 6; i++)
                                    colors.push(vec4(1.0, 1.0, 1.0, 1.0));
                                break;
                        }
                    }
                }

                cBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
                vColor = gl.getAttribLocation(program, "vColor");
                gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(vColor);

                var t = vec2(
                    -1 + 2 * (event.clientX - canvas.getBoundingClientRect().x) / canvas.width,
                    1 - 2 * (event.clientY - canvas.getBoundingClientRect().y) / canvas.height
                );
                var newVertices = [];
                if (mode == 'points') {
                    newVertices = [
                        vec2(t[0] - side / canvas.width, t[1] - side / canvas.height),
                        vec2(t[0] - side / canvas.width, t[1] + side / canvas.height),
                        vec2(t[0] + side / canvas.width, t[1] + side / canvas.height),

                        vec2(t[0] - side / canvas.width, t[1] - side / canvas.height),
                        vec2(t[0] + side / canvas.width, t[1] - side / canvas.height),
                        vec2(t[0] + side / canvas.width, t[1] + side / canvas.height),
                    ]
                } else if (mode == 'triangles') {
                    if (count == 3) {
                        var firstVertex = vec2(
                            (vertices[vertices.length - 1][0] + vertices[vertices.length - 3][0]) / 2, 
                            (vertices[vertices.length - 1][1] + vertices[vertices.length - 3][1]) / 2
                        );
                        var secondVertex = vec2(
                            (vertices[vertices.length - 7][0] + vertices[vertices.length - 9][0]) / 2, 
                            (vertices[vertices.length - 7][1] + vertices[vertices.length - 9][1]) / 2
                        );

                        vertices = vertices.slice(0, vertices.length - 12);

                        newVertices = [
                            firstVertex,
                            secondVertex,
                            t
                        ]
                        count = 0;
                    } else {
                        newVertices = [
                            vec2(t[0] - side / canvas.width, t[1] - side / canvas.height),
                            vec2(t[0] - side / canvas.width, t[1] + side / canvas.height),
                            vec2(t[0] + side / canvas.width, t[1] + side / canvas.height),
            
                            vec2(t[0] - side / canvas.width, t[1] - side / canvas.height),
                            vec2(t[0] + side / canvas.width, t[1] - side / canvas.height),
                            vec2(t[0] + side / canvas.width, t[1] + side / canvas.height),
                        ]
                    }
                } else if (mode == 'circles') {
                    if (count == 2) {
                        var center = vec2(
                            (vertices[vertices.length - 1][0] + vertices[vertices.length - 3][0]) / 2, 
                            (vertices[vertices.length - 1][1] + vertices[vertices.length - 3][1]) / 2
                        );
                        var rad = Math.sqrt(Math.pow(center[0] - t[0], 2) + Math.pow(center[1] - t[1], 2));

                        newVertices = [];
                        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI * 2 / numTriangles) {
                            newVertices.push(vec2(
                                center[0] + rad * Math.cos(angle),
                                center[1] + rad * Math.sin(angle)
                            ));
                            newVertices.push(vec2(
                                center[0] + rad * Math.cos(angle + Math.PI * 2 / numTriangles),
                                center[1] + rad * Math.sin(angle + Math.PI * 2 / numTriangles)
                            ));
                            newVertices.push(center);
                        }
                        count = 0;
                    } else {
                        newVertices = [
                            vec2(t[0] - side / canvas.width, t[1] - side / canvas.height),
                            vec2(t[0] - side / canvas.width, t[1] + side / canvas.height),
                            vec2(t[0] + side / canvas.width, t[1] + side / canvas.height),
            
                            vec2(t[0] - side / canvas.width, t[1] - side / canvas.height),
                            vec2(t[0] + side / canvas.width, t[1] - side / canvas.height),
                            vec2(t[0] + side / canvas.width, t[1] + side / canvas.height),
                        ]
                    }
                }
                
                for (let i = 0; i < newVertices.length; i++)
                    vertices.push(newVertices[i]);

                gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
                gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));
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

                count = 0;

                vertices = [];
                gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
                gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(vertices));
            });

            codeSnippets = await fetchCodeSnippets($page.url.pathname);
            isLoading = false;
        }
    });

    const render = () => {
        mode = modeIndex == 0 ? 'points' : modeIndex == 1 ? 'triangles' : 'circles';
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, vertices.length);
        requestAnimFrame(render, canvas);
    }
</script>

<div class="flex flex-col justify-center items-start {$textWidth} text-xl m-auto gap-6">
    <p class="text-xl font-medium m-0">Assignment</p>
  
    <div class="flex flex-col gap-4 text-zinc-950/65 dark:text-zinc-50/65">
        <p>Add a button for a circle drawing mode. [Angel 3.6.2]</p>
        <p>When drawing in circle mode, add a point on the first click and keep a record of the point that was clicked. On the second click, use the position of the point on record and that of the second click to find the circle center and radius and replace the point with vertices (positions and colors) for the circle (refer to Part 5 of Worksheet 1).</p>
        <p>If needed, modify your circle drawing routine so that the circle can be drawn as triangles (using gl.TRIANGLES).</p>
    </div>  
</div>

<Result bind:canvas={canvas} bind:viewIndex={viewIndex} isLoading={isLoading} codeSnippets={codeSnippets} folderPath={$page.url.pathname}>
    {#snippet controls()}
        <div class="absolute left-0 top-0 flex flex-row justify-evenly items-center gap-4 w-full p-4 bg-zinc-900/25 rounded-{viewIndex == 1 && 'r-'}lg">    
            <div class="flex flex-col justify-between items-center gap-2">
                <button id="clear" class="flex w-32 h-8 items-center justify-center px-auto py-4 transition-colors duration-200 text-sm bg-zinc-100 hover:bg-zinc-300 text-zinc-900 rounded-lg">Clear canvas</button>
                <Toggle bind:selected={modeIndex} icons={[Dot, Triangle, Circle]}/>
            </div>
            
            <div class="flex flex-row justify-between items-center gap-4">
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