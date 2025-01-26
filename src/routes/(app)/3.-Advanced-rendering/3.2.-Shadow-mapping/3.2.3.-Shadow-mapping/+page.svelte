<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { WebGLUtils, fetchCodeSnippets, initShaders, convertToLatex } from '$lib/utils.svelte.js';
    import { vec2, vec3, vec4, mat4, perspective, mult, translate, flatten, lookAt } from '$lib/Libraries/MV.js';
    import { readOBJFile } from '$lib/Libraries/OBJParser.js';
    import Result from '$lib/components/Result.svelte';
    import Admonition from '$lib/components/UI/Admonition.svelte';
    import Checkbox from '$lib/components/UI/Checkbox.svelte';

    let viewIndex = $state(1);
    let isLoading = $state(true);
    let canvas = $state();
    let gl, teapotProgram, groundProgram, shadowProgram;
    let codeSnippets = $state([]);

    let vertices;
    let groundTexLoc, groundTexture;
    let lightTime, teapotTime;
    let lightMovement = $state();
    let teapotMovement = $state();
    let pointLightCenter, pointLightRadius, pointLightPosition;
    let cameraPosition, teapotPosition, groundPosition;
    let target, up;
    let obj;
    let isShadowLoc, fbo;

    onMount(async () => {
        if (typeof window !== 'undefined') {
            convertToLatex();

            gl = WebGLUtils.setupWebGL(canvas);

            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);

            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LESS);
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

            teapotProgram = await initShaders(gl, teapotProgram, $page.url.pathname + '/teapotShaders/vshader.glsl', $page.url.pathname + '/teapotShaders/fshader.glsl');
            groundProgram = await initShaders(gl, groundProgram, $page.url.pathname + '/groundShaders/vshader.glsl', $page.url.pathname + '/groundShaders/fshader.glsl');
            shadowProgram = await initShaders(gl, shadowProgram, $page.url.pathname + '/shadowShaders/vshader.glsl', $page.url.pathname + '/shadowShaders/fshader.glsl');

            lightTime = teapotTime = 0.0;
            lightMovement = teapotMovement = true;
            initCamera();
            initLight();

            initMatrices(groundProgram);
            initGroundVertices();
            initGroundObject();

            initGroundTexture();

            groundProgram.shadowMapLoc = gl.getUniformLocation(groundProgram, "shadowMap");
            gl.uniform1i(groundProgram.shadowMapLoc, 1);

            groundProgram.viewMatrixFromLight = mat4();
            groundProgram.viewMatrixFromLightLoc = gl.getUniformLocation(groundProgram, "viewMatrixFromLight");
            gl.uniformMatrix4fv(groundProgram.viewMatrixFromLightLoc, false, flatten(groundProgram.viewMatrixFromLight));

            groundProgram.projectionMatrixFromLight = mat4();
            groundProgram.projectionMatrixFromLightLoc = gl.getUniformLocation(groundProgram, "projectionMatrixFromLight");
            gl.uniformMatrix4fv(groundProgram.projectionMatrixFromLightLoc, false, flatten(groundProgram.projectionMatrixFromLight));

            groundProgram.modelMatrixFromLight = mat4();
            groundProgram.modelMatrixFromLightLoc = gl.getUniformLocation(groundProgram, "modelMatrixFromLight");
            gl.uniformMatrix4fv(groundProgram.modelMatrixFromLightLoc, false, flatten(groundProgram.modelMatrixFromLight));

            initMatrices(shadowProgram);
            initShadowTexture();

            shadowProgram.modelMatrixLoc = gl.getUniformLocation(shadowProgram, 'modelMatrix');
            shadowProgram.projectionMatrixLoc = gl.getUniformLocation(shadowProgram, 'projectionMatrix');
            shadowProgram.viewMatrixLoc = gl.getUniformLocation(shadowProgram, 'viewMatrix');

            initMatrices(teapotProgram);
            initTeapotObject();

            teapotProgram.shadowMapLoc = gl.getUniformLocation(teapotProgram, "shadowMap");
            gl.uniform1i(teapotProgram.shadowMapLoc, 1);

            teapotProgram.viewMatrixFromLight = mat4();
            teapotProgram.viewMatrixFromLightLoc = gl.getUniformLocation(teapotProgram, "viewMatrixFromLight");
            gl.uniformMatrix4fv(teapotProgram.viewMatrixFromLightLoc, false, flatten(teapotProgram.viewMatrixFromLight));

            teapotProgram.projectionMatrixFromLight = mat4();
            teapotProgram.projectionMatrixFromLightLoc = gl.getUniformLocation(teapotProgram, "projectionMatrixFromLight");
            gl.uniformMatrix4fv(teapotProgram.projectionMatrixFromLightLoc, false, flatten(teapotProgram.projectionMatrixFromLight));

            teapotProgram.modelMatrixFromLight = mat4();
            teapotProgram.modelMatrixFromLightLoc = gl.getUniformLocation(teapotProgram, "modelMatrixFromLight");
            gl.uniformMatrix4fv(teapotProgram.modelMatrixFromLightLoc, false, flatten(teapotProgram.modelMatrixFromLight));

            codeSnippets = await fetchCodeSnippets([
                {
                    name: 'main.js',
                    language: 'JavaScript',
                    path: $page.url.pathname + '/main.js'
                },
                {
                    name: 'index.html',
                    language: 'HTML',
                    path: $page.url.pathname + '/index.html'
                },
                {
                    name: 'groundvShader.glsl',
                    language: 'GLSL',
                    path: $page.url.pathname + '/groundShaders/vshader.glsl'
                },
                {
                    name: 'groundfShader.glsl',
                    language: 'GLSL',
                    path: $page.url.pathname + '/groundShaders/fshader.glsl'
                },
                {
                    name: 'teapotvShader.glsl',
                    language: 'GLSL',
                    path: $page.url.pathname + '/teapotShaders/vshader.glsl'
                },
                {
                    name: 'teapotfShader.glsl',
                    language: 'GLSL',
                    path: $page.url.pathname + '/teapotShaders/fshader.glsl'
                },
                {
                    name: 'shadowvShader.glsl',
                    language: 'GLSL',
                    path: $page.url.pathname + '/shadowShaders/vshader.glsl'
                },
                {
                    name: 'shadowfShader.glsl',
                    language: 'GLSL',
                    path: $page.url.pathname + '/shadowShaders/fshader.glsl'
                }
            ]);
            isLoading = false;
        }
    });

    const initCamera = () => {
        cameraPosition = vec3(0.0, 0.0, 3.0);
        target = vec3(0.0, 0.0, 0.0);
        up = vec3(0.0, 1.0, 0.0);
    };

    const initLight = () => {
        pointLightCenter = vec3(0.0, 2.0, 0.0);
        pointLightRadius = 5;

        teapotProgram.pointLightPositionLoc = gl.getUniformLocation(teapotProgram, "light");
    };

    const initGroundVertices = () => {
        vertices = [
            vec4(-2.0, 0.0, 2.0, 1.0), 
            vec4(-2.0, 0.0, -2.0, 1.0), 
            vec4(2.0, 0.0, -2.0, 1.0),
            vec4(-2.0, 0.0, 2.0, 1.0), 
            vec4(2.0, 0.0, -2.0, 1.0),
            vec4(2.0, 0.0, 2.0, 1.0),
        ];
        
        groundProgram.vPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, groundProgram.vPositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
        groundProgram.vPositionBuffer.num = 4;
        groundProgram.vPositionBuffer.type = gl.FLOAT;
        groundProgram.vPosition = gl.getAttribLocation(groundProgram, "vPosition");
        gl.vertexAttribPointer(groundProgram.vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(groundProgram.vPosition);
    };

    const initGroundObject = () => {
        groundProgram.projectionMatrix = perspective(90, canvas.width / canvas.height, 0.1, 10.0);
        groundProgram.projectionMatrixLoc = gl.getUniformLocation(groundProgram, "projectionMatrix");
        gl.uniformMatrix4fv(groundProgram.projectionMatrixLoc, false, flatten(groundProgram.projectionMatrix));

        groundPosition = vec3(0.0, -1.0, 0.0);
        groundProgram.modelMatrix = mat4();
        groundProgram.modelMatrix = mult(groundProgram.modelMatrix, translate(groundPosition));
        gl.uniformMatrix4fv(groundProgram.modelMatrixLoc, false, flatten(groundProgram.modelMatrix));

        let eye = cameraPosition;
        groundProgram.viewMatrix = lookAt(eye, target, up);
        gl.uniformMatrix4fv(groundProgram.viewMatrixLoc, false, flatten(groundProgram.viewMatrix));
    }

    const initMatrices = (program) => {
        gl.useProgram(program);

        program.projectionMatrix = perspective(90, canvas.width / canvas.height, 0.1, 10.0);
        program.projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
        gl.uniformMatrix4fv(program.projectionMatrixLoc, false, flatten(program.projectionMatrix));

        program.viewMatrix = mat4();
        program.viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix");
        gl.uniformMatrix4fv(program.viewMatrixLoc, false, flatten(program.viewMatrix));

        program.modelMatrix = mat4();
        program.modelMatrixLoc = gl.getUniformLocation(program, "modelMatrix");
        gl.uniformMatrix4fv(program.modelMatrixLoc, false, flatten(program.modelMatrix));
    }

    const initGroundTexture = () => {
        groundTexture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, groundTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        groundProgram.groundTexLoc = gl.getUniformLocation(groundProgram, "groundTex");
        gl.uniform1i(groundProgram.groundTexLoc, 0);

        var myTexels = new Image();
        myTexels.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, groundTexture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, myTexels);
            gl.generateMipmap(gl.TEXTURE_2D);
        }
        myTexels.src = "/assets/textures/groundTexture.png";
        
        var textCoords = [
            vec2(0.0, 0.0), vec2(1.0, 0.0), vec2(1.0, 1.0),
            vec2(0.0, 0.0), vec2(1.0, 1.0), vec2(0.0, 1.0),
        ];

        groundProgram.vTexCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, groundProgram.vTexCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(textCoords), gl.STATIC_DRAW);
        groundProgram.vTexCoordBuffer.num = 2;
        groundProgram.vTexCoordBuffer.type = gl.FLOAT;
        groundProgram.vTexCoord = gl.getAttribLocation(groundProgram, "vTexCoord");
        gl.vertexAttribPointer(groundProgram.vTexCoord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(groundProgram.vTexCoord);
    };

    const initShadowTexture = () => {
        fbo = initFrameBufferObject(gl);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, fbo.texture);
    };

    const initFrameBufferObject = (gl) => {
        const framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1024, 1024, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        const depthBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, 1024, 1024);
        
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

        return { framebuffer, texture, depthBuffer };
    };

    const initTeapotObject = () => {
        readOBJFile('/assets/models/teapot.obj', 0.25, false)
            .then(objInfo => {
                obj = objInfo;

                var newVertices = [];
                var newNormals = [];
                for (let i = 0; i < obj.vertices.length; i++) {
                    if (i % 4 != 3) {
                        newVertices.push(obj.vertices[i]);
                        newNormals.push(obj.normals[i]);
                    }
                }
                obj.vertices = newVertices;
                obj.normals = newNormals;

                teapotProgram.vPositionBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, teapotProgram.vPositionBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, flatten(obj.vertices), gl.STATIC_DRAW);
                teapotProgram.vPositionBuffer.num = 3;
                teapotProgram.vPositionBuffer.type = gl.FLOAT;
                teapotProgram.vPosition = gl.getAttribLocation(teapotProgram, "vPosition");
                gl.vertexAttribPointer(teapotProgram.vPosition, 3, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(teapotProgram.vPosition);

                teapotProgram.vNormalBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, teapotProgram.vNormalBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, flatten(obj.normals), gl.STATIC_DRAW);
                teapotProgram.vNormalBuffer.num = 3;
                teapotProgram.vNormalBuffer.type = gl.FLOAT;
                teapotProgram.vNormal = gl.getAttribLocation(teapotProgram, "vNormal");
                gl.vertexAttribPointer(teapotProgram.vNormal, 3, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(teapotProgram.vNormal);

                var indices = new Uint16Array(obj.indices);
                var iBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

                render();
            })
            .catch(error => {
                console.error("Error loading OBJ file:", error);
            });

        teapotProgram.viewMatrix = mat4();
        let eye = cameraPosition;
        teapotProgram.viewMatrix = lookAt(eye, target, up);
        gl.uniformMatrix4fv(teapotProgram.viewMatrixLoc, false, flatten(teapotProgram.viewMatrix));
    };

    const render = () => {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        updateLightPosition();
        updateTeapotPosition();
        
        gl.viewport(0, 0, 1024, 1024);
        computeShadow();

        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
        renderGround();
        renderTeapot();

        requestAnimFrame(render);
    };
    
    const updateLightPosition = () => {
        lightTime += 0.01 * lightMovement;

        pointLightPosition = vec3(
            pointLightCenter[0] + pointLightRadius * Math.cos(lightTime),
            pointLightCenter[1],
            pointLightCenter[2] + pointLightRadius * Math.sin(lightTime),
        );

        gl.uniform3fv(teapotProgram.pointLightPositionLoc, flatten(pointLightPosition));
    };
    
    const updateTeapotPosition = () => {
        teapotTime += 0.01 * teapotMovement;
        
        teapotPosition = vec3(
            0.0,
            -0.25 + 0.75 * Math.cos(teapotTime * 2),
            0.0,
        )
    }

    const computeShadow = () => {
        let projectionMatrixFromLight = perspective(90, canvas.width / canvas.height, .5, 10.0);

        let modelMatrixFromLight = mat4();
        modelMatrixFromLight = mult(modelMatrixFromLight, translate(teapotPosition));   

        let eye = pointLightPosition;
        let viewMatrixFromLight = lookAt(eye, target, up);

        gl.useProgram(teapotProgram);
        gl.uniformMatrix4fv(teapotProgram.projectionMatrixFromLightLoc, false, flatten(projectionMatrixFromLight));
        gl.uniformMatrix4fv(teapotProgram.modelMatrixFromLightLoc, false, flatten(modelMatrixFromLight));
        gl.uniformMatrix4fv(teapotProgram.viewMatrixFromLightLoc, false, flatten(viewMatrixFromLight));
        
        gl.useProgram(groundProgram);
        gl.uniformMatrix4fv(groundProgram.projectionMatrixFromLightLoc, false, flatten(projectionMatrixFromLight));
        gl.uniformMatrix4fv(groundProgram.modelMatrixFromLightLoc, false, flatten(modelMatrixFromLight));
        gl.uniformMatrix4fv(groundProgram.viewMatrixFromLightLoc, false, flatten(viewMatrixFromLight));

        gl.useProgram(shadowProgram);
        gl.uniformMatrix4fv(shadowProgram.projectionMatrixLoc, false, flatten(projectionMatrixFromLight));
        gl.uniformMatrix4fv(shadowProgram.modelMatrixLoc, false, flatten(modelMatrixFromLight));
        gl.uniformMatrix4fv(shadowProgram.viewMatrixLoc, false, flatten(viewMatrixFromLight));

        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.framebuffer);
        gl.clearColor(1.0, 1.0, 1.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        shadowProgram.vPosition = gl.getAttribLocation(shadowProgram, "vPosition");
        initAttributeVariable(gl, shadowProgram.vPosition, teapotProgram.vPositionBuffer)
        gl.drawElements(gl.TRIANGLES, obj.indices.length, gl.UNSIGNED_SHORT, 0);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    const renderGround = () => {
        gl.useProgram(groundProgram);
        gl.uniform1i(isShadowLoc, false);

        initAttributeVariable(gl, groundProgram.vPosition, groundProgram.vPositionBuffer)
        initAttributeVariable(gl, groundProgram.vTexCoord, groundProgram.vTexCoordBuffer)

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, groundTexture);
        gl.uniform1i(groundProgram.groundTexLoc, 0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, fbo.texture);
        gl.uniform1i(groundProgram.shadowMapLoc, 1);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    const renderTeapot = () => {
        gl.useProgram(teapotProgram);

        initAttributeVariable(gl, teapotProgram.vPosition, teapotProgram.vPositionBuffer)
        initAttributeVariable(gl, teapotProgram.vNormal, teapotProgram.vNormalBuffer)

        teapotProgram.modelMatrix = mat4();
        teapotProgram.modelMatrix = mult(teapotProgram.modelMatrix, translate(teapotPosition)); 
        gl.uniformMatrix4fv(teapotProgram.modelMatrixLoc, false, flatten(teapotProgram.modelMatrix));

        gl.bindTexture(gl.TEXTURE_2D, fbo.texture);
        gl.uniform1i(teapotProgram.shadowMapLoc, 1);

        gl.drawElements(gl.TRIANGLES, obj.indices.length, gl.UNSIGNED_SHORT, 0);
    };

    const initAttributeVariable = (gl, attribute, buffer) => {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(attribute, buffer.num, buffer.type, false, 0, 0);
        gl.enableVertexAttribArray(attribute);
    }
</script>

<div class="flex flex-col justify-center items-start w-4/5 text-xl m-auto">
    <div class="w-4/5 m-auto">
        <p>Projection shadows have several shortcomings. A significant problem is missing self-shadowing. Shadow mapping solves most of these issues (but introduces other problems).</p>
        <p>Your task is now to replace the projection shadows from Part 1 with shadow mapping.</p>
        
        <Admonition type='tip'>
            {#snippet textContent()}
                <p class="m-0">We recommend using the “Display Shadows” section of the WebGL programming guide. This text is available on DTU Learn.</p>
            {/snippet}
        </Admonition>
        
        <p>There are two kinds of coordinate spaces used in this assignment: camera relative and light relative. The following figure illustrates these coordinate spaces and the transformations between them. The basic steps are:</p> 
        <ul>
            <li>Render the scene from the point of view of the light source. Use a shader that draws fragment depth and use a framebuffer object (fbo) to render directly into a texture. The viewport might need adjustment when using the fbo. Bind the depth texture when drawing the ground plane to inspect the result and use this inspection to set proper light view and light projection matrices. [Angel 5.11, 7.12] </li>
            <li>Use the rendered depth texture in the other shaders to determine whether a fragment is in shadow or fully lit. Multi-texturing is needed for the ground plane to combine shadow and texture mapping. [Angel 5.11, 7.5.6]  Make the shadows dark but not pitch black. This can be done by adjusting the visibility factor in the fragment shader.</li>
        </ul>
    </div>

    <Result bind:canvas={canvas} bind:viewIndex={viewIndex} isLoading={isLoading} codeSnippets={codeSnippets} folderPath={$page.url.pathname}>
        {#snippet controls()}
            <div class="absolute left-0 top-0 flex flex-row justify-evenly items-center gap-4 w-full p-4 bg-zinc-900/25 rounded-{viewIndex == 1 && 'r-'}lg">    
                <div class="flex flex-row justify-between items-center gap-2">
                    <Checkbox bind:checked={teapotMovement} label={'move teapot'}></Checkbox>
                    <Checkbox bind:checked={lightMovement} label={'move light'}></Checkbox>
                </div>
            </div>
        {/snippet}
    </Result>
</div>

