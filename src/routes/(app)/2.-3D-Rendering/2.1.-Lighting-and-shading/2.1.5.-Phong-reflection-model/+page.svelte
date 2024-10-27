<script>
    import { run } from 'svelte/legacy';

    import { onMount } from 'svelte';
    import { page } from '$app/stores'
    import { WebGLUtils, fetchCodeSnippets, initShaders } from '$lib/utils.svelte.js';
    import * as mv from '$lib/Libraries/MV.js';
    import Result from '$lib/components/Result.svelte';
    import Counter from '$lib/components/UI/Counter.svelte';
    import Slider from '$lib/components/UI/Slider.svelte';
    import Admonition from '$lib/components/UI/Admonition.svelte';

    let viewIndex = $state(1);
    let isLoading = $state(true);
    let canvas = $state(), gl, program;
    let codeSnippets = $state([]);

    let vertices, vBuffer;
    let subdivisions = $state();
    let v0, v1, v2, v3;
    let thetaY = 30;
    let viewMatrixLoc, modelMatrixLoc, projectionMatrixLoc, eyePosLoc;
    let kLoc, LLoc, ksLoc, sLoc;
    let k = $state(), L = $state(), ks = $state(), s = $state();

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

                // enabling depth test and culling
                gl.enable(gl.DEPTH_TEST);
                gl.enable(gl.CULL_FACE);
                gl.cullFace(gl.FRONT);

                // set the camera position
                eyePosLoc = gl.getUniformLocation(program, "eyePos");

                // Set the light direction
                var lightDirection = mv.vec3(0.0, 0.0, -1.0);
                var lightDirectionLoc = gl.getUniformLocation(program, "lightDirection");
                gl.uniform3fv(lightDirectionLoc, mv.flatten(lightDirection));

                // and all the lighting parameters
                kLoc = gl.getUniformLocation(program, "k");
                LLoc = gl.getUniformLocation(program, "L");
                ksLoc = gl.getUniformLocation(program, "ks");
                sLoc = gl.getUniformLocation(program, "s");
                k = L = ks = 0.5;
                s = 2.0;

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

                subdivisions = 6;
                
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

        thetaY += 0.005;

        // projection matrix
        var projectionMatrix = mv.perspective(45, canvas.width / canvas.height, 0.1, 100.0);

        // view matrix
        var dist = 5.0;
        var eyePos = mv.vec3(dist * Math.cos(thetaY), 0.0, dist * Math.sin(thetaY));
        var target = mv.vec3(0.0, 0.0, 0.0);
        var up = mv.vec3(0.0, 1.0, 0.0);
        var viewMatrix = mv.lookAt(eyePos, target, up);

        // model matrix
        var modelMatrix = mv.mat4();

        // update the lighting parameters
        updateLighting();

        // Pass matrices to the shader
        gl.uniformMatrix4fv(modelMatrixLoc, false, mv.flatten(modelMatrix));
        gl.uniformMatrix4fv(viewMatrixLoc, false, mv.flatten(viewMatrix));
        gl.uniformMatrix4fv(projectionMatrixLoc, false, mv.flatten(projectionMatrix));
        gl.uniform3fv(eyePosLoc, mv.flatten(eyePos));

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

    function updateLighting() {
        gl.uniform1f(kLoc, k);
        gl.uniform1f(LLoc, L);
        gl.uniform1f(ksLoc, ks);
        gl.uniform1f(sLoc, Math.pow(10, s));
    } 

    run(() => {
        subdivisions != undefined && buildPolyhedron();
    });
</script>

<div class="flex flex-col justify-center items-start w-4/5 text-xl m-auto">
    <div class="w-4/5 m-auto">
        <p>
            Use Phong shading by moving your implementation of the Phong reflection 
            model to the fragment shader and varying positions and normals across triangles 
            instead of colors [Angel 6.5.3, 6.10].
        </p>
        <Admonition type='warning' color='orange'>
            {#snippet textContent()}
                <p class="m-0">
                    Remember to re-normalize direction vectors that are varying and therefore 
                    linearly interpolated across a triangle.
                </p>
            {/snippet}
        </Admonition>        
    </div>

    <Result bind:canvas={canvas} bind:viewIndex={viewIndex} isLoading={isLoading} codeSnippets={codeSnippets}>
        {#snippet controls()}
            <div class="absolute left-0 top-0 flex flex-col justify-evenly items-center gap-4 w-full p-4 bg-gray-900/25 rounded-{viewIndex == 1 && 'r-'}lg">    
                <Counter bind:count={subdivisions} min={0} max={6}/>
            </div>

            <div class="absolute left-0 bottom-0 flex flex-row justify-evenly items-center gap-4 w-full p-4 bg-gray-900/75 rounded-{viewIndex == 1 && 'r-'}lg">
                <div class="flex flex-col justify-evenly w-full">
                    <Slider min={0} max={1} bind:value={k} step={0.01} id={k} label="k"/>
                    <Slider min={0} max={1} bind:value={L} step={0.01} id={L} label="L"/>
                </div>    

                <div class="flex flex-col justify-evenly w-full">
                    <Slider min={0} max={1} bind:value={ks} step={0.01} id={ks} label="k_s"/>
                    <Slider min={0} max={3} bind:value={s} step={0.01} id={s} label="s" f={(x) => Math.round(Math.pow(10, x))}/>
                </div>
            </div>
        {/snippet}
    </Result>
</div>

