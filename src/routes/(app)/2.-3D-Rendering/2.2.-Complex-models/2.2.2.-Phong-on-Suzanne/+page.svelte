<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores'
    import { WebGLUtils, fetchCodeSnippets, initShaders } from '$lib/utils.svelte.js';
    import * as mv from '$lib/Libraries/MV.js';
    import { readOBJFile } from '$lib/Libraries/OBJParser.js';
    import Result from '$lib/components/Result.svelte';

    let viewIndex = $state(1);
    let isLoading = $state(true);
    let canvas = $state(), gl, program;
    let codeSnippets = $state([]);

    let thetaY;
    let viewMatrixLoc, modelMatrixLoc, projectionMatrixLoc, eyeLoc;
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

            gl = WebGLUtils.setupWebGL(canvas);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);

            try {
                [gl, program] = await initShaders(gl, program, $page.url.pathname + '/vshader.glsl', $page.url.pathname + '/fshader.glsl');

                gl.enable(gl.DEPTH_TEST);
                gl.enable(gl.CULL_FACE);
                gl.cullFace(gl.BACK);

                eyeLoc = gl.getUniformLocation(program, "eye");

                var lightDirection = mv.vec3(0.0, 0.0, -1.0);
                var lightDirectionLoc = gl.getUniformLocation(program, "lightDirection");
                gl.uniform3fv(lightDirectionLoc, mv.flatten(lightDirection));

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
                        gl.bufferData(gl.ARRAY_BUFFER, mv.flatten(obj.vertices), gl.STATIC_DRAW);
                        var vPosition = gl.getAttribLocation(program, "vPosition");
                        gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
                        gl.enableVertexAttribArray(vPosition);

                        var vNormalBUffer = gl.createBuffer();
                        gl.bindBuffer(gl.ARRAY_BUFFER, vNormalBUffer);
                        gl.bufferData(gl.ARRAY_BUFFER, mv.flatten(obj.normals), gl.STATIC_DRAW);
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
            } catch (error) {
                console.error(error);
            }

            codeSnippets = await fetchCodeSnippets($page.url.pathname);
            isLoading = false;
        }
    });

    const render = () => {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        thetaY += 0.005;

        var projectionMatrix = mv.perspective(45, canvas.width / canvas.height, 0.1, 100.0);

        var dist = 3.0;
        var eye = mv.vec3(dist * Math.cos(thetaY), 0.0, dist * Math.sin(thetaY));
        var at = mv.vec3(0.0, 0.0, 0.0);
        var up = mv.vec3(0.0, 1.0, 0.0);
        var viewMatrix = mv.lookAt(eye, at, up);

        var modelMatrix = mv.mat4();

        gl.uniformMatrix4fv(modelMatrixLoc, false, mv.flatten(modelMatrix));
        gl.uniformMatrix4fv(viewMatrixLoc, false, mv.flatten(viewMatrix));
        gl.uniformMatrix4fv(projectionMatrixLoc, false, mv.flatten(projectionMatrix));
        gl.uniform3fv(eyeLoc, mv.flatten(eye));

        gl.drawElements(gl.TRIANGLES, obj.indices.length, gl.UNSIGNED_SHORT, 0);

        requestAnimFrame(render);
    }
</script>

<div class="flex flex-col justify-center items-start w-4/5 text-xl m-auto">
    <div class="w-4/5 m-auto">
        <p>Set up a light source and use your shaders from Part 5 of Worksheet 4 to shade the object using Phong shading and the Phong illumination model.</p>
        <p>Explain how you obtain and use surface normals and explain how this relates to the surface smoothness when you are rendering a triangle mesh.</p> 
    </div>

    <Result bind:canvas={canvas} bind:viewIndex={viewIndex} isLoading={isLoading} codeSnippets={codeSnippets} folderPath={$page.url.pathname}/>
</div>

