<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores'
    import { WebGLUtils, fetchCodeSnippets, initShaders } from '$lib/utils.js';
    import * as mv from '$lib/Libraries/MV.js';
    import Result from '$lib/components/Result.svelte';
    import Counter from '$lib/components/UI/Counter.svelte';
    import Slider from '$lib/components/UI/Slider.svelte';
    import Admonition from '$lib/components/UI/Admonition.svelte';

    let view_index = 1;
    let loading = true;
    let canvas, gl, program;
    let code_snippets = [];

    let vertices, vBuffer;
    let subdivisions;
    let v0, v1, v2, v3;
    let theta_y = 30;
    let view_matrix_loc, model_matrix_loc, projection_matrix_loc, eye_pos_loc;
    let k_loc, L_loc, k_s_loc, s_loc;
    let k, L, k_s, s;

    onMount(async () => {
        if (typeof window !== 'undefined') {
            gl = WebGLUtils.setupWebGL(canvas);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);

            try {
                [gl, program] = await initShaders(gl, program, $page.url.pathname + '/vshader.glsl', $page.url.pathname + '/fshader.glsl');

                // enabling depth test and culling
                gl.enable(gl.DEPTH_TEST);
                gl.enable(gl.CULL_FACE);
                gl.cullFace(gl.BACK);

                // set the camera position
                eye_pos_loc = gl.getUniformLocation(program, "eye_pos");

                // Set the light direction
                var light_direction = mv.vec3(0.0, 0.0, -1.0);
                var light_direction_loc = gl.getUniformLocation(program, "light_direction");
                gl.uniform3fv(light_direction_loc, mv.flatten(light_direction));

                // and all the lighting parameters
                k_loc = gl.getUniformLocation(program, "k");
                L_loc = gl.getUniformLocation(program, "L");
                k_s_loc = gl.getUniformLocation(program, "k_s");
                s_loc = gl.getUniformLocation(program, "s");
                k = L = k_s = 0.5;
                s = 2.0;

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

                subdivisions = 6;
                
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

        theta_y += 0.005;

        // projection matrix
        var projection_matrix = mv.perspective(45, canvas.width / canvas.height, 0.1, 100.0);

        // view matrix
        var dist = 5.0;
        var eye_pos = mv.vec3(dist * Math.cos(theta_y), 0.0, dist * Math.sin(theta_y));
        var target = mv.vec3(0.0, 0.0, 0.0);
        var up = mv.vec3(0.0, 1.0, 0.0);
        var view_matrix = mv.lookAt(eye_pos, target, up);

        // model matrix
        var model_matrix = mv.mat4();

        // update the lighting parameters
        update_lighting();

        // Pass matrices to the shader
        gl.uniformMatrix4fv(model_matrix_loc, false, mv.flatten(model_matrix));
        gl.uniformMatrix4fv(view_matrix_loc, false, mv.flatten(view_matrix));
        gl.uniformMatrix4fv(projection_matrix_loc, false, mv.flatten(projection_matrix));
        gl.uniform3fv(eye_pos_loc, mv.flatten(eye_pos));

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

    function update_lighting() {
        gl.uniform1f(k_loc, k);
        gl.uniform1f(L_loc, L);
        gl.uniform1f(k_s_loc, k_s);
        gl.uniform1f(s_loc, Math.pow(10, s));
    } 

    $: subdivisions != undefined && build_polyhedron();
</script>

<div class="flex flex-col justify-center items-start w-4/5 text-xl m-auto">
    <div class="w-4/5 m-auto">
        <p>
            Use Phong shading by moving your implementation of the Phong reflection 
            model to the fragment shader and varying positions and normals across triangles 
            instead of colors [Angel 6.5.3, 6.10].
        </p>
        <Admonition type='note'>
            <p slot='text_content' class="m-0">
                Remember to re-normalize direction vectors that are varying and therefore 
                linearly interpolated across a triangle.
            </p>
        </Admonition>        
    </div>

    <Result bind:canvas={canvas} bind:view_index={view_index} loading={loading} code_snippets={code_snippets}>
        <div slot='controls'>
            <div class="absolute left-0 top-0 flex flex-col justify-evenly items-center gap-4 w-full p-4 bg-gray-900/25 rounded-{view_index == 1 ? 'r-' : ''}lg">    
                <Counter bind:count={subdivisions} min={0} max={6}/>
            </div>

            <div class="absolute left-0 bottom-0 flex flex-row justify-evenly items-center gap-4 w-full p-4 bg-gray-900/75 rounded-{view_index == 1 ? 'r-' : ''}lg">
                <div class="flex flex-col justify-evenly w-full">
                    <Slider min={0} max={1} bind:value={k} step={0.01} id={k} label="k"/>
                    <Slider min={0} max={1} bind:value={L} step={0.01} id={L} label="L"/>
                </div>    

                <div class="flex flex-col justify-evenly w-full">
                    <Slider min={0} max={1} bind:value={k_s} step={0.01} id={k_s} label="k_s"/>
                    <Slider min={0} max={3} bind:value={s} step={0.01} id={s} label="s"/>
                </div>
            </div>
        </div>
    </Result>
</div>

