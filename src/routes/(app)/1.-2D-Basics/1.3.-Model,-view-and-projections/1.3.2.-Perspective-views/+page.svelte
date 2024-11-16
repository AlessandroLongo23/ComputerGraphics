<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores'
    import { WebGLUtils, fetchCodeSnippets, initShaders, convertToLatex } from '$lib/utils.svelte.js';
    import * as mv from '$lib/Libraries/MV.js';
    import Result from '$lib/components/Result.svelte';

    let viewIndex = $state(1);
    let isLoading = $state(true);
    let canvas = $state(), gl, program;
    let codeSnippets = $state([]);

    let vertices, indices;
    let modelViewMatrixLoc;
    let projectionMatrixLoc;

    onMount(async () => {
        if (typeof window !== 'undefined') {
            convertToLatex();

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
                modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
                projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

                render();
            } catch (error) {
                console.error(error);
            }

            codeSnippets = await fetchCodeSnippets($page.url.pathname);
            isLoading = false;
        }
    });

    const render = () => {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Cube 1 - One-point perspective (front view)
        var ctm = mv.mat4();
        var projectionMatrix = mv.perspective(45, canvas.width / canvas.height, .001, 10.0);
        gl.uniformMatrix4fv(projectionMatrixLoc, false, mv.flatten(projectionMatrix));

        ctm = mv.mult(ctm, mv.translate(-1.5, 0, -3));  // Move to the left
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, mv.flatten(ctm));
        gl.drawElements(gl.LINE_STRIP, indices.length, gl.UNSIGNED_BYTE, 0);

        // Cube 2 - Two-point perspective (X-axis rotated)
        ctm = mv.mat4();
        ctm = mv.mult(ctm, mv.translate(0, 0, -3));  // Centered
        ctm = mv.mult(ctm, mv.rotateY(30));  // Rotate around Y-axis
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, mv.flatten(ctm));
        gl.drawElements(gl.LINE_STRIP, indices.length, gl.UNSIGNED_BYTE, 0);

        // Cube 3 - Three-point perspective (X, Y, and Z rotated)
        ctm = mv.mat4();
        ctm = mv.mult(ctm, mv.translate(1.5, 0, -3));
        ctm = mv.mult(ctm, mv.rotateX(20));
        ctm = mv.mult(ctm, mv.rotateY(30));
        ctm = mv.mult(ctm, mv.rotateZ(20));
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, mv.flatten(ctm));
        gl.drawElements(gl.LINE_STRIP, indices.length, gl.UNSIGNED_BYTE, 0);

        requestAnimFrame(render);
    }
</script>

<div class="flex flex-col justify-center items-start w-4/5 text-xl m-auto">
    <div class="w-4/5 m-auto">
        <p>Draw the unit cube in different classical perspective views.</p>  
        <p>Introduce a projection matrix that sets the camera to be a pinhole camera with a 45 degrees vertical field of view. [Angel 1.4.1, 5.5-5.7] </p>
        <p>Draw the cube three times in the same rendering. Transform the cubes so that one is in one-point (front) perspective, one is in two-point (X) perspective, and one is in three-point perspective. [Angel 4.9-4.11, 5.1.5]</p>
    </div>

    <Result bind:canvas={canvas} bind:viewIndex={viewIndex} isLoading={isLoading} codeSnippets={codeSnippets} width={1024}/>
</div>