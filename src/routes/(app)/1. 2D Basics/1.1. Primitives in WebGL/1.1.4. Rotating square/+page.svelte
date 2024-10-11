<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores'
    import { WebGLUtils, fetchCodeSnippets, initShaders } from '$lib/utils.js';
    import * as mv from '$lib/Libraries/MV.js';
    import Result from '$lib/components/Result.svelte';

    let view_index = 1;
    let loading = true;
    let canvas, gl, program;
    let code_snippets = [];

    let vertices = [];
    let theta, thetaLoc;

    onMount(async () => {
        if (typeof window !== 'undefined') {
            gl = WebGLUtils.setupWebGL(canvas);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);

            try {
                [gl, program] = await initShaders(gl, program, $page.url.pathname + '/vshader.glsl', $page.url.pathname + '/fshader.glsl');

                theta = 0.0;
                thetaLoc = gl.getUniformLocation(program, "theta");

                vertices = [ 
                    mv.vec2(-0.5, 0.5),
                    mv.vec2(0.5, 0.5), 
                    mv.vec2(-0.5, -0.5), 
                    mv.vec2(0.5, -0.5) 
                ];

                var vBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, mv.flatten(vertices), gl.STATIC_DRAW);

                var vPosition = gl.getAttribLocation(program, "vPosition");
                gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(vPosition);

                render();
            } catch (error) {
                console.error(error);
            }

            code_snippets = await fetchCodeSnippets($page.url.pathname);
            loading = false;
        }
    });

    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(thetaLoc, theta += 0.025);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertices.length);
        requestAnimFrame(render);
    }
</script>

<div class="flex flex-col justify-center items-start w-4/5 text-xl m-auto">
    <div class="w-4/5 m-auto">
        <ul>
            <li>Add a second triangle to the previous part such that you have a quadrilateral (which is maybe even a square). [Angel 2.4]</li>
            <li>Center your quad (short form of quadrilateral) and rotate it such that it has its vertices on the coordinate axes.</li>
            <li>Add a rotation so the quad rotates around its center. Animate the rotation angle over time. Use requestAnimationFrame to continuously call your render function. [Angel 3.1]</li>
        </ul>
    </div>

    <Result bind:canvas={canvas} bind:view_index={view_index} loading={loading} code_snippets={code_snippets}/>
</div>

<style>
</style>