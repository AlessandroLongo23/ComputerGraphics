<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores'
    import { WebGLUtils, fetchCodeSnippets, initShaders } from '$lib/utils.svelte.js';
    import * as mv from '$lib/Libraries/MV.js';
    import { readOBJFile } from '$lib/Libraries/OBJParser.js';
    import Result from '$lib/components/Result.svelte';
    import Admonition from '$lib/components/UI/Admonition.svelte';

    let viewIndex = $state(1);
    let isLoading = $state(true);
    let canvas = $state(), gl, program;
    let codeSnippets = $state([]);

    let thetaY;
    let viewMatrixLoc, modelMatrixLoc, projectionMatrixLoc, eyePosLoc;
    let obj;

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

                // enabling depth test and culling
                gl.enable(gl.DEPTH_TEST);
                gl.enable(gl.CULL_FACE);
                gl.cullFace(gl.BACK);

                // set the camera position
                eyePosLoc = gl.getUniformLocation(program, "eyePos");

                // set the light direction
                var leftLightDirection = mv.vec3(-1.0, 0.0, 0.0);
                var leftLightDirectionLoc = gl.getUniformLocation(program, "left_light");
                gl.uniform3fv(leftLightDirectionLoc, mv.flatten(leftLightDirection));

                var rightLightDirection = mv.vec3(1.0, 0.0, 0.0);
                var rightLightDirectionLoc = gl.getUniformLocation(program, "right_light");
                gl.uniform3fv(rightLightDirectionLoc, mv.flatten(rightLightDirection));

                // Uniform locations for the matrices
                viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix");
                modelMatrixLoc = gl.getUniformLocation(program, "modelMatrix");
                projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

                // Load the OBJ file and buffer its data
                readOBJFile('/assets/models/suzanne.obj', 0.75, false)
                    .then(objInfo => {
                        obj = objInfo;

                        var newVertices = [];
                        var newColors = [];
                        var newNormals = [];
                        for (let i = 0; i < obj.vertices.length; i++) {
                            if (i % 4 != 3) {
                                newVertices.push(obj.vertices[i]);
                                newColors.push(obj.colors[i]);
                                newNormals.push(obj.normals[i]);
                            }
                        }
                        obj.vertices = newVertices;
                        obj.normals = newNormals;
                        obj.colors = newColors;

                        // Create and bind the vertex buffer for vertices
                        var vBuffer = gl.createBuffer();
                        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
                        gl.bufferData(gl.ARRAY_BUFFER, mv.flatten(obj.vertices), gl.STATIC_DRAW);
                        var vPosition = gl.getAttribLocation(program, "vPosition");
                        gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
                        gl.enableVertexAttribArray(vPosition);

                        // Create and bind the color buffer for colors
                        var cBuffer = gl.createBuffer();
                        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
                        gl.bufferData(gl.ARRAY_BUFFER, mv.flatten(obj.colors), gl.STATIC_DRAW);
                        var vColor = gl.getAttribLocation(program, "vColor");
                        gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
                        gl.enableVertexAttribArray(vColor);

                        // Create and bind the index buffer
                        var indices = new Uint16Array(obj.indices);
                        var iBuffer = gl.createBuffer();
                        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
                        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

                        thetaY = Math.PI / 6;

                        // Start rendering
                        render();
                    })
                    .catch(error => {
                        console.error("Error loading OBJ file:", error);
                    });
            } catch (error) {
                console.error(error);
            }

            codeSnippets = await fetchCodeSnippets($page.url.pathname);
            isLoading = false;
        }
    });

    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        thetaY += 0.0025;

        // projection matrix
        var projectionMatrix = mv.perspective(45, canvas.width / canvas.height, 0.1, 100.0);

        // view matrix
        var dist = 3.0;
        var eyePos = mv.vec3(dist * Math.cos(thetaY), 0.0, dist * Math.sin(thetaY));
        var target = mv.vec3(0.0, 0.0, 0.0);
        var up = mv.vec3(0.0, 1.0, 0.0);
        var viewMatrix = mv.lookAt(eyePos, target, up);

        // model matrix
        var modelMatrix = mv.mat4();

        // Pass matrices to the shader
        gl.uniformMatrix4fv(modelMatrixLoc, false, mv.flatten(modelMatrix));
        gl.uniformMatrix4fv(viewMatrixLoc, false, mv.flatten(viewMatrix));
        gl.uniformMatrix4fv(projectionMatrixLoc, false, mv.flatten(projectionMatrix));
        gl.uniform3fv(eyePosLoc, mv.flatten(eyePos));

        // Draw the object using the index buffer
        gl.drawElements(gl.TRIANGLES, obj.indices.length, gl.UNSIGNED_SHORT, 0);

        // Request the next frame
        requestAnimFrame(render);
    }
</script>

<div class="flex flex-col justify-center items-start w-4/5 text-xl m-auto">
    <div class="w-4/5 m-auto">
        <p>Create a nice 3D object using a modeling tool such as Blender or Maya or Google SketchUp and export it as a triangle mesh in Wavefront OBJ format. The modelled object must be more interesting than a box. The Blender monkey called Suzanne is an option.</p>
        <Admonition type='warning'>
            {#snippet textContent()}
                <p>If you are absolutely at a loss with respect to modelling a 3D object exporting it as an OBJ file, use the teapot uploaded to CampusNet.</p>
                <p>This option is a quick way to move on, but not a full solution for this part.</p>
            {/snippet}
        </Admonition>
        <p>Upload the OBJ file and the associated MTL file (if used) to the server, so that your WebGL application is able to load it.</p>
        <p>The next step is to load the OBJ file. A method for loading and displaying such files is given in the section “Load and Display 3D Models” from the WebGL Programming Guide (available on DTU Learn).</p>
        <p>The part of the code that parses the OBJ file is in the file OBJParser.js, which we have uploaded to DTU Learn. Place OBJParser.js on the server together with the other library files and use the async and await keywords together with the function readOBJFile to load the triangle mesh from the OBJ file.</p>
        <p>Once data is available, pass it to WebGL buffers, set up the camera, and draw your 3D object as an indexed face set using a simple set of shaders.</p>
    </div>

    <Result bind:canvas={canvas} bind:viewIndex={viewIndex} isLoading={isLoading} codeSnippets={codeSnippets}/>
</div>

