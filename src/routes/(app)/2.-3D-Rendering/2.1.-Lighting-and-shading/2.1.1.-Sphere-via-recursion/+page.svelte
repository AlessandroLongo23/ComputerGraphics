<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores'
    import { WebGLUtils, fetchCodeSnippets, initShaders, convertToLatex } from '$lib/utils.svelte.js';
    import * as mv from '$lib/Libraries/MV.js';
    import Result from '$lib/components/Result.svelte';
    import Counter from '$lib/components/UI/Counter.svelte';

    let viewIndex = $state(1);
    let isLoading = $state(true);
    let canvas = $state(), gl, program;
    let codeSnippets = $state([]);

    let vertices, vBuffer, baseColors, colors;
    let modelViewMatrixLoc, projectionMatrixLoc;
    let subdivisions = $state();
    let v0, v1, v2, v3;
    let thetaY = 30;

    onMount(async () => {
        if (typeof window !== 'undefined') {
            convertToLatex();

            gl = WebGLUtils.setupWebGL(canvas);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);

            try {
                [gl, program] = await initShaders(gl, program, $page.url.pathname + '/vshader.glsl', $page.url.pathname + '/fshader.glsl');

                // colors
                baseColors = [
                    mv.vec3(1.0, 0.0, 0.0),
                    mv.vec3(0.0, 1.0, 0.0),
                    mv.vec3(0.0, 0.0, 1.0),
                    mv.vec3(0.0, 0.0, 0.0)
                ];
                colors = [];

                var cBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, mv.flatten(colors), gl.STATIC_DRAW);

                var vColor = gl.getAttribLocation(program, "vColor");
                gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);  // 4 components for RGBA
                gl.enableVertexAttribArray(vColor);

                // vertices
                v0 = mv.vec4(0.0, 0.0, -1.0, 1); 
                v1 = mv.vec4(0.0, 0.942809, 0.333333, 1);
                v2 = mv.vec4(-0.816497, -0.471405, 0.333333, 1);
                v3 = mv.vec4(0.816497, -0.471405, 0.333333, 1);
                subdivisions = 0;
                
                buildPolyhedron();

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
        gl.clear(gl.COLOR_BUFFER_BIT);

        var ctm = mv.mat4();
        var projectionMatrix = mv.perspective(45, canvas.width / canvas.height, .001, 10.0);
        gl.uniformMatrix4fv(projectionMatrixLoc, false, mv.flatten(projectionMatrix));

        thetaY += 0.025;

        ctm = mv.mat4();
        ctm = mv.mult(ctm, mv.translate(0, -0.25, -4));
        ctm = mv.mult(ctm, mv.rotateY(thetaY));
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, mv.flatten(ctm));
        gl.drawArrays(gl.TRIANGLES, 0, vertices.length);

        requestAnimFrame(render);
    }

    const buildPolyhedron = () => {
        vertices = [];
        tetrahedron(v0, v1, v2, v3, subdivisions);

        vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, mv.flatten(vertices), gl.STATIC_DRAW);

        var vPosition = gl.getAttribLocation(program, "vPosition");
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);
    }

    const tetrahedron = (a, b, c, d, n) => {
        divideTriangle(a, b, c, n, 0);
        divideTriangle(d, c, b, n, 1);
        divideTriangle(a, d, b, n, 2);
        divideTriangle(a, c, d, n, 3);
    }

    const divideTriangle = (a, b, c, count, colorIndex) => {
        if (count == 0) {
            triangle(a, b, c, colorIndex);
            return;
        }

        var ab = mv.normalize(mv.mix(a, b, 0.5), true);
        var ac = mv.normalize(mv.mix(a, c, 0.5), true);
        var bc = mv.normalize(mv.mix(b, c, 0.5), true);

        divideTriangle(a, ab, ac, count - 1);
        divideTriangle(ab, b, bc, count - 1);
        divideTriangle(bc, c, ac, count - 1);
        divideTriangle(ab, bc, ac, count - 1);
    }

    const triangle = (a, b, c, colorIndex) => {
        colors.push(baseColors[colorIndex]);
        vertices.push(a);
        colors.push(baseColors[colorIndex]);
        vertices.push(b);
        colors.push(baseColors[colorIndex]);
        vertices.push(c);
    }

    $effect(() => {
        subdivisions != undefined && buildPolyhedron();
    });
</script>

<div class="flex flex-col justify-center items-start w-4/5 text-xl m-auto">
    <div class="w-4/5 m-auto">
        <p class="text-black text-xl">Draw a sphere in perspective view.</p>  
        <p>Start from Part 2 of Worksheet 3, which draws three wireframe cubes in perspective view. Simplify such that you draw just one cube in the image center and switch to drawing triangles instead of wireframe. [Angel 2.4.2, 4.6, 5.3, 5.6]</p>
        <p>Draw a unit sphere instead of a unit cube using recursive subdivision of a tetrahedron. [Angel 6.6]</p>
        <p>Insert two buttons: one which increments the subdivision level and one which decrements the subdivision level. [Angel 3.6.2]</p>
    </div>

    <Result bind:canvas={canvas} bind:viewIndex={viewIndex} isLoading={isLoading} codeSnippets={codeSnippets} folderPath={$page.url.pathname}>
        {#snippet controls()}
            <div class="absolute left-0 top-0 flex flex-row justify-evenly items-center gap-4 w-full p-4 bg-gray-900/25 rounded-{viewIndex == 1 && 'r-'}lg">    
                <Counter bind:count={subdivisions} min={0} max={6}/>
            </div>
        {/snippet}
    </Result>
</div>


