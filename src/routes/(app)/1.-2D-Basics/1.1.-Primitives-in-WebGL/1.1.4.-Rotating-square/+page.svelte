<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores'
    import { WebGLUtils, fetchCodeSnippets, initShaders, convertToLatex } from '$lib/utils.svelte.js';
    import { vec2, flatten } from '$lib/Libraries/MV.js';
    import Result from '$lib/components/Result.svelte';

    let viewIndex = $state(1);
    let isLoading = $state(true);
    let canvas = $state();
    let gl, program;
    let codeSnippets = $state([]);

    let vertices = [];
    let theta, thetaLoc;

    onMount(async () => {
        if (typeof window !== 'undefined') {
            convertToLatex();
            
            gl = WebGLUtils.setupWebGL(canvas);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);

            program = await initShaders(gl, program, $page.url.pathname + '/vshader.glsl', $page.url.pathname + '/fshader.glsl');

            initAngle();
            initVertices();

            render();

            codeSnippets = await fetchCodeSnippets($page.url.pathname);
            isLoading = false;
        }
    });
    
    const initAngle = () => {
        theta = 0.0;
        thetaLoc = gl.getUniformLocation(program, "theta");
    }

    const initVertices = () => {
        vertices = [ 
            vec2(-0.5, 0.5),
            vec2(0.5, 0.5), 
            vec2(-0.5, -0.5), 
            vec2(0.5, -0.5) 
        ];

        var vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

        var vPosition = gl.getAttribLocation(program, "vPosition");
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);
    }

    const render = () => {
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        updateAngle();
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertices.length);

        requestAnimFrame(render);
    }

    const updateAngle = () => {
        theta += 0.025;
        gl.uniform1f(thetaLoc, theta);
    }
</script>

<div class="flex flex-col justify-center items-start w-4/5 text-xl m-auto">
    <div class="w-4/5 m-auto">
        <p>Add a second triangle to the previous part such that you have a quadrilateral (which is maybe even a square). [Angel 2.4]</p>
        <p>Center your quad (short form of quadrilateral) and rotate it such that it has its vertices on the coordinate axes.</p>
        <p>Add a rotation so the quad rotates around its center. Animate the rotation angle over time. Use requestAnimationFrame to continuously call your render function. [Angel 3.1]</p>
    </div>

    <Result bind:canvas={canvas} bind:viewIndex={viewIndex} isLoading={isLoading} codeSnippets={codeSnippets} folderPath={$page.url.pathname}/>
</div>