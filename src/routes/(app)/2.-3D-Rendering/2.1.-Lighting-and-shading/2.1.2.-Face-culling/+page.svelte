<script>
    import { vec3, vec4, flatten, perspective, lookAt, mat4, mult, translate, normalize, mix } from '$lib/Libraries/MV.js';
    import { WebGLUtils, fetchCodeSnippets, initShaders, convertToLatex } from '$lib/utils.svelte.js';
    import { SendToBack, BringToFront, X } from 'lucide-svelte'
    import { textWidth } from '$lib/stores/layout.svelte.js';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    
    import Counter from '$lib/components/UI/Counter.svelte';
    import Toggle from '$lib/components/UI/Toggle.svelte';
    import Result from '$lib/components/Result.svelte';

    let viewIndex = $state(1);
    let isLoading = $state(true);
    let canvas = $state();
    let gl, program;
    let codeSnippets = $state([]);

    let vertices, vBuffer, colors;
    let modelMatrixLoc, viewMatrixLoc, projectionMatrixLoc;
    let modelMatrix, viewMatrix, projectionMatrix;
    let eye, at, up;
    let subdivisions = $state();
    let baseVertices;
    let dist, thetaY;
    let culling = $state(0);

    onMount(async () => {
        if (typeof window !== 'undefined') {
            convertToLatex();

            gl = WebGLUtils.setupWebGL(canvas);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);

            program = await initShaders(gl, program, $page.url.pathname + '/vshader.glsl', $page.url.pathname + '/fshader.glsl');

            culling = 0;

            baseVertices = [
                vec4(0.0, 0.0, -1.0, 1), 
                vec4(0.0, 0.942809, 0.333333, 1),
                vec4(-0.816497, -0.471405, 0.333333, 1),
                vec4(0.816497, -0.471405, 0.333333, 1)
            ]
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

        var cBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
        var vColor = gl.getAttribLocation(program, "vColor");
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vColor);
    }

    const tetrahedron = (a, b, c, d, n) => {
        divideTriangle(a, b, c, n);
        divideTriangle(d, c, b, n);
        divideTriangle(a, d, b, n);
        divideTriangle(a, c, d, n);
    }

    const divideTriangle = (a, b, c, count) => {
        if (count == 0) {
            triangle(a, b, c);
            return;
        }

        var ab = normalize(mix(a, b, 0.5), true);
        var ac = normalize(mix(a, c, 0.5), true);
        var bc = normalize(mix(b, c, 0.5), true);

        divideTriangle(a, ab, ac, count - 1);
        divideTriangle(ab, b, bc, count - 1);
        divideTriangle(bc, c, ac, count - 1);
        divideTriangle(ab, bc, ac, count - 1);
    }

    const triangle = (a, b, c) => {
        vertices.push(a);
        colors.push(vec4(0.5 * a[0] + 0.5, 0.5 * a[1] + 0.5, 0.5 * a[2] + 0.5, 1.0))
        vertices.push(b);
        colors.push(vec4(0.5 * b[0] + 0.5, 0.5 * b[1] + 0.5, 0.5 * b[2] + 0.5, 1.0))
        vertices.push(c);
        colors.push(vec4(0.5 * c[0] + 0.5, 0.5 * c[1] + 0.5, 0.5 * c[2] + 0.5, 1.0))
    }

    const render = () => {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        if (culling != 0) {
            gl.enable(gl.DEPTH_TEST);
            gl.enable(gl.CULL_FACE);
            culling == 1 ? gl.cullFace(gl.FRONT) : gl.cullFace(gl.BACK);
        } else {
            gl.disable(gl.DEPTH_TEST);
            gl.disable(gl.CULL_FACE);
        }

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

<div class="flex flex-col justify-center items-start {$textWidth} text-xl m-auto gap-6">
    <p class="text-xl font-medium m-0">Assignment</p>
    
    <div class="flex flex-col gap-4 text-zinc-950/65 dark:text-zinc-50/65">
        <p>Use depth buffer and back face culling to remove hidden surfaces.</p>  
        <p>Draw the vertex positions as colors ($\textbf c=0.5\cdot\textbf p+0.5$). [Part 3 of Worksheet 1, Angel 2.10]</p>
        <p>Use the depth buffer to ensure that you are looking at the nearest part of the surface of the sphere. [Angel 2.10.4, 5.8] </p>
        <p>Enable back face culling to improve efficiency. [Angel 5.8]</p>
    </div>
</div>

<Result bind:canvas={canvas} bind:viewIndex={viewIndex} isLoading={isLoading} codeSnippets={codeSnippets} folderPath={$page.url.pathname}>
    {#snippet controls()}
        <div class="absolute left-0 top-0 flex flex-row justify-evenly items-center gap-4 w-full p-4 bg-zinc-900/25 rounded-{viewIndex == 1 && 'r-'}lg">    
            <Toggle bind:selected={culling} icons={[X, SendToBack, BringToFront]}/>
            <Counter bind:count={subdivisions} min={0} max={6} label="subdivisions"/>
        </div>
    {/snippet}
</Result>