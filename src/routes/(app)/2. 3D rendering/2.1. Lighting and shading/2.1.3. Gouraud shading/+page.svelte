<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores'
    import { WebGLUtils, fetchCodeSnippets, initShaders } from '$lib/utils.js';
    import { SendToBack, BringToFront, X } from 'lucide-svelte'
    import * as mv from '$lib/Libraries/MV.js';
    import Result from '$lib/components/Result.svelte';
    import Counter from '$lib/components/UI/Counter.svelte';
    import Toggle from '$lib/components/UI/Toggle.svelte';

    let view_index = 1;
    let loading = true;
    let canvas, gl, program;
    let code_snippets = [];

    let vertices, vBuffer;
    let view_matrix_loc, model_matrix_loc, projection_matrix_loc;
    let subdivisions;
    let v0, v1, v2, v3;
    let theta_y = 30;
    let culling;

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
                var light_direction = mv.vec3(0.0, 0.0, -1.0);
                var light_direction_loc = gl.getUniformLocation(program, "light_direction");
                gl.uniform3fv(light_direction_loc, mv.flatten(light_direction));

                // Uniform locations for the matrices
                view_matrix_loc = gl.getUniformLocation(program, "view_matrix");
                model_matrix_loc = gl.getUniformLocation(program, "model_matrix");
                projection_matrix_loc = gl.getUniformLocation(program, "projection_matrix");

                // vertices
                vertices = [];
                v0 = mv.vec4(0.0, 0.0, -1.0, 1); 
                v1 = mv.vec4(0.0, 0.942809, 0.333333, 1);
                v2 = mv.vec4(-0.816497, -0.471405, 0.333333, 1);
                v3 = mv.vec4(0.816497, -0.471405, 0.333333, 1);
                subdivisions = 0;
                
                build_polyhedron();
                render();
            } catch (error) {
                console.error(error);
            }

            code_snippets = await fetchCodeSnippets($page.url.pathname);
            loading = false;
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

        theta_y += 0.005;

        // projection matrix
        var projection_matrix = mv.perspective(45, canvas.width / canvas.height, 0.1, 100.0);

        // view matrix
        var dist = 4.0;
        var eye = mv.vec3(dist * Math.cos(theta_y), 0.0, dist * Math.sin(theta_y));
        var target = mv.vec3(0.0, 0.0, 0.0);
        var up = mv.vec3(0.0, 1.0, 0.0);
        var view_matrix = mv.lookAt(eye, target, up);

        // model matrix
        var model_matrix = mv.mat4();
        var model_pos = mv.vec3(0.0, -0.25, 0.0);
        model_matrix = mv.mult(model_matrix, mv.translate(model_pos));

        // Pass matrices to the shader
        gl.uniformMatrix4fv(model_matrix_loc, false, mv.flatten(model_matrix));
        gl.uniformMatrix4fv(view_matrix_loc, false, mv.flatten(view_matrix));
        gl.uniformMatrix4fv(projection_matrix_loc, false, mv.flatten(projection_matrix));

        // draw the model using triangles
        gl.drawArrays(gl.TRIANGLES, 0, vertices.length);

        // call the next frame
        requestAnimFrame(render);
    }

    function build_polyhedron() {
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

    $: subdivisions != undefined && build_polyhedron();
</script>

<div class="flex flex-col justify-center items-start w-4/5 text-xl m-auto">
    <div class="w-4/5 m-auto">
        <p>Use Gouraud shading (with true normals) to draw a diffuse sphere lit by a distant, white, directional light with direction $(0,0,-1)$.</p>  
        <p>Obtain the surface normal in the vertex shader. [Angel 6.9]</p>
        <p>Think of the color of the sphere as its diffuse reflection coefficient $k_d$. Introduce a distant light with direction $l_e=(0,0,-1)$ and light emission $L_d=(1,1,1)$, no distance attenuation. Compute the diffusely reflected light in the vertex shader and set the vertex color to this result (note that in this case $\omega_i=\textbf l=-\textbf l_e)$. [Angel 6.3.2, 6.7.1]</p>
        <p>Let the camera orbit the sphere over time. [Angel 3.1]</p>
    </div>

    <Result bind:canvas={canvas} bind:view_index={view_index} loading={loading} code_snippets={code_snippets}>
        <div slot='controls'>
            <div class="absolute left-0 top-0 flex flex-row justify-evenly items-center gap-4 w-full p-4 bg-gray-900/25 rounded-{view_index == 1 ? 'r-' : ''}lg">    
                <Toggle bind:selected={culling} icons={[X, SendToBack, BringToFront]}/>
                <Counter bind:count={subdivisions} min={0} max={6}/>
            </div>
        </div>
    </Result>
</div>