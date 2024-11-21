<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores'
    import { WebGLUtils, fetchCodeSnippets, initShaders, convertToLatex } from '$lib/utils.svelte.js';
    import { SendToBack, BringToFront, X } from 'lucide-svelte'
    import { vec3, vec4, flatten, perspective, lookAt, mat4, mult, translate, normalize, mix } from '$lib/Libraries/MV.js';
    import Result from '$lib/components/Result.svelte';
    import Counter from '$lib/components/UI/Counter.svelte';
    import Toggle from '$lib/components/UI/Toggle.svelte';

    let viewIndex = $state(1);
    let isLoading = $state(true);
    let canvas = $state();
    let gl, program;
    let codeSnippets = $state([]);

    let vertices, vBuffer;
    let viewMatrixLoc, modelMatrixLoc, projectionMatrixLoc;
    let modelMatrix, viewMatrix, projectionMatrix;
    let eye, at, up;
    let lightDirection, lightDirectionLoc;
    let subdivisions = $state();
    let baseVertices;
    let thetaY, dist;
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
            ];

            subdivisions = 1;

            initMatrices();
            initDirectionalLight();
            buildPolyhedron();

            render();

            codeSnippets = await fetchCodeSnippets($page.url.pathname);
            isLoading = false;
        }
    });

    const initDirectionalLight = () => {
        lightDirection = vec3(0.0, 0.0, -1.0);
        lightDirectionLoc = gl.getUniformLocation(program, "lightDirection");
        gl.uniform3fv(lightDirectionLoc, flatten(lightDirection));
    }

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
        tetrahedron(baseVertices[0], baseVertices[1], baseVertices[2], baseVertices[3], subdivisions);

        vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
        var vPosition = gl.getAttribLocation(program, "vPosition");
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);
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
        vertices.push(b);
        vertices.push(c);
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
    };

    $effect(() => {
        subdivisions != undefined && buildPolyhedron();
    });
</script>

<div class="flex flex-col justify-center items-start w-4/5 text-xl m-auto">
    <div class="w-4/5 m-auto">
        <p>Use Gouraud shading (with true normals) to draw a diffuse sphere lit by a distant, white, directional light with direction $(0,0,-1)$.</p>  
        <p>Obtain the surface normal in the vertex shader. [Angel 6.9]</p>
        <p>Think of the color of the sphere as its diffuse reflection coefficient $k_d$. Introduce a distant light with direction $l_e=(0,0,-1)$ and light emission $L_d=(1,1,1)$, no distance attenuation. Compute the diffusely reflected light in the vertex shader and set the vertex color to this result (note that in this case $\omega_i=\textbf l=-\textbf l_e)$. [Angel 6.3.2, 6.7.1]</p>
        <p>Let the camera orbit the sphere over time. [Angel 3.1]</p>
    </div>

    <Result bind:canvas={canvas} bind:viewIndex={viewIndex} isLoading={isLoading} codeSnippets={codeSnippets} folderPath={$page.url.pathname}>
        {#snippet controls()}
            <div class="absolute left-0 top-0 flex flex-row justify-evenly items-center gap-4 w-full p-4 bg-gray-900/25 rounded-{viewIndex == 1 && 'r-'}lg">    
                <Toggle bind:selected={culling} icons={[X, SendToBack, BringToFront]}/>
                <Counter bind:count={subdivisions} min={0} max={6}/>
            </div>
        {/snippet}
    </Result>
</div>