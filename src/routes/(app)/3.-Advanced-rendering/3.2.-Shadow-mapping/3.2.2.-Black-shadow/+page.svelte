<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores'
    import { WebGLUtils, fetchCodeSnippets, initShaders, convertToLatex } from '$lib/utils.svelte.js';
    import * as mv from '$lib/Libraries/MV.js';
    import { readOBJFile } from '$lib/Libraries/OBJParser.js';
    import Result from '$lib/components/Result.svelte';
    import Admonition from '$lib/components/UI/Admonition.svelte';
    import Checkbox from '$lib/components/UI/Checkbox.svelte';

    let viewIndex = $state(1);
    let isLoading = $state(true);
    let canvas = $state();
    let gl, teapotProgram, groundProgram;
    let codeSnippets = $state([]);

    let vertices;
    let groundTexLoc, groundTexture;
    let lightTime, teapotTime;
    let lightMovement = $state();
    let teapotMovement = $state();
    let pointLightCenter, pointLightRadius, pointLightPosition;
    let obj;
    let isShadowLoc;

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

            try {
                [gl, teapotProgram] = await initShaders(gl, teapotProgram, $page.url.pathname + '/teapotShaders/vshader.glsl', $page.url.pathname + '/teapotShaders/fshader.glsl');
                [gl, groundProgram] = await initShaders(gl, groundProgram, $page.url.pathname + '/groundShaders/vshader.glsl', $page.url.pathname + '/groundShaders/fshader.glsl');

                lightTime = teapotTime = 0.0;
                lightMovement = teapotMovement = true;

                initMatrices(groundProgram);
                initGroundVertices();
                initGroundTexture();

                isShadowLoc = gl.getUniformLocation(groundProgram, "isShadow");

                initLight();

                initMatrices(teapotProgram);
                initTeapotObject();
            } catch (error) {
                console.error(error);
            }

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
                }
            ]);
            isLoading = false;
        }
    });

    const initGroundVertices = () => {
        vertices = [
            mv.vec4(-2.0, -1.0, -1.0, 1.0), 
            mv.vec4(-2.0, -1.0, -5.0, 1.0), 
            mv.vec4(2.0, -1.0, -5.0, 1.0),
            mv.vec4(-2.0, -1.0, -1.0, 1.0), 
            mv.vec4(2.0, -1.0, -5.0, 1.0),
            mv.vec4(2.0, -1.0, -1.0, 1.0),
        ];
        
        groundProgram.vPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, groundProgram.vPositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, mv.flatten(vertices), gl.STATIC_DRAW);
        groundProgram.vPositionBuffer.num = 4;
        groundProgram.vPositionBuffer.type = gl.FLOAT;
        groundProgram.vPosition = gl.getAttribLocation(groundProgram, "vPosition");
        gl.vertexAttribPointer(groundProgram.vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(groundProgram.vPosition);
    };

    const initMatrices = (program) => {
        gl.useProgram(program);

        program.projectionMatrix = mv.perspective(90, canvas.width / canvas.height, 0.1, 10.0);
        program.projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
        gl.uniformMatrix4fv(program.projectionMatrixLoc, false, mv.flatten(program.projectionMatrix));

        program.viewMatrix = mv.mat4();
        program.viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix");
        gl.uniformMatrix4fv(program.viewMatrixLoc, false, mv.flatten(program.viewMatrix));

        program.modelMatrix = mv.mat4();
        program.modelMatrixLoc = gl.getUniformLocation(program, "modelMatrix");
        gl.uniformMatrix4fv(program.modelMatrixLoc, false, mv.flatten(program.modelMatrix));
    }

    const initGroundTexture = () => {
        groundTexture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, groundTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        groundTexLoc = gl.getUniformLocation(groundProgram, "groundTex");
        gl.uniform1i(groundTexLoc, 0);

        var myTexels = new Image();
        myTexels.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, groundTexture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, myTexels);
            gl.generateMipmap(gl.TEXTURE_2D);
        }
        myTexels.src = "/assets/textures/groundTexture.png";
        
        var textCoords = [
            mv.vec2(-.5, -.5), mv.vec2(.5, -.5), mv.vec2(.5, .5),
            mv.vec2(-.5, -.5), mv.vec2(.5, .5), mv.vec2(-.5, .5),
        ];

        groundProgram.vTexCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, groundProgram.vTexCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, mv.flatten(textCoords), gl.STATIC_DRAW);
        groundProgram.vTexCoordBuffer.num = 2;
        groundProgram.vTexCoordBuffer.type = gl.FLOAT;
        groundProgram.vTexCoord = gl.getAttribLocation(groundProgram, "vTexCoord");
        gl.vertexAttribPointer(groundProgram.vTexCoord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(groundProgram.vTexCoord);
    };

    const initLight = () => {
        pointLightCenter = mv.vec3(0.0, 5.0, 0.0);
        pointLightRadius = 2.0;

        teapotProgram.pointLightPositionLoc = gl.getUniformLocation(teapotProgram, "light");
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
                gl.bufferData(gl.ARRAY_BUFFER, mv.flatten(obj.vertices), gl.STATIC_DRAW);
                teapotProgram.vPositionBuffer.num = 3;
                teapotProgram.vPositionBuffer.type = gl.FLOAT;
                teapotProgram.vPosition = gl.getAttribLocation(teapotProgram, "vPosition");
                gl.vertexAttribPointer(teapotProgram.vPosition, 3, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(teapotProgram.vPosition);

                teapotProgram.vNormalBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, teapotProgram.vNormalBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, mv.flatten(obj.normals), gl.STATIC_DRAW);
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
    };

    const render = () => {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        teapotTime += 0.01 * teapotMovement;
        lightTime += 0.01 * lightMovement;

        updateLightPosition();

        renderGround();
        renderShadow();
        renderTeapot();

        requestAnimFrame(render);
    };

    const updateLightPosition = () => {
        pointLightPosition = mv.vec3(
            pointLightCenter[0] + pointLightRadius * Math.cos(lightTime),
            pointLightCenter[1],
            pointLightCenter[2] + pointLightRadius * Math.sin(lightTime),
        );

        gl.uniform3fv(teapotProgram.pointLightPositionLoc, mv.flatten(pointLightPosition));
    };

    const renderGround = () => {
        gl.useProgram(groundProgram);
        gl.uniform1i(isShadowLoc, false);

        initAttributeVariable(gl, groundProgram.vPosition, groundProgram.vPositionBuffer)
        initAttributeVariable(gl, groundProgram.vTexCoord, groundProgram.vTexCoordBuffer)

        groundProgram.modelMatrix = mv.mat4();
        gl.uniformMatrix4fv(groundProgram.modelMatrixLoc, false, mv.flatten(groundProgram.modelMatrix));

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, groundTexture);
        gl.uniform1i(groundTexLoc, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    const renderShadow = () => {
        gl.useProgram(groundProgram);

        gl.depthFunc(gl.GREATER);
        gl.uniform1i(isShadowLoc, true);

        initAttributeVariable(gl, teapotProgram.vPosition, teapotProgram.vPositionBuffer)
        initAttributeVariable(gl, teapotProgram.vNormal, teapotProgram.vNormalBuffer)

        groundProgram.modelMatrix = mv.mat4();

        let epsilon = 0.001;
        let m = mv.mat4();
        m[3][3] = 0.0;
        m[3][1] = -1.0 / (pointLightPosition[1] + (1.0 + (0.25 + 0.75 * Math.cos(teapotTime * 2))) + epsilon);

        groundProgram.modelMatrix = mv.mult(teapotProgram.modelMatrix, mv.translate(pointLightPosition[0], pointLightPosition[1], pointLightPosition[2]));
        groundProgram.modelMatrix = mv.mult(groundProgram.modelMatrix, m);
        groundProgram.modelMatrix = mv.mult(groundProgram.modelMatrix, mv.translate(-pointLightPosition[0], -pointLightPosition[1], -pointLightPosition[2]));
        
        gl.uniformMatrix4fv(groundProgram.modelMatrixLoc, false, mv.flatten(groundProgram.modelMatrix));
        gl.drawElements(gl.TRIANGLES, obj.indices.length, gl.UNSIGNED_SHORT, 0);

        gl.depthFunc(gl.LESS);
    }

    const renderTeapot = () => {
        gl.useProgram(teapotProgram);

        initAttributeVariable(gl, teapotProgram.vPosition, teapotProgram.vPositionBuffer)
        initAttributeVariable(gl, teapotProgram.vNormal, teapotProgram.vNormalBuffer)

        teapotProgram.modelMatrix = mv.mat4();
        teapotProgram.modelMatrix = mv.mult(teapotProgram.modelMatrix, mv.translate(0.0, -0.25 + 0.75 * Math.cos(teapotTime * 2), -3.0)); 
        teapotProgram.modelMatrixLoc = gl.getUniformLocation(teapotProgram, "modelMatrix");
        gl.uniformMatrix4fv(teapotProgram.modelMatrixLoc, false, mv.flatten(teapotProgram.modelMatrix));

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
        <p>For reference, insert the black projection shadows from Part 3 of Worksheet 8. In this scene, we use a model matrix to move the shadow-casting object. It is important to realize that the model matrix should be applied first (before the shadow projection matrix) when rendering the shadow polygons.</p>
        <p>Set the light direction in the teapot shading according to the position of the point light circling the scene. Create a button that switches point light animation on/off.</p>
    </div>

    <Result bind:canvas={canvas} bind:viewIndex={viewIndex} isLoading={isLoading} codeSnippets={codeSnippets} folderPath={$page.url.pathname}>
        {#snippet controls()}
            <div class="absolute left-0 top-0 flex flex-row justify-evenly items-center gap-4 w-full p-4 bg-gray-900/25 rounded-{viewIndex == 1 && 'r-'}lg">    
                <div class="flex flex-row justify-between items-center gap-2">
                    <Checkbox bind:checked={teapotMovement} label={'move teapot'}></Checkbox>
                    <Checkbox bind:checked={lightMovement} label={'move light'}></Checkbox>
                </div>
            </div>
        {/snippet}
    </Result>
</div>

