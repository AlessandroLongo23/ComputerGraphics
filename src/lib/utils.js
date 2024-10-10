const WebGLUtils = function() {
    var setupWebGL = function(canvas, opt_attribs) {
        if (typeof window === 'undefined') return null;

        function showLink(str) {
            var container = canvas.parentNode;
            if (container) {
                container.innerHTML = makeFailHTML(str);
            }
        };

        if (!window.WebGLRenderingContext) {
            showLink(GET_A_WEBGL_BROWSER);
            return null;
        }

        var context = create3DContext(canvas, opt_attribs);
        if (!context) {
            showLink(OTHER_PROBLEM);
        }
        return context;
    };

    var create3DContext = function(canvas, opt_attribs) {
        if (typeof window === 'undefined') return null;

        var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
        var context = null;
        for (var ii = 0; ii < names.length; ++ii) {
            try {
                context = canvas.getContext(names[ii], opt_attribs);
            } catch(e) {}
            if (context) {
                break;
            }
        }
        return context;
    };

    return {
        create3DContext: create3DContext,
        setupWebGL: setupWebGL
    };
}();

if (typeof window !== 'undefined') {
    window.requestAnimFrame = (function() {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function(callback, _) {
                window.setTimeout(callback, 1000 / 60);
            };
    })();
}

async function fetchCodeSnippets(code_snippets_url) {
    try {
        let code_snippets_info = [
            {
                name: 'main.js',
                language: 'JavaScript',
                path: code_snippets_url + '/main.js'
            },
            {
                name: 'index.html',
                language: 'HTML',
                path: code_snippets_url + '/index.html'
            },
            {
                name: 'vshader.glsl',
                language: 'GLSL',
                path: code_snippets_url + '/vshader.glsl'
            },
            {
                name: 'fshader.glsl',
                language: 'GLSL',
                path: code_snippets_url + '/fshader.glsl'
            }
        ];

        let code_snippets = [];
        for (let info of code_snippets_info) {
            const response = await fetch(info.path); 
            if (!response.ok)
                throw new Error('Network response was not ok');
            
            const code = await response.text();

            code_snippets = [...code_snippets, {
                name: info.name,
                language: info.language,
                code: code
            }];
        }

        return code_snippets;
    } catch (error) {
        console.error('Error fetching the JavaScript file:', error);
    }
}

async function fetchShader(url) {
    const response = await fetch(url);
    if (!response.ok)
        throw new Error(`Failed to fetch shader: ${url}`);

    return await response.text();
}

async function initShaders(gl, program, vertex_shader_url, fragment_shader_url) {
    let vertex_shader_source = await fetchShader(vertex_shader_url);
    let fragment_shader_source = await fetchShader(fragment_shader_url);

    const vertex_shader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertex_shader, vertex_shader_source);
    gl.compileShader(vertex_shader);

    const fragment_shader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragment_shader, fragment_shader_source);
    gl.compileShader(fragment_shader);

    program = gl.createProgram();
    gl.attachShader(program, vertex_shader);
    gl.attachShader(program, fragment_shader);
    gl.linkProgram(program);
    gl.useProgram(program);

    return [gl, program];
}

export { WebGLUtils, fetchCodeSnippets, initShaders };
