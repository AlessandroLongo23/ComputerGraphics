<script>
    import { run } from 'svelte/legacy';

    import { onMount } from 'svelte';
    import { page } from '$app/stores'
    import { WebGLUtils, fetchCodeSnippets, initShaders } from '$lib/utils.svelte.js';
    import { SendToBack, BringToFront, X } from 'lucide-svelte'
    import * as mv from '$lib/Libraries/MV.js';
    import Result from '$lib/components/Result.svelte';
    import Counter from '$lib/components/UI/Counter.svelte';
    import Toggle from '$lib/components/UI/Toggle.svelte';

    let viewIndex = $state(1);
    let isLoading = $state(true);
    let canvas = $state(), gl, program;
    let codeSnippets = $state([]);

    let vertices, vBuffer;
    let viewMatrixLoc, modelMatrixLoc, projectionMatrixLoc;
    let subdivisions = $state();
    let v0, v1, v2, v3;
    let thetaY = 30;
    let culling = $state();

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

                culling = 1;

                // Set the light direction
                var lightDirection = mv.vec3(0.0, 0.0, -1.0);
                var lightDirectionLoc = gl.getUniformLocation(program, "lightDirection");
                gl.uniform3fv(lightDirectionLoc, mv.flatten(lightDirection));

                // Uniform locations for the matrices
                viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix");
                modelMatrixLoc = gl.getUniformLocation(program, "modelMatrix");
                projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

                // vertices
                vertices = [];
                v0 = mv.vec4(0.0, 0.0, -1.0, 1); 
                v1 = mv.vec4(0.0, 0.942809, 0.333333, 1);
                v2 = mv.vec4(-0.816497, -0.471405, 0.333333, 1);
                v3 = mv.vec4(0.816497, -0.471405, 0.333333, 1);
                subdivisions = 0;
                
                buildPolyhedron();
                render();
            } catch (error) {
                console.error(error);
            }

            codeSnippets = await fetchCodeSnippets($page.url.pathname);
            isLoading = false;
        }
    });

    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // enabling depth test and culling
        if (culling != 0) {
            gl.enable(gl.DEPTH_TEST);
            gl.enable(gl.CULL_FACE);

            culling == 1 ? gl.cullFace(gl.FRONT) : gl.cullFace(gl.BACK);
        } else {
            gl.disable(gl.DEPTH_TEST);
            gl.disable(gl.CULL_FACE);
        }

        thetaY += 0.005;

        // projection matrix
        var projectionMatrix = mv.perspective(45, canvas.width / canvas.height, 0.1, 100.0);

        // view matrix
        var dist = 4.0;
        var eye = mv.vec3(dist * Math.cos(thetaY), 0.0, dist * Math.sin(thetaY));
        var target = mv.vec3(0.0, 0.0, 0.0);
        var up = mv.vec3(0.0, 1.0, 0.0);
        var viewMatrix = mv.lookAt(eye, target, up);

        // model matrix
        var modelMatrix = mv.mat4();
        var modelPos = mv.vec3(0.0, -0.25, 0.0);
        modelMatrix = mv.mult(modelMatrix, mv.translate(modelPos));

        // Pass matrices to the shader
        gl.uniformMatrix4fv(modelMatrixLoc, false, mv.flatten(modelMatrix));
        gl.uniformMatrix4fv(viewMatrixLoc, false, mv.flatten(viewMatrix));
        gl.uniformMatrix4fv(projectionMatrixLoc, false, mv.flatten(projectionMatrix));

        // draw the model using triangles
        gl.drawArrays(gl.TRIANGLES, 0, vertices.length);

        // call the next frame
        requestAnimFrame(render);
    }

    function buildPolyhedron() {
        vertices = [];
        tetrahedron(v0, v1, v2, v3, subdivisions);

        vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, mv.flatten(vertices), gl.STATIC_DRAW);

        var vPosition = gl.getAttribLocation(program, "vPosition");
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);
    }

    function tetrahedron(a, b, c, d, n) {
        divideTriangle(a, b, c, n, 0);
        divideTriangle(d, c, b, n, 1);
        divideTriangle(a, d, b, n, 2);
        divideTriangle(a, c, d, n, 3);
    }

    function divideTriangle(a, b, c, count) {
        if (count == 0) {
            triangle(a, b, c);
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

    function triangle(a, b, c) {
        vertices.push(a);
        vertices.push(b);
        vertices.push(c);
    }

    run(() => {
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

    <Result bind:canvas={canvas} bind:viewIndex={viewIndex} isLoading={isLoading} codeSnippets={codeSnippets}>
        {#snippet controls()}
            <div class="absolute left-0 top-0 flex flex-row justify-evenly items-center gap-4 w-full p-4 bg-gray-900/25 rounded-{viewIndex == 1 && 'r-'}lg">    
                <Toggle bind:selected={culling} icons={[X, SendToBack, BringToFront]}/>
                <Counter bind:count={subdivisions} min={0} max={6}/>
            </div>
        {/snippet}
    </Result>
</div>