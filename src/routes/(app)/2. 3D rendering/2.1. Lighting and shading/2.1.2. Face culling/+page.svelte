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

    let vertices, vBuffer, vertex_colors;
    let model_view_matrix_loc, projection_matrix_loc;
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

                culling = 0;

                // colors
                vertex_colors = [];

                var cBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, mv.flatten(vertex_colors), gl.STATIC_DRAW);

                var vColor = gl.getAttribLocation(program, "vColor");
                gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(vColor);

                // vertices
                v0 = mv.vec4(0.0, 0.0, -1.0, 1); 
                v1 = mv.vec4(0.0, 0.942809, 0.333333, 1);
                v2 = mv.vec4(-0.816497, -0.471405, 0.333333, 1);
                v3 = mv.vec4(0.816497, -0.471405, 0.333333, 1);
                subdivisions = 1;
                
                build_polyhedron();

                // Initialize rotation and transformations
                model_view_matrix_loc = gl.getUniformLocation(program, "model_view_matrix");
                projection_matrix_loc = gl.getUniformLocation(program, "projection_matrix");

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

        var ctm = mv.mat4();
        var projection_matrix = mv.perspective(45, canvas.width / canvas.height, .001, 10.0);
        gl.uniformMatrix4fv(projection_matrix_loc, false, mv.flatten(projection_matrix));

        theta_y += 0.025;

        ctm = mv.mat4();
        ctm = mv.mult(ctm, mv.translate(0, -0.25, -4));
        ctm = mv.mult(ctm, mv.rotateY(theta_y));
        gl.uniformMatrix4fv(model_view_matrix_loc, false, mv.flatten(ctm));
        gl.drawArrays(gl.TRIANGLES, 0, vertices.length);

        requestAnimFrame(render);
    }

    function build_polyhedron() {
        vertices = [];
        vertex_colors = [];
        tetrahedron(v0, v1, v2, v3, subdivisions);

        vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, mv.flatten(vertices), gl.STATIC_DRAW);

        var vPosition = gl.getAttribLocation(program, "vPosition");
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);

        // Bind color buffer
        var cBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, mv.flatten(vertex_colors), gl.STATIC_DRAW);

        var vColor = gl.getAttribLocation(program, "vColor");
        gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vColor);
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
        vertex_colors.push(mv.vec3(0.5 * a[0] + 0.5, 0.5 * a[1] + 0.5, 0.5 * a[2] + 0.5))
        vertices.push(a);
        vertex_colors.push(mv.vec3(0.5 * b[0] + 0.5, 0.5 * b[1] + 0.5, 0.5 * b[2] + 0.5))
        vertices.push(b);
        vertex_colors.push(mv.vec3(0.5 * c[0] + 0.5, 0.5 * c[1] + 0.5, 0.5 * c[2] + 0.5))
        vertices.push(c);
    }

    $: subdivisions != undefined && build_polyhedron();
</script>

<div class="flex flex-col justify-center items-start w-4/5 text-xl m-auto">
    <div class="w-4/5 m-auto">
        <p class="text-black">Use depth buffer and back face culling to remove hidden surfaces.</p>  
        <p>Draw the vertex positions as colors (𝒄𝒄= 0.5 ∙𝒑𝒑+ 0.5). [Part 3 of Worksheet 1, Angel 2.10]</p>
        <p>Use the depth buffer to ensure that you are looking at the nearest part of the surface of the sphere. [Angel 2.10.4, 5.8] </p>
        <p>Enable back face culling to improve efficiency. [Angel 5.8]</p>
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