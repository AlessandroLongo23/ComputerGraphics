import {Spline, Box, Boxes, Orbit } from 'lucide-svelte';

const content_tree = {
    children: [
        { 
            icon: Spline, 
            label: '1. 2D Basics',
            href: '/1. 2D Basics',
            children: [
                {
                    icon: Spline,
                    label: '1.1. Primitives in WebGL',
                    href: '/1. 2D Basics/1.1. Primitives in WebGL',
                    children: [
                        {
                            icon: Spline,
                            label: '1.1.1. WebGL environment setup',
                            href: '/1. 2D Basics/1.1. Primitives in WebGL/1.1.1. WebGL environment setup',
                        },
                        {
                            icon: Spline,
                            label: '1.1.2. Shaders and buffers',
                            href: '/1. 2D Basics/1.1. Primitives in WebGL/1.1.2. Shaders and buffers',
                        },
                        {
                            icon: Spline,
                            label: '1.1.3. Triangles',
                            href: '/1. 2D Basics/1.1. Primitives in WebGL/1.1.3. Triangles',
                        },
                        {
                            icon: Spline,
                            label: '1.1.4. Rotating square',
                            href: '/1. 2D Basics/1.1. Primitives in WebGL/1.1.4. Rotating square',
                        },
                        {
                            icon: Spline,
                            label: '1.1.5. Fan of triangles',
                            href: '/1. 2D Basics/1.1. Primitives in WebGL/1.1.5. Fan of triangles',
                        }
                    ]
                },
                {
                    icon: Spline,
                    label: '1.2. Inputs and interactions',
                    href: '/1. 2D Basics/1.2. Inputs and interactions',
                    children: [
                        {
                            icon: Spline,
                            label: '1.2.1. Add points',
                            href: '/1. 2D Basics/1.2. Inputs and interactions/1.2.1. Add points'
                        },
                        {
                            icon: Spline,
                            label: '1.2.2. Clear canvas',
                            href: '/1. 2D Basics/1.2. Inputs and interactions/1.2.2. Clear canvas'
                        },
                        {
                            icon: Spline,
                            label: '1.2.3. Triangles drawing mode',
                            href: '/1. 2D Basics/1.2. Inputs and interactions/1.2.3. Triangles drawing mode'
                        },
                        {
                            icon: Spline,
                            label: '1.2.4. Circles drawing mode',
                            href: '/1. 2D Basics/1.2. Inputs and interactions/1.2.4. Circles drawing mode'
                        }
                    ]
                },
                {
                    icon: Spline,
                    label: '1.3. Model, view and projections',
                    href: '/1. 2D Basics/1.3. Model, view and projections',
                    children: [
                        {
                            icon: Spline,
                            label: '1.3.1. Exercise 1',
                            href: '/1. 2D Basics/1.3. Model, view and projections/1.3.1. Exercise 1'
                        },
                        {
                            icon: Spline,
                            label: '1.3.2. Exercise 2',
                            href: '/1. 2D Basics/1.3. Model, view and projections/1.3.2. Exercise 2'
                        },
                    ]
                }
            ]
        },
        { 
            icon: Box, 
            label: '2. 3D Rendering', 
            href: '/2. 3D Rendering', 
            children: [
                {   
                    icon: Box,
                    label: '2.1. Lighting and shading',
                    href: '/2. 3D Rendering/2.1. Lighting and shading',
                    children: [
                        {
                            icon: Box,
                            label: '2.1.1. Exercise 1',
                            href: '/2. 3D Rendering/2.1. Lighting and shading/2.1.1. Exercise 1'
                        },
                        {
                            icon: Box,
                            label: '2.1.2. Exercise 2',
                            href: '/2. 3D Rendering/2.1. Lighting and shading/2.1.2. Exercise 2'
                        },
                        {
                            icon: Box,
                            label: '2.1.3. Exercise 3',
                            href: '/2. 3D Rendering/2.1. Lighting and shading/2.1.3. Exercise 3'
                        },
                        {
                            icon: Box,
                            label: '2.1.4. Exercise 4',
                            href: '/2. 3D Rendering/2.1. Lighting and shading/2.1.4. Exercise 4'
                        },
                    ]
                }
            ] 
        },
        { 
            icon: Boxes, 
            label: '3. Advanced rendering', 
            href: '/3. Advanced rendering' 
        },
        { 
            icon: Orbit, 
            label: '4. Advanced techniques', 
            href: '/4. Advanced techniques', 
        }
    ]
};

function dfs(node, callback) {
    callback(node);
    if (node.children) {
        for (let child of node.children) {
            dfs(child, callback);
        }
    }
}

const content_sequence = getAllNodes(content_tree);

function getAllNodes(node) {
    const nodes = [node];
    if (node.children) {
        for (let child of node.children) {
            nodes.push(...getAllNodes(child));
        }
    }
    return nodes;
}

export { content_tree, content_sequence };