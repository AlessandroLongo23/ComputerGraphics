<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores'
    import CodeBlock from '$lib/components/CodeBlock.svelte';
    import Toggle from '$lib/components/Toggle.svelte';
    import Canvas from '$lib/components/Canvas.svelte';
    import { Dot, Triangle, Code, Play, Columns2 } from 'lucide-svelte';

    import { WebGLUtils } from '$lib/utils.js';
    import { vec2, vec4, flatten, sizeof } from '$lib/Libraries/MV.js';

    let view_index = 0;

    let code_snippets = [];
    let code_snippets_info = [
        {
            name: 'main.js',
            language: 'JavaScript',
            path: $page.url.pathname + '/main.js'
        },
        {
            name: 'index.html',
            language: 'HTML',
            path: $page.url.pathname + '/index.html'
        },
        {
            name: 'vshader.glsl',
            language: 'GLSL',
            path: $page.url.pathname + '/vshader.glsl'
        },
        {
            name: 'fshader.glsl',
            language: 'GLSL',
            path: $page.url.pathname + '/fshader.glsl'
        }
    ];
    
    let isLoading = true;

    async function fetchShader(url) {
        const response = await fetch(url);
        if (!response.ok)
            throw new Error(`Failed to fetch shader: ${url}`);

        return await response.text();
    }

    let vertexShaderSource, fragmentShaderSource;
    function initShaders() {
        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vertexShaderSource);
        gl.compileShader(vertexShader);

        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragmentShaderSource);
        gl.compileShader(fragmentShader);

        program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        gl.useProgram(program);
    }

    let canvas, gl, program;
    let cBuffer, vColor;

    let mode = 'points';
    let side = 20;
    let count = 0;

    let mode_index = 0;
    let colors_array;
    let vertices;

    onMount(async () => {
        if (typeof window !== 'undefined') {
            gl = WebGLUtils.setupWebGL(canvas);
            if (!gl) {
                alert("WebGL isn't available");
                return;
            }

            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);

            try {
                vertexShaderSource = await fetchShader($page.url.pathname + '/vshader.glsl');
                fragmentShaderSource = await fetchShader($page.url.pathname + '/fshader.glsl');

                initShaders();

                // points
                colors_array = [];
                vertices = [];
                
                var max_points = 100;
                var vBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec2'] * max_points, gl.STATIC_DRAW);
                gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));
                
                var vPosition = gl.getAttribLocation(program, "vPosition");
                gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(vPosition);

                canvas.addEventListener("click", function(event) {
                    // colors
                    if (mode == 'points') {
                        switch(document.getElementById("pointscolor").selectedIndex) {
                            case 0:
                                for (var i = 0; i < 6; i++)
                                    colors_array.push(vec4(0.0, 0.0, 0.0, 1.0));
                                break;
                            case 1:
                                for (var i = 0; i < 6; i++)
                                    colors_array.push(vec4(1.0, 1.0, 1.0, 1.0));
                                break;
                        }
                    } else if (mode == 'triangles') {
                        count++;
                        if (count == 3) {
                            var first_vertex_color = colors_array[colors_array.length - 6];
                            var second_vertex_color = colors_array[colors_array.length - 3];
                            colors_array = colors_array.slice(0, colors_array.length - 12);
                            colors_array.push(first_vertex_color);
                            colors_array.push(second_vertex_color);
                            switch(document.getElementById("pointscolor").selectedIndex) {
                                case 0:
                                    colors_array.push(vec4(0.0, 0.0, 0.0, 1.0)); 
                                    break;
                                case 1:
                                    colors_array.push(vec4(1.0, 1.0, 1.0, 1.0));
                                    break;
                            }
                        } else {
                            switch(document.getElementById("pointscolor").selectedIndex) {
                                case 0:
                                    for (var i = 0; i < 6; i++)
                                        colors_array.push(vec4(0.0, 0.0, 0.0, 1.0));
                                    break;
                                case 1:
                                    for (var i = 0; i < 6; i++)
                                        colors_array.push(vec4(1.0, 1.0, 1.0, 1.0));
                                    break;
                            }
                        }
                    }

                    cBuffer = gl.createBuffer();
                    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
                    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors_array), gl.STATIC_DRAW);
                    vColor = gl.getAttribLocation(program, "vColor");
                    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
                    gl.enableVertexAttribArray(vColor);

                    // add vertex/vertices
                    var t = vec2(
                        -1 + 2 * (event.clientX - canvas.getBoundingClientRect().x) / canvas.width,
                        1 - 2 * (event.clientY - canvas.getBoundingClientRect().y) / canvas.height
                    );
                    if (mode == 'points') {
                        var new_vertices = [
                            vec2(t[0] - side / canvas.width, t[1] - side / canvas.height),
                            vec2(t[0] - side / canvas.width, t[1] + side / canvas.height),
                            vec2(t[0] + side / canvas.width, t[1] + side / canvas.height),

                            vec2(t[0] - side / canvas.width, t[1] - side / canvas.height),
                            vec2(t[0] + side / canvas.width, t[1] - side / canvas.height),
                            vec2(t[0] + side / canvas.width, t[1] + side / canvas.height),
                        ]
                    } else if (mode == 'triangles') {
                        if (count == 3) {
                            var first_vertex = vec2(
                                (vertices[vertices.length - 1][0] + vertices[vertices.length - 3][0]) / 2, 
                                (vertices[vertices.length - 1][1] + vertices[vertices.length - 3][1]) / 2
                            );
                            var second_vertex = vec2(
                                (vertices[vertices.length - 7][0] + vertices[vertices.length - 9][0]) / 2, 
                                (vertices[vertices.length - 7][1] + vertices[vertices.length - 9][1]) / 2
                            );

                            vertices = vertices.slice(0, vertices.length - 12);

                            var new_vertices = [
                                first_vertex,
                                second_vertex,
                                t
                            ]
                            count = 0;
                        } else {
                            var new_vertices = [
                                vec2(t[0] - side / canvas.width, t[1] - side / canvas.height),
                                vec2(t[0] - side / canvas.width, t[1] + side / canvas.height),
                                vec2(t[0] + side / canvas.width, t[1] + side / canvas.height),
                
                                vec2(t[0] - side / canvas.width, t[1] - side / canvas.height),
                                vec2(t[0] + side / canvas.width, t[1] - side / canvas.height),
                                vec2(t[0] + side / canvas.width, t[1] + side / canvas.height),
                            ]
                        }
                    }
                    
                    for (var i = 0; i < new_vertices.length; i++)
                        vertices.push(new_vertices[i]);

                    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
                    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));
                });

                render();
            } catch (error) {
                console.error(error);
            }

            document.getElementById("clear").addEventListener("click", function() {
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

                colors_array = [];
                cBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, flatten(colors_array), gl.STATIC_DRAW);
                vColor = gl.getAttribLocation(program, "vColor");
                gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(vColor);

                count = 0;

                vertices = [];
                gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
                gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(vertices));
            });

            await fetchCodeSnippets();
            isLoading = false;
        }
    });

    function render() {
        mode = mode_index == 0 ? 'points' : 'triangles';
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, vertices.length);
        window.requestAnimFrame(render, canvas);
    }

    async function fetchCodeSnippets() {
        try {
            for (let info of code_snippets_info) {
                const response = await fetch(info.path); 
                if (!response.ok)
                    throw new Error('Network response was not ok');
                
                const code = await response.text();

                code_snippets = [...code_snippets, {
                    name: info.name,
                    language: info.language,
                    code: code
                }];
                }
        } catch (error) {
            console.error('Error fetching the JavaScript file:', error);
        }
    }
</script>

<div class="flex flex-col justify-center items-start w-4/5 text-xl m-auto">
    <div class="w-3/5 m-auto">
        <ul>
            <li>We would now like to have two different drawing modes. One where we draw points and one where we interactively build a triangle by placing three points. Add a button for each drawing mode. [Angel 3.6.2]</li>
            <li>(Hint) What we do has some relation to the textbook CAD example [Angel 3.10], where a polygon is built interactively.</li>
            <li>Let us draw all our shapes as triangles (using gl.TRIANGLES). When a point is drawn, add vertices (positions and colors) for two triangles representing this point to the vertex buffers. In the triangle drawing mode, keep a record (array) of the former points that were clicked and their colors. When the third point is clicked, replace the two points and their colors (four triangles) with the one triangle to be drawn and clear the record.</li>
        </ul>
    </div>

    <div class="mx-auto my-4">
        <Toggle icons={[Code, Play, Columns2]} bind:selected={view_index} />
    </div>

    <div class="flex flex-row justify-center items-center w-4/5 m-auto">
        <div class="{view_index !== 1 ? 'visible' : 'hidden'} w-full">
            {#if !isLoading}
                <CodeBlock code_snippets={code_snippets} classes="rounded-{view_index === 2 ? 'l-' : ''}lg" style="{view_index === 0 ? 'min-' : ''}width: 512px; height: 512px;" />
            {:else}
                <p>Loading code snippets...</p>
            {/if}
        </div>

        <Canvas bind:canvas={canvas} view_index={view_index}>
            <div slot='input/output'>
                <div class="absolute left-0 top-0 flex flex-row justify-evenly items-center gap-4 w-full p-4 bg-gray-900/25 rounded-{view_index == 2 ? 'r-' : ''}lg">    
                    <div class="flex flex-col justify-between items-center gap-2">
                        <button id="clear" class="flex w-32 h-8 items-center justify-center px-auto py-4 transition-colors duration-200 text-sm bg-white hover:bg-gray-300 text-black rounded-lg">Clear canvas</button>
                        <Toggle icons={[Dot, Triangle]} bind:selected={mode_index}/>
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
            </div>
        </Canvas>
    </div>
</div>

<style>
</style>