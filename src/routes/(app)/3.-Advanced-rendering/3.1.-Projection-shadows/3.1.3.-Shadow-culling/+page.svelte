<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores'
    import { WebGLUtils, fetchCodeSnippets, initShaders, convertToLatex } from '$lib/utils.svelte.js';
    import * as mv from '$lib/Libraries/MV.js';
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
    let groundTexLoc, groundTexture, visibilityLoc;
    let time;
    let pointLightCenter, pointLightRadius, pointLightPosition;

    onMount(async () => {
        if (typeof window !== 'undefined') {
            convertToLatex();

            gl = WebGLUtils.setupWebGL(canvas);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);

            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LESS);

            try {
                [gl, program] = await initShaders(gl, program, $page.url.pathname + '/vshader.glsl', $page.url.pathname + '/fshader.glsl');

                time = 0.0;
                initPointLight();
                initVertices();
                initGroundTexture();
                initTextureCoordinates();
                initMatrices();
                
                visibilityLoc = gl.getUniformLocation(program, "visibility");
                isGroundLoc = gl.getUniformLocation(program, "isGround");

                render();
            } catch (error) {
                console.error(error);
            }

            codeSnippets = await fetchCodeSnippets($page.url.pathname);
            isLoading = false;
        }
    });

    const initPointLight = () => {
        pointLightCenter = mv.vec3(0.0, 2.0, -2.0);
        pointLightRadius = 2.0;
    }

    const initVertices = () => {
        vertices = [
            mv.vec4(-2.0, -1.0, -1.0, 1.0), 
            mv.vec4(-2.0, -1.0, -5.0, 1.0), 
            mv.vec4(2.0, -1.0, -5.0, 1.0),
            mv.vec4(-2.0, -1.0, -1.0, 1.0), 
            mv.vec4(2.0, -1.0, -5.0, 1.0),
            mv.vec4(2.0, -1.0, -1.0, 1.0),

            mv.vec4(0.25, -0.5, -1.25, 1.0),
            mv.vec4(0.25, -0.5, -1.75, 1.0),
            mv.vec4(0.75, -0.5, -1.75, 1.0),
            mv.vec4(0.25, -0.5, -1.25, 1.0),
            mv.vec4(0.75, -0.5, -1.75, 1.0),
            mv.vec4(0.75, -0.5, -1.25, 1.0),

            mv.vec4(-1.0, -1.0, -2.5, 1.0),
            mv.vec4(-1.0, -1.0, -3.0, 1.0),
            mv.vec4(-1.0, -0.0, -3.0, 1.0),
            mv.vec4(-1.0, -1.0, -2.5, 1.0),
            mv.vec4(-1.0, -0.0, -3.0, 1.0),
            mv.vec4(-1.0, -0.0, -2.5, 1.0),
        ];

        var vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, mv.flatten(vertices), gl.STATIC_DRAW);
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
            mv.vec2(-.5, -.5), mv.vec2(.5, -.5), mv.vec2(.5, .5),
            mv.vec2(-.5, -.5), mv.vec2(.5, .5), mv.vec2(-.5, .5),
        ];

        var tBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, mv.flatten(textCoords), gl.STATIC_DRAW);
        var vTexCoord = gl.getAttribLocation(program, "vTexCoord");
        gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vTexCoord);
    }

    const initMatrices = () => {
        projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
        projectionMatrix = mv.perspective(90, canvas.width / canvas.height, .1, 30.0);
        gl.uniformMatrix4fv(projectionMatrixLoc, false, mv.flatten(projectionMatrix));
        
        at = mv.vec3(0.0, 0.0, 0.0);
        up = mv.vec3(0.0, 1.0, 0.0);
        eye = mv.vec3(0.0, 0.0, 0.0);
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
        modelViewMatrix = mv.mat4();
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, mv.flatten(modelViewMatrix));
        
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, groundTexture);
        gl.uniform1i(groundTexLoc, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    const renderShadow = () => {
        gl.depthFunc(gl.GREATER);

        updateLightPosition();

        modelViewMatrix = mv.lookAt(eye, at, up);
        let epsilon = 0.001;
        let m = mv.mat4();
        m[3][3] = 0.0;
        m[3][1] = -1.0 / (pointLightPosition[1] + 1.0 + epsilon);
        modelViewMatrix = mv.mult(modelViewMatrix, mv.translate(pointLightPosition));
        modelViewMatrix = mv.mult(modelViewMatrix, m);
        modelViewMatrix = mv.mult(modelViewMatrix, mv.translate(-pointLightPosition[0], -pointLightPosition[1], -pointLightPosition[2]));
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, mv.flatten(modelViewMatrix));

        gl.uniform1i(visibilityLoc, false);
        gl.drawArrays(gl.TRIANGLES, 6, 18);

        gl.depthFunc(gl.LESS);
    }


    const updateLightPosition = () => {
        time += 0.01;

        pointLightPosition = mv.vec3(
            pointLightCenter[0] + pointLightRadius * Math.cos(time),
            pointLightCenter[1],
            pointLightCenter[2] + pointLightRadius * Math.sin(time),
        );
    }

    const renderRects = () => {
        modelViewMatrix = mv.lookAt(eye, at, up);
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, mv.flatten(modelViewMatrix));

        gl.uniform1i(visibilityLoc, true);
        gl.drawArrays(gl.TRIANGLES, 6, 18);
    }
</script>

<div class="flex flex-col justify-center items-start w-4/5 text-xl m-auto">
    <div class="w-4/5 m-auto">
        <p>One problem with shadow polygons is that they are drawn even if there is no ground polygon. Use the depth buffer with a depth test function that accepts fragments with greater depth values to draw shadow polygons only if there is also a ground polygon. Handle z-fighting using an offset in the projection matrix. [Angel 8.11.5]</p>
        <p>Introduce a uniform visibility variable in your fragment shader. Use this variable as a multiplication factor to draw the shadow polygons in black.</p>
        <p>In WebGPU, create two pipelines: one for the normal depth test ("less") and one for the depth test to be used for the shadow polygons ("greater"). In the render pass, set the second pipeline when drawing the shadow polygons.</p>
    </div>

    <Result bind:canvas={canvas} bind:viewIndex={viewIndex} isLoading={isLoading} codeSnippets={codeSnippets} folderPath={$page.url.pathname}/>
</div>

