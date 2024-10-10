<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores'
    import { WebGLUtils, fetchCodeSnippets, initShaders } from '$lib/utils.js';
    import { RotateCw } from 'lucide-svelte';
    import * as mv from '$lib/Libraries/MV.js';
    import Result from '$lib/components/Result.svelte';

    let view_index = 1;
    let loading = true;
    let canvas, gl, program;
    let code_snippets = [];

    let vertices = [];
    let acc, vel, pos, posLoc, date, delta_time, t1, t2, damp, air_friction, rad_friction, num, rad;

    onMount(async () => {
        if (typeof window !== 'undefined') {
            gl = WebGLUtils.setupWebGL(canvas);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);

            try {
                [gl, program] = await initShaders(gl, program, $page.url.pathname + '/vshader.glsl', $page.url.pathname + '/fshader.glsl');

                acc = mv.vec2(0.0, -9.81);
                vel = mv.vec2(5, 0.0);
                pos = mv.vec2(-0.4, 0.3);
                posLoc = gl.getUniformLocation(program, "pos");

                gl.useProgram(program);
                
                date = new Date;
                delta_time = 0.0;
                t1 = date.getTime();
                damp = mv.vec2(0.75, 0.5);
                air_friction = 0.99;
                rad_friction = 0.90;

                // vertices
                num = 100;
                rad = 0.5;
                vertices = [mv.vec2(0, 0)];
                for (var angle = 0; angle <= Math.PI * 2; angle += Math.PI * 2 / num)
                    vertices.push(mv.vec2(rad * Math.cos(angle), rad * Math.sin(angle)));

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

        date = new Date;
        t2 = date.getTime();
        delta_time = (t2 - t1) * 0.001;
        t1 = t2;

        pos = mv.add(pos, mv.mult(vel, delta_time));
        if (Math.abs(pos[1] + 0.5) > 0.015 || Math.abs(vel[1]) > 0.015)
            vel = mv.add(vel, mv.mult(acc, delta_time));
        else { 
            pos[1] = -0.5;
            vel[1] = 0.0;
            vel[0] = vel[0] * rad_friction;
        }

        vel = mv.mult(vel, air_friction);

        if (pos[1] < -0.5 && vel[1] < 0.0) {
            vel[0] = vel[0] * rad_friction;
            vel[1] = -vel[1] * damp[1];
        } else if (pos[1] > 0.5 && vel[1] > 0.0) {
            vel[0] = vel[0] * rad_friction;
            vel[1] = -vel[1] * damp[1];
        }

        if (pos[0] > 0.5 || pos[0] < -0.5) {
            if (pos[0] > 0.5)
                pos[0] = 1.0 - pos[0];
            else
                pos[0] = -1.0 - pos[0];

            vel[0] = -vel[0] * damp[0];
        }

        gl.uniform2f(posLoc, pos[0], pos[1]);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length);
        requestAnimFrame(render);
    }

    function reset_visualization() {
        console.log("reset visualization");
        acc = mv.vec2(0.0, -9.81);
        vel = mv.vec2(5, 0.0);
        pos = mv.vec2(-0.4, 0.3);
    }
</script>

<div class="flex flex-col justify-center items-start w-4/5 text-xl m-auto">
    <div class="w-3/5 m-auto">
        <ul>
            <li>Create and draw a circle using the triangle fan drawing mode. [Angel 2.4.2] [The triangle fan drawing mode is not available in WebGPU. If using WebGPU, use the triangle-strip drawing mode to draw a circle.]</li>
            <li>Make the circle bounce up and down over time.</li>
        </ul>
    </div>

    <Result bind:canvas={canvas} bind:view_index={view_index} loading={loading} code_snippets={code_snippets}>
        <div slot='controls'>
            <button on:click={reset_visualization} class="absolute left-0 top-0 m-4 p-2 bg-gray-100 rounded-lg hover:bg-gray-300 transition-colors">
                <svelte:component this={ RotateCw } size={20}/>
            </button>
        </div>
    </Result>
</div>

<style>
</style>