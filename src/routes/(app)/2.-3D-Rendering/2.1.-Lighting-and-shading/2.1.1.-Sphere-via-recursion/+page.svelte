<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores'
    import { WebGLUtils, fetchCodeSnippets, initShaders, convertToLatex } from '$lib/utils.svelte.js';
    import { vec3, vec4, flatten, perspective, lookAt, mat4, mult, translate, normalize, mix } from '$lib/Libraries/MV.js';
    import Result from '$lib/components/Result.svelte';
    import Counter from '$lib/components/UI/Counter.svelte';

    let viewIndex = $state(1);
    let isLoading = $state(true);
    let canvas = $state();
    let gl, program;
    let codeSnippets = $state([]);

    let baseVertices, vertices, vBuffer;
    let baseColors, colors, cBuffer;
    let modelMatrixLoc, viewMatrixLoc, projectionMatrixLoc;
    let modelMatrix, viewMatrix, projectionMatrix;
    let eye, at, up;
    let subdivisions = $state();
    let thetaY, dist;

    onMount(async () => {
        if (typeof window !== 'undefined') {
            convertToLatex();

            gl = WebGLUtils.setupWebGL(canvas);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);

            program = await initShaders(gl, program, $page.url.pathname + '/vshader.glsl', $page.url.pathname + '/fshader.glsl');

            baseVertices = [
                vec4(0.0, 0.0, -1.0, 1), 
                vec4(0.0, 0.942809, 0.333333, 1),
                vec4(-0.816497, -0.471405, 0.333333, 1),
                vec4(0.816497, -0.471405, 0.333333, 1)
            ]

            baseColors = [
                vec4(1.0, 0.0, 0.0, 1.0),
                vec4(0.0, 1.0, 0.0, 1.0),
                vec4(0.0, 0.0, 1.0, 1.0),
                vec4(0.0, 0.0, 0.0, 1.0)
            ];

            subdivisions = 1;
            
            initMatrices();
            buildPolyhedron();

            render();

            codeSnippets = await fetchCodeSnippets($page.url.pathname);
            isLoading = false;
        }
    });

    const initMatrices = () => {
        projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
        projectionMatrix = perspective(45, canvas.width / canvas.height, .001, 10.0);
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

        viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix");
        dist = 4.0;
        thetaY = 30;
        eye = vec3(dist * Math.cos(thetaY), 0.0, dist * Math.sin(thetaY));
        at = vec3(0.0, 0.0, 0.0);
        up = vec3(0.0, 1.0, 0.0);
        viewMatrix = lookAt(eye, at, up);
        gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(viewMatrix));

        modelMatrixLoc = gl.getUniformLocation(program, "modelMatrix");
        modelMatrix = mat4();
        modelMatrix = mult(modelMatrix, translate(vec3(0.0, -0.25, 0.0)));
        gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
    };

    const buildPolyhedron = () => {
        vertices = [];
        colors = [];
        tetrahedron(baseVertices[0], baseVertices[1], baseVertices[2], baseVertices[3], subdivisions);

        vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
        var vPosition = gl.getAttribLocation(program, "vPosition");
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);

        cBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
        var vColor = gl.getAttribLocation(program, "vColor");
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vColor);
    };

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

        var ab = normalize(mix(a, b, 0.5), true);
        var ac = normalize(mix(a, c, 0.5), true);
        var bc = normalize(mix(b, c, 0.5), true);

        divideTriangle(a, ab, ac, count - 1, colorIndex);
        divideTriangle(ab, b, bc, count - 1, colorIndex);
        divideTriangle(bc, c, ac, count - 1, colorIndex);
        divideTriangle(ab, bc, ac, count - 1, colorIndex);
    }

    const triangle = (a, b, c, colorIndex) => {
        colors.push(baseColors[colorIndex]);
        vertices.push(a);
        colors.push(baseColors[colorIndex]);
        vertices.push(b);
        colors.push(baseColors[colorIndex]);
        vertices.push(c);
    }

    const render = () => {
        gl.clear(gl.COLOR_BUFFER_BIT);

        updateCamera();
        gl.drawArrays(gl.TRIANGLES, 0, vertices.length);

        requestAnimFrame(render);
    }

    const updateCamera = () => {
        thetaY += 0.005;
        eye = vec3(dist * Math.cos(thetaY), 0.0, dist * Math.sin(thetaY));
        viewMatrix = lookAt(eye, at, up);
        gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(viewMatrix));
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
                <Counter bind:count={subdivisions} min={0} max={6} label="subdivisions"/>
            </div>
        {/snippet}
    </Result>
</div>


