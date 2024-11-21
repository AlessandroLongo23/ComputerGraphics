<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores'
    import { WebGLUtils, fetchCodeSnippets, initShaders, convertToLatex } from '$lib/utils.svelte.js';
    import { Quaternion } from '$lib/Libraries/Quaternion.js';
    import * as mv from '$lib/Libraries/MV.js';
    import Result from '$lib/components/Result.svelte';
    import Admonition from '$lib/components/UI/Admonition.svelte';

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
    let mouseVector, prevMouseVector, isLeftButtonDown, isRightButtonDown;
    let subdivisions;
    let normals, nBuffer;
    let cameraState;

    onMount(async () => {
        if (typeof window !== 'undefined') {
            gl = WebGLUtils.setupWebGL(canvas);

            gl.enable(gl.DEPTH_TEST);
            gl.enable(gl.CULL_FACE);
            gl.cullFace(gl.FRONT);

            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);

            [gl, program] = await initShaders(gl, program, $page.url.pathname + '/vshader.glsl', $page.url.pathname + '/fshader.glsl');

            initLight();
            initMatrices();
            initVertices();
            initTexture();
            initEventHandlers(document.getElementById("gl-canvas"));

            subdivisions = 6;
            buildPolyhedron();

            cameraState = {
                distance: 4.0,    
                panOffset: mv.vec3(),
                qRotation: new Quaternion(),
                qIncrease: new Quaternion(),
                qPrevIncrease: new Quaternion(),
                spinActive: false,
                lastMouseMoveTime: 0
            };

            render();

            convertToLatex();
            codeSnippets = await fetchCodeSnippets($page.url.pathname);
            isLoading = false;
        }
    });

    const initLight = () => {
        var lightDirection = mv.vec3(0.0, 0.0, 1.0);
        var lightDirectionLoc = gl.getUniformLocation(program, "lightDirection");
        gl.uniform3fv(lightDirectionLoc, mv.flatten(lightDirection));
    }

    const initMatrices = () => {
        projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
        projectionMatrix = mv.perspective(45, canvas.width / canvas.height, 0.1, 100.0);
        gl.uniformMatrix4fv(projectionMatrixLoc, false, mv.flatten(projectionMatrix));

        viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix");
        dist = 4.0;
        eye = mv.vec3(0.0, 0.0, dist);
        at = mv.vec3(0.0, 0.0, 0.0);
        up = mv.vec3(0.0, 1.0, 0.0);
        viewMatrix = mv.lookAt(eye, at, up);
        gl.uniformMatrix4fv(viewMatrixLoc, false, mv.flatten(viewMatrix));

        modelMatrix = mv.mat4();
        modelMatrixLoc = gl.getUniformLocation(program, "modelMatrix");
        gl.uniformMatrix4fv(modelMatrixLoc, false, mv.flatten(modelMatrix));
    }

    const initVertices = () => {
        baseVertices = [
            mv.vec4(0.0, 0.0, -1.0, 1),
            mv.vec4(0.0, 0.942809, 0.333333, 1),
            mv.vec4(-0.816497, -0.471405, 0.333333, 1),
            mv.vec4(0.816497, -0.471405, 0.333333, 1),
        ]
    }

    const initTexture = () => {
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

    const buildPolyhedron = () => {
        vertices = [];
        normals = [];
        tetrahedron(baseVertices[0], baseVertices[1], baseVertices[2], baseVertices[3], subdivisions);

        vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, mv.flatten(vertices), gl.STATIC_DRAW);
        var vPosition = gl.getAttribLocation(program, "vPosition");
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);

        nBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, mv.flatten(normals), gl.STATIC_DRAW);
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

        var ab = mv.normalize(mv.mix(a, b, 0.5), true);
        var ac = mv.normalize(mv.mix(a, c, 0.5), true);
        var bc = mv.normalize(mv.mix(b, c, 0.5), true);

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

    const render = () => {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        if (performance.now() - cameraState.lastMouseMoveTime > 20)
            cameraState.spinActive = false;

        if (cameraState.spinActive || isLeftButtonDown) 
            cameraState.qRotation = cameraState.qRotation.multiply(cameraState.qIncrease);

        let rotatedEye = cameraState.qRotation.apply(mv.vec3(0.0, 0.0, cameraState.distance));
    
        let eye = add(rotatedEye, cameraState.panOffset);
        let at = add(mv.vec3(0.0, 0.0, 0.0), cameraState.panOffset);
        let up = cameraState.qRotation.apply(mv.vec3(0.0, 1.0, 0.0));

        viewMatrix = mv.lookAt(eye, at, up);
        gl.uniformMatrix4fv(viewMatrixLoc, false, mv.flatten(viewMatrix));

        gl.drawArrays(gl.TRIANGLES, 0, vertices.length);
        
        requestAnimFrame(render);
    }

    const initEventHandlers = (canvas) => {
        mouseVector = mv.vec3();
        prevMouseVector = null;
        isLeftButtonDown = false;

        canvas.addEventListener('mousedown', (event) => {
            event.preventDefault();

            if (event.button == 0) {
                isLeftButtonDown = true;

                cameraState.spinActive = false;
                cameraState.qIncrease = new Quaternion();
            } else if (event.button === 2) {
                isRightButtonDown = true;
            }

            prevMouseVector = mapMousePosition(event);
        });

        canvas.addEventListener('mouseup', (event) => {
            event.preventDefault();
        
            if (event.button === 0) {
                isLeftButtonDown = false;
                
                let currentMouseVector = mapMousePosition(event);
                
                if (vectorEqual(currentMouseVector, prevMouseVector)) {
                    cameraState.spinActive = true;
                    cameraState.qIncrease = cameraState.qPrevIncrease;
                } else {
                    cameraState.spinActive = false;
                    cameraState.qIncrease = new Quaternion();
                }
            } else if (event.button === 2) {
                isRightButtonDown = false;
            }
            
            prevMouseVector = null;
        });

        canvas.addEventListener('mousemove', (event) => {
            if (!prevMouseVector)
                return;

            cameraState.lastMouseMoveTime = performance.now();
            
            let currentMouseVector = mapMousePosition(event);
            if (isLeftButtonDown)
                handleOrbit(prevMouseVector, currentMouseVector);
            else if (isRightButtonDown)
                handlePan(prevMouseVector, currentMouseVector);

            prevMouseVector = currentMouseVector;
        });

        canvas.addEventListener('wheel', (event) => {
            event.preventDefault();
            
            const ZOOM_SPEED = 0.01;
            
            cameraState.distance += event.deltaY * ZOOM_SPEED;
            cameraState.distance = Math.max(3.0, Math.min(10.0, cameraState.distance));
        });
    }

    function handleOrbit(prevVector, currVector) {
        cameraState.qIncrease = new Quaternion().make_rot_vec2vec(prevVector, currVector);
        cameraState.qRotation = cameraState.qRotation.multiply(cameraState.qIncrease);
        cameraState.qPrevIncrease = cameraState.qIncrease;
    }

    function handlePan(prevVector, currVector) {
        let delta = vec2(currVector[0] - prevVector[0], currVector[1] - prevVector[1]);
        
        const PAN_SPEED = 3.0;
        
        cameraState.panOffset[0] += delta[0] * PAN_SPEED;
        cameraState.panOffset[1] += delta[1] * PAN_SPEED;
    }

    const mapMousePosition = (event) => {
        let rect = event.target.getBoundingClientRect();
        let mouseX = event.clientX - rect.left;
        let mouseY = event.clientY - rect.top;
        let mouseVirtualX = map(mouseX, 0, canvas.width, 1, -1);
        let mouseVirtualY = map(mouseY, 0, canvas.height, -1, 1);

        let d = Math.sqrt(mouseVirtualX * mouseVirtualX + mouseVirtualY * mouseVirtualY);
        let mouseVirtualZ;
        if (d <= 1 / Math.sqrt(2))
            mouseVirtualZ = Math.sqrt(1 - d * d);
        else
            mouseVirtualZ = 1 / (2 * d);
        
        let v = mv.vec3(mouseVirtualX, mouseVirtualY, mouseVirtualZ);
        v = mv.normalize(v);

        return v;
    }

    function vectorEqual(v1, v2, epsilon = 0.001) {
        return (
            Math.abs(v1[0] - v2[0]) < epsilon &&
            Math.abs(v1[1] - v2[1]) < epsilon &&
            Math.abs(v1[2] - v2[2]) < epsilon
        );
    }

    function add(v1, v2) {
        return mv.vec3(
            v1[0] + v2[0], 
            v1[1] + v2[1], 
            v1[2] + v2[2]
        );
    }

    const map = (x, inMin = 0, inMax = 1, outMin = 0, outMax = 1) => {
        return (x - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    };
</script>

<div class="flex flex-col justify-center items-start w-4/5 text-xl m-auto mb-16">
    <div class="w-4/5 m-auto">
        <p>To do spinning, continue to update the quaternion rotation of the view using another quaternion representing the last incremental rotation recorded in the mousemove function.</p>
        <p>Stop the spinning by resetting the incremental rotation to an identity quaternion when the mouse is released at the same position as the one last recorded in the mousemove function or if more than 20 milliseconds passed since the last mouse move event.</p>
    </div>

    <Result bind:canvas={canvas} bind:viewIndex={viewIndex} isLoading={isLoading} codeSnippets={codeSnippets} folderPath={$page.url.pathname}/>
</div>