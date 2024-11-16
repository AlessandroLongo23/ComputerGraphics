<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores'
    import { WebGLUtils, fetchCodeSnippets, initShaders } from '$lib/utils.svelte.js';
    import { vec2, vec4, flatten, sizeof } from '$lib/Libraries/MV.js';
    import Result from '$lib/components/Result.svelte';
    import Toggle from '$lib/components/UI/Toggle.svelte';
    import Admonition from '$lib/components/UI/Admonition.svelte';
    import { Dot, Triangle } from 'lucide-svelte'

    let viewIndex = $state(1);
    let isLoading = $state(true);
    let canvas = $state(), gl, program;
    let codeSnippets = $state([]);

    let cBuffer, vColor;
    let mode = 'points';
    let side = 20;
    let count = 0;
    let modeIndex = $state(0);
    let colors;
    let vertices;

    onMount(async () => {
        if (typeof window !== 'undefined') {
            if (window.MathJax) {
                window.MathJax.typesetPromise && window.MathJax.typesetPromise();

                document.querySelectorAll("[class*='mjx']").forEach(function(el) {
                    el.style.fontSize = '20px';
                });

                document.querySelectorAll("[size='s']").forEach(function(parent) {
                    parent.querySelectorAll('*').forEach(function(el) {
                        el.style.fontSize = '16px';
                    });
                });
            }

            gl = WebGLUtils.setupWebGL(canvas);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);

            try {
                [gl, program] = await initShaders(gl, program, $page.url.pathname + '/vshader.glsl', $page.url.pathname + '/fshader.glsl');

                colors = [];
                vertices = [];
                
                var maxPoints = 100;
                var vBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec2'] * maxPoints, gl.STATIC_DRAW);
                gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));
                
                var vPosition = gl.getAttribLocation(program, "vPosition");
                gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(vPosition);

                canvas.addEventListener("click", function(event) {
                    // colors
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
                    }

                    cBuffer = gl.createBuffer();
                    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
                    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
                    vColor = gl.getAttribLocation(program, "vColor");
                    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
                    gl.enableVertexAttribArray(vColor);

                    // add vertex/vertices
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
                        newVertices = [];
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
                    }
                    
                    for (var i = 0; i < newVertices.length; i++)
                        vertices.push(newVertices[i]);

                    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
                    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));
                });

                render();
            } catch (error) {
                console.error(error);
            }

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
        mode = modeIndex == 0 ? 'points' : 'triangles';
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, vertices.length);
        window.requestAnimFrame(render, canvas);
    }
</script>

<div class="flex flex-col justify-center items-start w-4/5 text-xl m-auto">
    <div class="w-4/5 m-auto">
        <p>We would now like to have two different drawing modes. One where we draw points and one where we interactively build a triangle by placing three points. Add a button for each drawing mode. [Angel 3.6.2]</p>
        <Admonition type='tip'>
            {#snippet textContent()}
                <p class="m-0">
                    What we do has some relation to the textbook CAD example [Angel 3.10], where a polygon is built interactively.
                </p>
            {/snippet}
        </Admonition>
        <p>Let us draw all our shapes as triangles (using gl.TRIANGLES). When a point is drawn, add vertices (positions and colors) for two triangles representing this point to the vertex buffers. In the triangle drawing mode, keep a record (array) of the former points that were clicked and their colors. When the third point is clicked, replace the two points and their colors (four triangles) with the one triangle to be drawn and clear the record.</p>
    </div>

    <Result bind:canvas={canvas} bind:viewIndex={viewIndex} isLoading={isLoading} codeSnippets={codeSnippets} folderPath={$page.url.pathname}>
        {#snippet controls()}
            <div class="absolute left-0 top-0 flex flex-row justify-evenly items-center gap-4 w-full p-4 bg-gray-900/25 rounded-{viewIndex == 1 && 'r-'}lg">    
                <div class="flex flex-col justify-between items-center gap-2">
                    <button id="clear" class="flex w-32 h-8 items-center justify-center px-auto py-4 transition-colors duration-200 text-sm bg-white hover:bg-gray-300 text-black rounded-lg">Clear canvas</button>
                    <Toggle bind:selected={modeIndex} icons={[Dot, Triangle]}/>
                </div>
                
                <div class="flex flex-row justify-between items-center gap-4">
                    <div class="flex flex-col w-32 bg-white rounded-lg p-1">
                        <label for="mymenu" class="flex text-sm h-8 items-center justify-center text-black rounded-lg">Background</label>
                        <select id="mymenu" class="flex text-sm h-8 bg-gray-300 text-black ps-4 rounded-lg">
                            <option class="bg-white" value="0" selected>Blue</option>
                            <option class="bg-white" value="1">Green</option>
                            <option class="bg-white" value="2">Red</option>
                        </select>
                    </div>
                    
                    <div class="flex flex-col w-32 bg-white rounded-lg p-1">
                        <label for="pointscolor" class="flex text-sm h-8 items-center justify-center text-black rounded-lg">Point color</label>
                        <select id="pointscolor" class="flex text-sm h-8 bg-gray-300 text-black ps-4 rounded-lg">
                            <option class="bg-white" value="0" selected>Black</option>
                            <option class="bg-white" value="1">White</option>
                        </select>
                    </div>
                </div>
            </div>
        {/snippet}
    </Result>
</div>