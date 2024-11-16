<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores'
    import { WebGLUtils, fetchCodeSnippets, initShaders } from '$lib/utils.svelte.js';
    import { RotateCw } from 'lucide-svelte';
    import * as mv from '$lib/Libraries/MV.js';
    import Result from '$lib/components/Result.svelte';

    let viewIndex = $state(1);
    let isLoading = $state(true);
    let canvas = $state(), gl, program;
    let codeSnippets = $state([]);

    let vertices = [];
    let vel, pos, posLoc, date, deltaTime, t1, t2, damp, airFriction, radFriction, num, rad;
    const acc = mv.vec2(0.0, -9.81);

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

                initBall();
                posLoc = gl.getUniformLocation(program, "pos");

                gl.useProgram(program);
                
                date = new Date;
                deltaTime = 0.0;
                t1 = date.getTime();
                damp = mv.vec2(0.75, 0.5);
                airFriction = 0.99;
                radFriction = 0.90;

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

            codeSnippets = await fetchCodeSnippets($page.url.pathname);
            isLoading = false;
        }
    });

    const render = () => {
        gl.clear(gl.COLOR_BUFFER_BIT);

        date = new Date;
        t2 = date.getTime();
        deltaTime = (t2 - t1) * 0.001;
        t1 = t2;

        update();
        bounce();

        gl.uniform2f(posLoc, pos[0], pos[1]);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length);
        requestAnimFrame(render);
    }

    const update = () => {
        pos = mv.add(pos, mv.mult(vel, deltaTime));
        if (Math.abs(pos[1] + 0.5) > 0.015 || Math.abs(vel[1]) > 0.015)
            vel = mv.add(vel, mv.mult(acc, deltaTime));
        else { 
            pos[1] = -0.5;
            vel[1] = 0.0;
            vel[0] = vel[0] * radFriction;
        }

        vel = mv.mult(vel, airFriction);
    }

    const bounce = () => {
        // floor and ceiling
        if (pos[1] < -0.5 && vel[1] < 0.0) {
            vel[0] = vel[0] * radFriction;
            vel[1] = -vel[1] * damp[1];
        } else if (pos[1] > 0.5 && vel[1] > 0.0) {
            vel[0] = vel[0] * radFriction;
            vel[1] = -vel[1] * damp[1];
        }

        // lateral walls
        if (pos[0] > 0.5 || pos[0] < -0.5) {
            if (pos[0] > 0.5)
                pos[0] = 1.0 - pos[0];
            else
                pos[0] = -1.0 - pos[0];

            vel[0] = -vel[0] * damp[0];
        }
    }

    const initBall = () => {
        vel = mv.vec2(Math.random() * 20 - 10, Math.random() * 20 - 10);
        pos = mv.vec2(Math.random() - 0.5, Math.random() - 0.5);
    }
</script>

<div class="flex flex-col justify-center items-start w-4/5 text-xl m-auto">
    <div class="w-4/5 m-auto">
        <p>Create and draw a circle using the triangle fan drawing mode. [Angel 2.4.2] [The triangle fan drawing mode is not available in WebGPU. If using WebGPU, use the triangle-strip drawing mode to draw a circle.]</p>
        <p>Make the circle bounce up and down over time.</p>
    </div>

    <Result bind:canvas={canvas} bind:viewIndex={viewIndex} isLoading={isLoading} codeSnippets={codeSnippets} folderPath={$page.url.pathname}>
        {#snippet controls()}
            <button onclick={initBall} class="absolute left-0 top-0 m-4 p-2 bg-gray-100 rounded-lg hover:bg-gray-300 transition-colors">
                <RotateCw size={20}/>
            </button>
        {/snippet}
    </Result>
</div>