import * as ls from 'lucide-svelte';

let chapter_icons = [
    ls.Spline,
    ls.Box,
    ls.Boxes,
    ls.Orbit,
    ls.BadgePlus
];

export const content_tree = {
    children: [
        { 
            icon: chapter_icons[0], 
            href: '/1. 2D Basics',
            children: [
                {
                    icon: chapter_icons[0],
                    href: '/1. 2D Basics/1.1. Primitives in WebGL',
                    children: [
                        {
                            icon: chapter_icons[0],
                            href: '/1. 2D Basics/1.1. Primitives in WebGL/1.1.1. WebGL environment setup',
                        },
                        {
                            icon: chapter_icons[0],
                            href: '/1. 2D Basics/1.1. Primitives in WebGL/1.1.2. Shaders and buffers',
                        },
                        {
                            icon: chapter_icons[0],
                            href: '/1. 2D Basics/1.1. Primitives in WebGL/1.1.3. Triangles',
                        },
                        {
                            icon: chapter_icons[0],
                            href: '/1. 2D Basics/1.1. Primitives in WebGL/1.1.4. Rotating square',
                        },
                        {
                            icon: chapter_icons[0],
                            href: '/1. 2D Basics/1.1. Primitives in WebGL/1.1.5. Fan of triangles',
                        }
                    ]
                },
                {
                    icon: chapter_icons[0],
                    href: '/1. 2D Basics/1.2. Inputs and interactions',
                    children: [
                        {
                            icon: chapter_icons[0],
                            href: '/1. 2D Basics/1.2. Inputs and interactions/1.2.1. Add points'
                        },
                        {
                            icon: chapter_icons[0],
                            href: '/1. 2D Basics/1.2. Inputs and interactions/1.2.2. Clear canvas'
                        },
                        {
                            icon: chapter_icons[0],
                            href: '/1. 2D Basics/1.2. Inputs and interactions/1.2.3. Triangles drawing mode'
                        },
                        {
                            icon: chapter_icons[0],
                            href: '/1. 2D Basics/1.2. Inputs and interactions/1.2.4. Circles drawing mode'
                        }
                    ]
                },
                {
                    icon: chapter_icons[0],
                    href: '/1. 2D Basics/1.3. Model, view and projections',
                    children: [
                        {
                            icon: chapter_icons[0],
                            href: '/1. 2D Basics/1.3. Model, view and projections/1.3.1. Wireframe cube'
                        },
                        {
                            icon: chapter_icons[0],
                            href: '/1. 2D Basics/1.3. Model, view and projections/1.3.2. Perspective views'
                        },
                    ]
                }
            ]
        },
        { 
            icon: chapter_icons[1], 
            href: '/2. 3D Rendering', 
            children: [
                {   
                    icon: chapter_icons[1],
                    href: '/2. 3D Rendering/2.1. Lighting and shading',
                    children: [
                        {
                            icon: chapter_icons[1],
                            href: '/2. 3D Rendering/2.1. Lighting and shading/2.1.1. Sphere via recursion'
                        },
                        {
                            icon: chapter_icons[1],
                            href: '/2. 3D Rendering/2.1. Lighting and shading/2.1.2. Face culling'
                        },
                        {
                            icon: chapter_icons[1],
                            href: '/2. 3D Rendering/2.1. Lighting and shading/2.1.3. Gouraud shading'
                        },
                        {
                            icon: chapter_icons[1],
                            href: '/2. 3D Rendering/2.1. Lighting and shading/2.1.4. Phong shading'
                        },
                        {
                            icon: chapter_icons[1],
                            href: '/2. 3D Rendering/2.1. Lighting and shading/2.1.5. Phong reflection model'
                        },
                        {
                            icon: chapter_icons[1],
                            href: '/2. 3D Rendering/2.1. Lighting and shading/2.1.6. Considerations'
                        },
                    ]
                },
                {
                    icon: chapter_icons[1],
                    href: '/2. 3D Rendering/2.2. Loading external models',
                }
            ] 
        },
        { 
            icon: chapter_icons[2], 
            href: '/3. Advanced rendering' 
        },
        { 
            icon: chapter_icons[3], 
            href: '/4. Advanced techniques', 
        },
        {
            icon: chapter_icons[4],
            href: '/E. Extras',
        }
    ]
};

export const content_sequence = getAllNodes(content_tree);

function getAllNodes(node) {
    const nodes = [node];
    if (node.children)
        for (let child of node.children)
            nodes.push(...getAllNodes(child));
    
    return nodes;
}

export function getChildren(url) {
    if (url == '/home')
        return content_tree.children.map(child => child.href.split("/").pop());
    
    url = url.replaceAll('%20', ' ');

    function findByUrl(node, url) {
        if (node.href === url)
            return node;

        if (!node.children)
            return null;

        for (let child of node.children) {
            const result = findByUrl(child, url);
            if (result)
                return result;
        }

        return null;
    }

    const node = findByUrl(content_tree, url);

    if (node)
        return node.children.map(child => child.href.split("/").pop());
    else
        return [];
}