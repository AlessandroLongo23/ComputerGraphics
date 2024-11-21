<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores'
    import { WebGLUtils, fetchCodeSnippets, initShaders, convertToLatex } from '$lib/utils.svelte.js';
    import { vec3, flatten, perspective, lookAt, mat4 } from '$lib/Libraries/MV.js';
    import { readOBJFile } from '$lib/Libraries/OBJParser.js';
    import Result from '$lib/components/Result.svelte';
    import Admonition from '$lib/components/UI/Admonition.svelte';

    let viewIndex = $state(1);
    let isLoading = $state(true);
    let canvas = $state();
    let gl, program;
    let codeSnippets = $state([]);

    let thetaY;
    let viewMatrixLoc, modelMatrixLoc, projectionMatrixLoc, eyeLoc;
    let obj;

    onMount(async () => {
        if (typeof window !== 'undefined') {
            convertToLatex();

            gl = WebGLUtils.setupWebGL(canvas);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);

            program = await initShaders(gl, program, $page.url.pathname + '/vshader.glsl', $page.url.pathname + '/fshader.glsl');

            gl.enable(gl.DEPTH_TEST);
            gl.enable(gl.CULL_FACE);
            gl.cullFace(gl.BACK);

            eyeLoc = gl.getUniformLocation(program, "eye");

            var leftLightDirection = vec3(-1.0, 0.0, 0.0);
            var leftLightDirectionLoc = gl.getUniformLocation(program, "leftLight");
            gl.uniform3fv(leftLightDirectionLoc, flatten(leftLightDirection));

            var rightLightDirection = vec3(1.0, 0.0, 0.0);
            var rightLightDirectionLoc = gl.getUniformLocation(program, "rightLight");
            gl.uniform3fv(rightLightDirectionLoc, flatten(rightLightDirection));

            viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix");
            modelMatrixLoc = gl.getUniformLocation(program, "modelMatrix");
            projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

            readOBJFile('/assets/models/suzanne.obj', 0.75, false)
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

                    var vPositionBuffer = gl.createBuffer();
                    gl.bindBuffer(gl.ARRAY_BUFFER, vPositionBuffer);
                    gl.bufferData(gl.ARRAY_BUFFER, flatten(obj.vertices), gl.STATIC_DRAW);
                    var vPosition = gl.getAttribLocation(program, "vPosition");
                    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
                    gl.enableVertexAttribArray(vPosition);

                    var vNormalBUffer = gl.createBuffer();
                    gl.bindBuffer(gl.ARRAY_BUFFER, vNormalBUffer);
                    gl.bufferData(gl.ARRAY_BUFFER, flatten(obj.normals), gl.STATIC_DRAW);
                    var vNormal = gl.getAttribLocation(program, "vNormal");
                    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
                    gl.enableVertexAttribArray(vNormal);

                    var indices = new Uint16Array(obj.indices);
                    var iBuffer = gl.createBuffer();
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
                    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

                    thetaY = Math.PI / 6;

                    render();
                })
                .catch(error => {
                    console.error("Error loading OBJ file:", error);
                });

            codeSnippets = await fetchCodeSnippets($page.url.pathname);
            isLoading = false;
        }
    });

    const render = () => {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        thetaY += 0.0025;

        var projectionMatrix = perspective(45, canvas.width / canvas.height, 0.1, 100.0);

        var dist = 3.0;
        var eye = vec3(dist * Math.cos(thetaY), 0.0, dist * Math.sin(thetaY));
        var at = vec3(0.0, 0.0, 0.0);
        var up = vec3(0.0, 1.0, 0.0);
        var viewMatrix = lookAt(eye, at, up);

        var modelMatrix = mat4();

        gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
        gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(viewMatrix));
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
        gl.uniform3fv(eyeLoc, flatten(eye));

        gl.drawElements(gl.TRIANGLES, obj.indices.length, gl.UNSIGNED_SHORT, 0);

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

    <Result bind:canvas={canvas} bind:viewIndex={viewIndex} isLoading={isLoading} codeSnippets={codeSnippets} folderPath={$page.url.pathname}/>
</div>

