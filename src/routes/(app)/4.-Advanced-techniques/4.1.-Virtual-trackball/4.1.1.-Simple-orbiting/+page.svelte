<script>
    import { vec2, vec3, vec4, mat4, perspective, flatten, lookAt, normalize, mix } from '$lib/Libraries/MV.js';
    import { WebGLUtils, fetchCodeSnippets, initShaders, convertToLatex } from '$lib/utils.svelte.js';
    import { textWidth } from '$lib/stores/layout.svelte.js';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';

    import Result from '$lib/components/Result.svelte';

    let viewIndex = $state(1);
    let isLoading = $state(true);
    let canvas = $state();
    let gl, program;
    let codeSnippets = $state([]);

    let vertices, baseVertices, vBuffer;
    let projectionMatrix, projectionMatrixLoc;
    let viewMatrix, viewMatrixLoc;
    let modelMatrix, modelMatrixLoc;
    let dist;
    let eye, at, up;
    let texture, textureLoc;
    let theta, isLeftButtonDown, prevMouse;
    let subdivisions;
    let normals, nBuffer;

    onMount(async () => {
        if (typeof window !== 'undefined') {
            gl = WebGLUtils.setupWebGL(canvas);

            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);

            gl.enable(gl.DEPTH_TEST);
            gl.enable(gl.CULL_FACE);
            gl.cullFace(gl.FRONT);

            program = await initShaders(gl, program, $page.url.pathname + '/vshader.glsl', $page.url.pathname + '/fshader.glsl');

            initLight();
            initMatrices();

            baseVertices = [
                vec4(0.0, 0.0, -1.0, 1), 
                vec4(0.0, 0.942809, 0.333333, 1),
                vec4(-0.816497, -0.471405, 0.333333, 1),
                vec4(0.816497, -0.471405, 0.333333, 1),
            ]

            initGroundTexture();
            initEventHandlers(document.getElementById("gl-canvas"));

            subdivisions = 6;
            buildPolyhedron();

            render();

            convertToLatex();
            codeSnippets = await fetchCodeSnippets($page.url.pathname);
            isLoading = false;
        }
    });

    const initLight = () => {
        var lightDirection = vec3(0.0, 0.0, 1.0);
        var lightDirectionLoc = gl.getUniformLocation(program, "lightDirection");
        gl.uniform3fv(lightDirectionLoc, flatten(lightDirection));
    }

    const initMatrices = () => {
        projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
        projectionMatrix = perspective(45, canvas.width / canvas.height, 0.1, 100.0);
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

        viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix");
        dist = 4.0;
        eye = vec3(0.0, 0.0, dist);
        at = vec3(0.0, 0.0, 0.0);
        up = vec3(0.0, 1.0, 0.0);
        viewMatrix = lookAt(eye, at, up);
        gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(viewMatrix));

        modelMatrix = mat4();
        modelMatrixLoc = gl.getUniformLocation(program, "modelMatrix");
        gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
    }

    const initGroundTexture = () => {
        gl.activeTexture(gl.TEXTURE0);
        texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        textureLoc = gl.getUniformLocation(program, "texMap");
        gl.uniform1i(textureLoc, 0);

        var myTexels = new Image();
        myTexels.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, myTexels);
            gl.generateMipmap(gl.TEXTURE_2D);
        }
        myTexels.src = "/assets/textures/earth.jpg";
    }

    const render = () => {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        viewMatrix = lookAt(eye, at, up);

        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
        gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(viewMatrix));
        gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));

        gl.drawArrays(gl.TRIANGLES, 0, vertices.length);
        
        requestAnimFrame(render);
    }

    const buildPolyhedron = () => {
        vertices = [];
        normals = [];
        tetrahedron(baseVertices[0], baseVertices[1], baseVertices[2], baseVertices[3], subdivisions);

        vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
        var vPosition = gl.getAttribLocation(program, "vPosition");
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);

        nBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);
        var vNormal = gl.getAttribLocation(program, "vNormal");
        gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vNormal);
    }

    const tetrahedron = (a, b, c, d, n) => {
        divideTriangle(a, b, c, n);
        divideTriangle(d, c, b, n);
        divideTriangle(a, d, b, n);
        divideTriangle(a, c, d, n);
    }

    const divideTriangle = (a, b, c, count) => {
        if (count === 0) {
            triangle(a, b, c);
            return;
        }

        var ab = normalize(mix(a, b, 0.5), true);
        var ac = normalize(mix(a, c, 0.5), true);
        var bc = normalize(mix(b, c, 0.5), true);

        divideTriangle(a, ab, ac, count - 1);
        divideTriangle(ab, b, bc, count - 1);
        divideTriangle(bc, c, ac, count - 1);
        divideTriangle(ab, bc, ac, count - 1);
    }

    const triangle = (a, b, c) => {
        vertices.push(a);
        normals.push(a);
        vertices.push(b);
        normals.push(b);
        vertices.push(c);
        normals.push(c);
    }

    const initEventHandlers = (canvas) => {
        theta = vec2();
        isLeftButtonDown = false
        prevMouse = vec2();

        canvas.addEventListener('mousedown', (event) => {
            event.preventDefault();

            if (event.button == 0) {
                isLeftButtonDown = true;

                prevMouse[0] = event.clientX;
                prevMouse[1] = event.clientY;
            }
        });

        canvas.addEventListener('mouseup', (event) => {
            event.preventDefault();

            isLeftButtonDown = false;
        });

        canvas.addEventListener('mousemove', (event) => {
            event.preventDefault();

            if (isLeftButtonDown) {
                theta[0] -= (event.clientX - prevMouse[0]) / canvas.width * Math.PI * 2;
                theta[1] += (event.clientY - prevMouse[1]) / canvas.height * Math.PI * 2;

                theta[1] = Math.min(Math.max(theta[1], -Math.PI / 2.0), Math.PI / 2.0);
                
                prevMouse[0] = event.clientX;
                prevMouse[1] = event.clientY;

                eye = vec3(
                    dist * Math.sin(theta[0]) * Math.cos(theta[1]),
                    dist * Math.sin(theta[1]),
                    dist * Math.cos(theta[0]) * Math.cos(theta[1])
                )
            }
        });
    }
</script>

<div class="flex flex-col justify-center items-start {$textWidth} text-xl m-auto gap-6">
    <p class="text-xl font-medium m-0">Assignment</p>
    
    <div class="flex flex-col gap-4 text-zinc-950/65 dark:text-zinc-50/65">
        <p>Pick one of your previous solutions where you draw in 3D. Use the mouse events from the WebGL Programming Guide (“Rotate an Object with the Mouse”) to set mouse events that modify your view matrix when a mouse button is down.</p>
    </div>
</div>

<Result bind:canvas={canvas} bind:viewIndex={viewIndex} isLoading={isLoading} codeSnippets={codeSnippets} folderPath={$page.url.pathname}/>