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
    let texture, textureLoc;
    let subdivisions;
    let thetaY;
    let vBuffer, nBuffer;

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

                // texture
                gl.activeTexture(gl.TEXTURE0);
                texture = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

                textureLoc = gl.getUniformLocation(program, "texMap");
                gl.uniform1i(textureLoc, 0);

                var myTexels = new Image();
                myTexels.onload = function() {
                    gl.bindTexture(gl.TEXTURE_2D, texture);
                    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, myTexels);
                    gl.generateMipmap(gl.TEXTURE_2D);
                }
                myTexels.src = "/textures/earth.jpg";

                subdivisions = 6;
                thetaY = 0;

                buildPolyhedron();
                render();
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
        var dist = 4.0;
        var eye = mv.vec3(dist * Math.cos(thetaY), 0.0, dist * Math.sin(thetaY));
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
        <p>Start from a diffuse sphere illuminated by a directional light (Part 3 of Worksheet 4). We will now map a texture depicting Earth onto the sphere.</p>
        <p>To do this, we load the texture from an image file and calculate the texture coordinates in the fragment shader. Some steps to follow:</p>
        <p>1) When initializing the texture, load the texture image from the file earth.jpg (available on CampusNet). [Angel 7.5.2]</p>
        <p>2) The next step is to pass the normal of the sphere to the fragment shader and use it to calculate the texture coordinates. The normals define points on the unit sphere. The unit sphere is then an intermediate surface to which we can map texture coordinates. Use spherical coordinates to define the relation between a surface normal (a point on the unit sphere) and the texture coordinates (u and v). [Angel 7.4] </p>
        <p>3) Invert the relation you found using inverse trigonometric functions. Use the resulting formula in the fragment shader to calculate texture coordinates from the surface normal. An atan2 function is needed to get the signs right. In GLSL, the atan2 function is simply to use atan(y, x) instead of atan(y/x).</p>  
        <p>4) Use the color found by texture look-up as $k_d$ and $k_a$ of the sphere and illuminate the sphere by a directional source and an ambient source. [Angel 6.3.1, 6.3.2, 7.5.3] </p>
        <p>5) Spin the globe. The earth texture has high resolution leading to minification issues, especially in the mountain ranges during a spin. Choose a filtering option that betters these minification issues without too much blurring of the texture. Explain your choice. [Angel 7.5.4]</p>
    </div>

    <Result bind:canvas={canvas} bind:viewIndex={viewIndex} isLoading={isLoading} codeSnippets={codeSnippets}/>
</div>

