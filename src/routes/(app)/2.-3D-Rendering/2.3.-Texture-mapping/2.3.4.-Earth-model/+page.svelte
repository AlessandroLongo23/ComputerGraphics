<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores'
    import { WebGLUtils, fetchCodeSnippets, initShaders } from '$lib/utils.svelte.js';
    import * as mv from '$lib/Libraries/MV.js';
    import Result from '$lib/components/Result.svelte';
    // import Admonition from '$lib/components/UI/Admonition.svelte';

    let viewIndex = $state(1);
    let isLoading = $state(true);
    let canvas = $state(), gl, program;
    let codeSnippets = $state([]);


    let vertices, v0, v1, v2, v3;
    let normals;
    let viewMatrixLoc, modelMatrixLoc, projectionMatrixLoc;
    let textures;
    let isDragging;
    let subdivisions, mousePrev, lightAngle;
    let vBuffer, nBuffer;
    let dist = 3.0;
    let cameraPos = {
        x: dist,
        y: 0
    }

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

                // enabling depth test and culling
                gl.enable(gl.DEPTH_TEST);
                gl.enable(gl.CULL_FACE);
                gl.cullFace(gl.FRONT);

                // Set the light direction
                var lightDirection = mv.vec3(0.0, 0.0, 1.0);
                var lightDirectionLoc = gl.getUniformLocation(program, "lightDirection");
                gl.uniform3fv(lightDirectionLoc, mv.flatten(lightDirection));

                // Uniform locations for the matrices
                viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix");
                modelMatrixLoc = gl.getUniformLocation(program, "modelMatrix");
                projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

                // vertices
                vertices = [];
                v0 = mv.vec4(0.0, 0.0, -1.0, 1); 
                v1 = mv.vec4(0.0, 0.942809, 0.333333, 1);
                v2 = mv.vec4(-0.816497, -0.471405, 0.333333, 1);
                v3 = mv.vec4(0.816497, -0.471405, 0.333333, 1);

                // normals
                normals = [];
                textures = [
                    "/textures/earth/base.jpg", 
                    "/textures/earth/night.jpg", 
                    "/textures/earth/clouds.jpg", 
                    "/textures/earth/height.jpg",
                    "/textures/moon/base.jpg",
                    "/textures/moon/height.jpg",
                    "/textures/moon/normal.jpg",
                    "/textures/space.jpg"
                ];

                loadImages(textures, function(images) {
                    var textures = [];
                    images.forEach((image, index) => {
                        const texture = gl.createTexture();
                        gl.activeTexture(gl[`TEXTURE${index}`]);
                        gl.bindTexture(gl.TEXTURE_2D, texture);
                        
                        // Set texture parameters
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                
                        // Upload the texture image and generate mipmaps
                        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
                        gl.generateMipmap(gl.TEXTURE_2D);  // Generate mipmaps for the texture
                
                        textures.push(texture);
                    });
                
                    // Set texture samplers
                    gl.uniform1i(gl.getUniformLocation(program, "earthTexMap"), 0);
                    gl.uniform1i(gl.getUniformLocation(program, "nightTexMap"), 1);
                    gl.uniform1i(gl.getUniformLocation(program, "cloudTexMap"), 2);
                    gl.uniform1i(gl.getUniformLocation(program, "heightTexMap"), 3);
                    gl.uniform1i(gl.getUniformLocation(program, "moonTexMap"), 4);
                    gl.uniform1i(gl.getUniformLocation(program, "moonHeightTexMap"), 5);
                    gl.uniform1i(gl.getUniformLocation(program, "moonNormalTexMap"), 6);
                    gl.uniform1i(gl.getUniformLocation(program, "spaceTexMap"), 7);
                
                    // Initialize model and render after setting up textures
                    subdivisions = 9;
                    lightAngle = 0;
                
                    buildPolyhedron();
                    render();

                    dist = 3.0;
                    cameraPos = {
                        x: dist,
                        y: 0
                    }
                    isDragging = false;
                    mousePrev = {
                        x: 0,
                        y: 0,
                    }
                });
            } catch (error) {
                console.error(error);
            }

            codeSnippets = await fetchCodeSnippets($page.url.pathname);
            isLoading = false;

            window.addEventListener("mousedown", mouseDown, false);
            window.addEventListener("mousemove", mouseMove, false);
            window.addEventListener("mouseup", mouseUp, false);
            window.addEventListener("mousewheel", mouseWheel, false);
            // window.addEventListener("resize", resize, false);
        }
    });

    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        lightAngle += 0.005;

        // Set the light direction
        var lightDirection = mv.vec3(Math.cos(lightAngle), 0.0, Math.sin(lightAngle));
        var lightDirectionLoc = gl.getUniformLocation(program, "lightDirection");
        gl.uniform3fv(lightDirectionLoc, mv.flatten(lightDirection));

        // projection matrix
        var projectionMatrix = mv.perspective(45, canvas.width / canvas.height, 0.1, 100.0);

        // view matrix
        var eye = mv.vec3(
            dist * Math.cos(cameraPos.x) * Math.cos(cameraPos.y), 
            dist * Math.sin(cameraPos.y), 
            dist * Math.sin(cameraPos.x) * Math.cos(cameraPos.y)
        );
        var target = mv.vec3(0.0, 0.0, 0.0);
        var up = mv.vec3(0.0, 1.0, 0.0);
        var viewMatrix = mv.lookAt(eye, target, up);

        // model matrix
        var modelMatrix = mv.mat4();

        // Pass matrices to the shader
        gl.uniformMatrix4fv(projectionMatrixLoc, false, mv.flatten(projectionMatrix));
        gl.uniformMatrix4fv(viewMatrixLoc, false, mv.flatten(viewMatrix));
        gl.uniformMatrix4fv(modelMatrixLoc, false, mv.flatten(modelMatrix));

        // draw the model using triangles
        gl.drawArrays(gl.TRIANGLES, 0, vertices.length);
        
        // call the next frame
        requestAnimFrame(render);
    }

    function loadImages(urls, callback) {
        var images = [];
        var imagesToLoad = urls.length;

        function onImageLoad() {
            imagesToLoad--;
            imagesToLoad === 0 && callback(images);
        }

        for (let i = 0; i < urls.length; ++i) {
            images[i] = new Image();
            images[i].src = urls[i];
            images[i].onload = onImageLoad;
        }
    }

    function mouseDown(event) {
        isDragging = true;
        mousePrev.x = event.clientX;
        mousePrev.y = event.clientY;
    }

    function mouseMove(event) {
        if (!isDragging) 
            return;
        
        cameraPos.x += (event.clientX - mousePrev.x) / 100 / Math.PI;
        cameraPos.y += (event.clientY - mousePrev.y) / 100 / Math.PI;
        cameraPos.y = Math.max(-Math.PI / 2, Math.min(cameraPos.y, Math.PI / 2))

        mousePrev.x = event.clientX;
        mousePrev.y = event.clientY;
    }

    function mouseUp() {
        isDragging = false;
    }

    function mouseWheel(event) {
        dist += event.deltaY / 1000;
        dist = Math.min(5.0, Math.max(dist, 1.25));
    }

    // function resize() {
    //     canvas.width = window.innerWidth;
    //     canvas.height = window.innerHeight;
    //     gl.viewport(0, 0, canvas.width, canvas.height);
    // }

    function buildPolyhedron() {
        vertices = [];
        normals = [];
        tetrahedron(v0, v1, v2, v3, subdivisions);

        // vertices
        vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, mv.flatten(vertices), gl.STATIC_DRAW);
        var vPosition = gl.getAttribLocation(program, "vPosition");
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);

        // normals
        nBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, mv.flatten(normals), gl.STATIC_DRAW);
        var vNormal = gl.getAttribLocation(program, "vNormal");
        gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vNormal);
    }

    function tetrahedron(a, b, c, d, n) {
        divideTriangle(a, b, c, n);
        divideTriangle(d, c, b, n);
        divideTriangle(a, d, b, n);
        divideTriangle(a, c, d, n);
    }

    function divideTriangle(a, b, c, count) {
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

    function triangle(a, b, c) {
        vertices.push(a);
        normals.push(a);
        vertices.push(b);
        normals.push(b);
        vertices.push(c);
        normals.push(c);
    }
</script>

<div class="flex flex-col justify-center items-start w-4/5 text-xl m-auto">
    <div class="w-4/5 m-auto">
    </div>

    <Result bind:canvas={canvas} bind:viewIndex={viewIndex} isLoading={isLoading} codeSnippets={codeSnippets}/>
</div>

