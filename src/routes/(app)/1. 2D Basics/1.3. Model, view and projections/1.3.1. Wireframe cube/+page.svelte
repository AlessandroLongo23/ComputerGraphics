<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores'
    import { WebGLUtils, fetchCodeSnippets, initShaders } from '$lib/utils.js';
    import * as mv from '$lib/Libraries/MV.js';
    import Result from '$lib/components/Result.svelte';
    import Admonition from '$lib/components/UI/Admonition.svelte';

    let viewIndex = $state(1);
    let isLoading = $state(true);
    let canvas = $state(), gl, program;
    let codeSnippets = $state([]);

    let vertices, indices, rot;
    let modelViewMatrixLoc;

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
            gl.enable(gl.DEPTH_TEST);

            try {
                [gl, program] = await initShaders(gl, program, $page.url.pathname + '/vshader.glsl', $page.url.pathname + '/fshader.glsl');

                // vertices
                vertices = [
                    mv.vec3(-0.5, -0.5, 0.5),
                    mv.vec3(-0.5, 0.5, 0.5),
                    mv.vec3(0.5, 0.5, 0.5),
                    mv.vec3(0.5, -0.5, 0.5),
                    mv.vec3(-0.5, -0.5, -0.5),
                    mv.vec3(-0.5, 0.5, -0.5),
                    mv.vec3(0.5, 0.5, -0.5),
                    mv.vec3(0.5, -0.5, -0.5)
                ];

                var vBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, mv.flatten(vertices), gl.STATIC_DRAW);

                var vPosition = gl.getAttribLocation(program, "vPosition");
                gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(vPosition);

                // colors
                var colors = [
                    [0.0, 0.0, 0.0, 1.0],  // black
                    [1.0, 0.0, 0.0, 1.0],  // red
                    [1.0, 1.0, 0.0, 1.0],  // yellow
                    [0.0, 1.0, 0.0, 1.0],  // green
                    [0.0, 0.0, 1.0, 1.0],  // blue
                    [1.0, 0.0, 1.0, 1.0],  // magenta
                    [1.0, 1.0, 1.0, 1.0],  // white
                    [0.0, 1.0, 1.0, 1.0]   // cyan
                ];

                var cBuffer = gl.createBuffer();  // Buffer for colors
                gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, mv.flatten(colors), gl.STATIC_DRAW);

                var vColor = gl.getAttribLocation(program, "vColor");
                gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);  // 4 components for RGBA
                gl.enableVertexAttribArray(vColor);

                // indices
                indices = [
                    1, 0, 3,
                    3, 2, 1,
                    2, 3, 7,
                    7, 6, 2,
                    3, 0, 4,
                    4, 7, 3,
                    6, 5, 1,
                    1, 2, 6,
                    4, 5, 6,
                    6, 7, 4,
                    5, 4, 0,
                    0, 1, 5
                ];

                var iBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);

                // Initialize rotation and transformations
                var ctm = mv.mat4();

                // Axis rotation setup
                rot = [0.0, 0.0, 0.0];
                modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
                gl.uniformMatrix4fv(modelViewMatrixLoc, false, mv.flatten(ctm));

                gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
                gl.bufferSubData(gl.ARRAY_BUFFER, 0, mv.flatten(vertices));

                render();
            } catch (error) {
                console.error(error);
            }

            codeSnippets = await fetchCodeSnippets($page.url.pathname);
            isLoading = false;
        }
    });

    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT);
        rot[0] += 0.025;
        rot[1] += 0.010;
        rot[2] -= 0.250;
        
        var ctm = mv.mat4();
        ctm = mv.mult(ctm, mv.rotateX(rot[0]));
        ctm = mv.mult(ctm, mv.rotateY(rot[1]));
        ctm = mv.mult(ctm, mv.rotateZ(rot[2]));
        
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, mv.flatten(ctm));
        gl.drawElements(gl.LINE_STRIP, indices.length, gl.UNSIGNED_BYTE, 0);
        requestAnimFrame(render);
    }
</script>

<div class="flex flex-col justify-center items-start w-4/5 text-xl m-auto">
    <div class="w-4/5 m-auto">
        <p>Draw a wireframe unit cube in isometric view.</p>  
        <p>The default viewing volume uses orthographic projection. Draw a cube using orthographic projection. [Angel 2.6.1, 4.6]</p>
        <p>Position the cube in the world coordinate system with its diagonal going from $(0,0,0)$ to $(1,1,1)$.</p>
        <p>Draw lines instead of triangles to draw in wireframe. [Angel 2.4] </p>
        <p>Build a model-view matrix that transforms the cube vertices so that the cube is in isometric view. [Angel 4.12, 5.1.3, 5.3]</p>
        <Admonition type='warning'>
            {#snippet textContent()}
                <p class="m-0">
                    If using WebGPU, a projection matrix is needed for this assignment because the default interval for depth coordinates is $[0,1]$ instead of $[-1,1]$.
                </p>
            {/snippet}
        </Admonition>
    </div>

    <Result bind:canvas={canvas} bind:viewIndex={viewIndex} isLoading={isLoading} codeSnippets={codeSnippets}/>
</div>