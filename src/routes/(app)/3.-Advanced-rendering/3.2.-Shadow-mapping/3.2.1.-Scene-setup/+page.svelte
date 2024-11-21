<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores'
    import { WebGLUtils, fetchCodeSnippets, initShaders, convertToLatex } from '$lib/utils.svelte.js';
    import { vec2, vec3, vec4, mat4, perspective, mult, translate, flatten } from '$lib/Libraries/MV.js'; 
    import { readOBJFile } from '$lib/Libraries/OBJParser.js';
    import Result from '$lib/components/Result.svelte';
    import Admonition from '$lib/components/UI/Admonition.svelte';

    let viewIndex = $state(1);
    let isLoading = $state(true);
    let canvas = $state();
    let gl, teapotProgram, groundProgram;
    let codeSnippets = $state([]);

    let vertices;
    let groundTexLoc, groundTexture;
    let time;
    let pointLightCenter, pointLightRadius, pointLightPosition;
    let obj;

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

            time = 0.0;

            initMatrices(groundProgram);
            initGroundVertices();
            initGroundTexture();

            initLight();

            initMatrices(teapotProgram);
            initTeapotObject();

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
            vec4(-2.0, -1.0, -1.0, 1.0), 
            vec4(-2.0, -1.0, -5.0, 1.0), 
            vec4(2.0, -1.0, -5.0, 1.0),
            vec4(-2.0, -1.0, -1.0, 1.0), 
            vec4(2.0, -1.0, -5.0, 1.0),
            vec4(2.0, -1.0, -1.0, 1.0),
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
            vec2(-.5, -.5), vec2(.5, -.5), vec2(.5, .5),
            vec2(-.5, -.5), vec2(.5, .5), vec2(-.5, .5),
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

    const initLight = () => {
        pointLightCenter = vec3(0.0, 5.0, 0.0);
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
    };

    const render = () => {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        time += 0.01;

        updateLightPosition();

        renderGround();
        renderTeapot();

        requestAnimFrame(render);
    };

    const updateLightPosition = () => {
        pointLightPosition = vec3(
            pointLightCenter[0] + pointLightRadius * Math.cos(time),
            pointLightCenter[1],
            pointLightCenter[2] + pointLightRadius * Math.sin(time),
        );

        gl.uniform3fv(teapotProgram.pointLightPositionLoc, flatten(pointLightPosition));
    };

    const renderGround = () => {
        gl.useProgram(groundProgram);

        initAttributeVariable(gl, groundProgram.vPosition, groundProgram.vPositionBuffer)
        initAttributeVariable(gl, groundProgram.vTexCoord, groundProgram.vTexCoordBuffer)

        groundProgram.modelMatrix = mat4();
        gl.uniformMatrix4fv(groundProgram.modelMatrixLoc, false, flatten(groundProgram.modelMatrix));

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, groundTexture);
        gl.uniform1i(groundTexLoc, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    const renderTeapot = () => {
        gl.useProgram(teapotProgram);

        initAttributeVariable(gl, teapotProgram.vPosition, teapotProgram.vPositionBuffer)
        initAttributeVariable(gl, teapotProgram.vNormal, teapotProgram.vNormalBuffer)

        teapotProgram.modelMatrix = mat4();
        teapotProgram.modelMatrix = mult(teapotProgram.modelMatrix, translate(0.0, -0.25 + 0.75 * Math.cos(time * 2), -3.0)); 
        teapotProgram.modelMatrixLoc = gl.getUniformLocation(teapotProgram, "modelMatrix");
        gl.uniformMatrix4fv(teapotProgram.modelMatrixLoc, false, flatten(teapotProgram.modelMatrix));

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
        <p>The scene is a teapot jumping up and down on a textured ground quad with a point light circling the scene.</p> 
            
        <Admonition type='tip'>
            {#snippet textContent()}
                <p>We can set up this scene by combining Part 3 of Worksheet 5 with Part 3 of Worksheet 8.</p>
            {/snippet}
        </Admonition>

        <p>The main difficulties are that the ground plane and the loaded object use different shaders and that we need to position the teapot in the scene.</p>
            
        <ul>
            <li>Use your code from Part 3 of Worksheet 5 to load and render the teapot model, which is available on DTU Learn. Scale the teapot to a quarter of its original size and construct a model matrix for it that translates it by the vector $(0,-1,-3)$.</li>
            <li>Insert shaders and the part that initializes and draws the textured ground quad from Part 3 of Worksheet 8. The ground quad and the teapot use different shaders.
                <Admonition type='warning'>
                    {#snippet textContent()}
                        <p>Consult the section called “Switching Shaders” from the WebGL Programming Guide to render these two objects using their own shaders. It is important to note the use of the function initAttributeVariable in the render function.</p>
                    {/snippet}
                </Admonition>
            </li>
            <li>Move the teapot up and down over time by modifying the model matrix (translate along the $y$-axis from $-1$ to $0.5$). Create a button that turns this motion on/off.</li>
        </ul>
    </div>

    <Result bind:canvas={canvas} bind:viewIndex={viewIndex} isLoading={isLoading} codeSnippets={codeSnippets} folderPath={$page.url.pathname}/>
</div>

