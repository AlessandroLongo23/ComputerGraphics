<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { WebGLUtils, fetchCodeSnippets, initShaders, convertToLatex } from '$lib/utils.svelte.js';
    import { vec2, vec3, vec4, flatten, perspective, mat4, lookAt, mult, translate } from '$lib/Libraries/MV.js';
    import Result from '$lib/components/Result.svelte';
    import Admonition from '$lib/components/UI/Admonition.svelte';

    let viewIndex = $state(1);
    let isLoading = $state(true);
    let canvas = $state();
    let gl, program;
    let codeSnippets = $state([]);

    let vertices;
    let modelViewMatrixLoc, projectionMatrixLoc;
    let modelViewMatrix, projectionMatrix;
    let at, up, eye;
    let isGroundLoc;
    let groundTexLoc, groundTexture, red, fColorLoc;
    let time;
    let pointLightCenter, pointLightRadius, pointLightPosition;

    onMount(async () => {
        if (typeof window !== 'undefined') {
            convertToLatex();

            gl = WebGLUtils.setupWebGL(canvas);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);

            program = await initShaders(gl, program, $page.url.pathname + '/vshader.glsl', $page.url.pathname + '/fshader.glsl');

            time = 0.0;
            initPointLight();
            initVertices();
            initGroundTexture();
            initTextureCoordinates();
            initMatrices();
            
            red = vec3(1.0, 0.0, 0.0);
            fColorLoc = gl.getUniformLocation(program, "fColor");
            isGroundLoc = gl.getUniformLocation(program, "isGround");

            render();

            codeSnippets = await fetchCodeSnippets($page.url.pathname);
            isLoading = false;
        }
    });

    const initPointLight = () => {
        pointLightCenter = vec3(0.0, 2.0, -2.0);
        pointLightRadius = 2.0;
    }

    const initVertices = () => {
        vertices = [
            vec4(-2.0, -1.0, -1.0, 1.0), 
            vec4(-2.0, -1.0, -5.0, 1.0), 
            vec4(2.0, -1.0, -5.0, 1.0),
            vec4(-2.0, -1.0, -1.0, 1.0), 
            vec4(2.0, -1.0, -5.0, 1.0),
            vec4(2.0, -1.0, -1.0, 1.0),

            vec4(0.25, -0.5, -1.25, 1.0),
            vec4(0.25, -0.5, -1.75, 1.0),
            vec4(0.75, -0.5, -1.75, 1.0),
            vec4(0.25, -0.5, -1.25, 1.0),
            vec4(0.75, -0.5, -1.75, 1.0),
            vec4(0.75, -0.5, -1.25, 1.0),

            vec4(-1.0, -1.0, -2.5, 1.0),
            vec4(-1.0, -1.0, -3.0, 1.0),
            vec4(-1.0, -0.0, -3.0, 1.0),
            vec4(-1.0, -1.0, -2.5, 1.0),
            vec4(-1.0, -0.0, -3.0, 1.0),
            vec4(-1.0, -0.0, -2.5, 1.0),
        ];

        var vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
        var vPosition = gl.getAttribLocation(program, "vPosition");
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);
    }

    const initGroundTexture = () => {
        groundTexture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, groundTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        groundTexLoc = gl.getUniformLocation(program, "groundTex");
        gl.uniform1i(groundTexLoc, 0);

        var myTexels = new Image();
        myTexels.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, groundTexture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, myTexels);
            gl.generateMipmap(gl.TEXTURE_2D);
        }
        myTexels.src = "/assets/textures/groundTexture.png";
    }

    const initTextureCoordinates = () => {
        var textCoords = [
            vec2(-.5, -.5), vec2(.5, -.5), vec2(.5, .5),
            vec2(-.5, -.5), vec2(.5, .5), vec2(-.5, .5),
        ];

        var tBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(textCoords), gl.STATIC_DRAW);
        var vTexCoord = gl.getAttribLocation(program, "vTexCoord");
        gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vTexCoord);
    }

    const initMatrices = () => {
        projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
        projectionMatrix = perspective(90, canvas.width / canvas.height, .1, 30.0);
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
        
        at = vec3(0.0, 0.0, 0.0);
        up = vec3(0.0, 1.0, 0.0);
        eye = vec3(0.0, 0.0, 0.0);
        modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    }

    const render = () => {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.uniform1i(isGroundLoc, true);
        renderGround();

        gl.uniform1i(isGroundLoc, false);
        renderShadow();
        renderRects();

        requestAnimFrame(render);
    }

    const renderGround = () => {
        modelViewMatrix = mat4();
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
        
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, groundTexture);
        gl.uniform1i(groundTexLoc, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    const renderShadow = () => {
        updateLightPosition();

        modelViewMatrix = lookAt(eye, at, up);
        let m = mat4();
        m[3][3] = 0.0;
        m[3][1] = -1.0 / (pointLightPosition[1] + 1.0);
        modelViewMatrix = mult(modelViewMatrix, translate(pointLightPosition));
        modelViewMatrix = mult(modelViewMatrix, m);
        modelViewMatrix = mult(modelViewMatrix, translate(-pointLightPosition[0], -pointLightPosition[1], -pointLightPosition[2]));
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

        gl.uniform3f(fColorLoc, red[0], red[1], red[2]);
        gl.drawArrays(gl.TRIANGLES, 6, 18);
    }


    const updateLightPosition = () => {
        time += 0.01;

        pointLightPosition = vec3(
            pointLightCenter[0] + pointLightRadius * Math.cos(time),
            pointLightCenter[1],
            pointLightCenter[2] + pointLightRadius * Math.sin(time),
        );
    }

    const renderRects = () => {
        modelViewMatrix = lookAt(eye, at, up);
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

        gl.uniform3f(fColorLoc, red[0], red[1], red[2]);
        gl.drawArrays(gl.TRIANGLES, 6, 18);
    }
</script>

<div class="flex flex-col justify-center items-start w-4/5 text-xl m-auto">
    <div class="w-4/5 m-auto">
        <p>A light source position is needed to cast shadows. Introduce an animated point light that circles the scene with circle center $(0,2,-2)$ and radius $2$.</p>
        <p>Implement projection shadows using the following steps:</p>
        <ul class="list-disc list-inside">
            <li>Create a projection matrix $M_p$ that projects geometry onto the ground plane $y=-1$. Projection to a plane different from $y=0$ is done by subtracting the $y$-coordinate of the plane from the $y$-coordinate of the light source in $M_p$. [Angel 5.10]</li>
            <li>Construct a shadow model matrix $M_s$ by concatenating $M_p$ with model and translation matrices so that shadow polygons are projected from the current position of the point light onto the ground plane. [Angel 5.10]</li>
            <li>Use the shadow model matrix to draw the smaller quads again but as shadow polygons.</li>
        </ul>

        <Admonition type='note'>
            {#snippet textContent()}
                <p>Note that drawing order is important. Ensure that the shadow polygons are in front of the ground polygon, but behind the smaller quads. [Angel 8.11.7]</p>
            {/snippet}
        </Admonition>
    </div>

    <Result bind:canvas={canvas} bind:viewIndex={viewIndex} isLoading={isLoading} codeSnippets={codeSnippets} folderPath={$page.url.pathname}/>
</div>

