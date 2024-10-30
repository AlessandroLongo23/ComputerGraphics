import * as ls from 'lucide-svelte';

let chapterIcons = [
    ls.Spline,
    ls.Box,
    ls.Boxes,
    ls.Orbit,
    ls.BadgePlus
];

export const contentTree = {
    children: [
        { 
            icon: chapterIcons[0], 
            href: '/1.-2D-Basics',
            children: [
                {
                    icon: chapterIcons[0],
                    href: '/1.-2D-Basics/1.1.-Primitives-in-WebGL',
                    children: [
                        {
                            icon: chapterIcons[0],
                            href: '/1.-2D-Basics/1.1.-Primitives-in-WebGL/1.1.1.-WebGL-environment-setup',
                        },
                        {
                            icon: chapterIcons[0],
                            href: '/1.-2D-Basics/1.1.-Primitives-in-WebGL/1.1.2.-Shaders-and-buffers',
                        },
                        {
                            icon: chapterIcons[0],
                            href: '/1.-2D-Basics/1.1.-Primitives-in-WebGL/1.1.3.-Triangles',
                        },
                        {
                            icon: chapterIcons[0],
                            href: '/1.-2D-Basics/1.1.-Primitives-in-WebGL/1.1.4.-Rotating-square',
                        },
                        {
                            icon: chapterIcons[0],
                            href: '/1.-2D-Basics/1.1.-Primitives-in-WebGL/1.1.5.-Fan-of-triangles',
                        }
                    ]
                },
                {
                    icon: chapterIcons[0],
                    href: '/1.-2D-Basics/1.2.-Inputs-and-interactions',
                    children: [
                        {
                            icon: chapterIcons[0],
                            href: '/1.-2D-Basics/1.2.-Inputs-and-interactions/1.2.1.-Add-points'
                        },
                        {
                            icon: chapterIcons[0],
                            href: '/1.-2D-Basics/1.2.-Inputs-and-interactions/1.2.2.-Clear-canvas'
                        },
                        {
                            icon: chapterIcons[0],
                            href: '/1.-2D-Basics/1.2.-Inputs-and-interactions/1.2.3.-Triangles-drawing-mode'
                        },
                        {
                            icon: chapterIcons[0],
                            href: '/1.-2D-Basics/1.2.-Inputs-and-interactions/1.2.4.-Circles-drawing-mode'
                        }
                    ]
                },
                {
                    icon: chapterIcons[0],
                    href: '/1.-2D-Basics/1.3.-Model,-view-and-projections',
                    children: [
                        {
                            icon: chapterIcons[0],
                            href: '/1.-2D-Basics/1.3.-Model,-view-and-projections/1.3.1.-Wireframe-cube'
                        },
                        {
                            icon: chapterIcons[0],
                            href: '/1.-2D-Basics/1.3.-Model,-view-and-projections/1.3.2.-Perspective-views' 
                        },
                    ]
                }
            ]
        },
        { 
            icon: chapterIcons[1], 
            href: '/2.-3D-Rendering', 
            children: [
                {   
                    icon: chapterIcons[1],
                    href: '/2.-3D-Rendering/2.1.-Lighting-and-shading',
                    children: [
                        {
                            icon: chapterIcons[1],
                            href: '/2.-3D-Rendering/2.1.-Lighting-and-shading/2.1.1.-Sphere-via-recursion'
                        },
                        {
                            icon: chapterIcons[1],
                            href: '/2.-3D-Rendering/2.1.-Lighting-and-shading/2.1.2.-Face-culling'
                        },
                        {
                            icon: chapterIcons[1],
                            href: '/2.-3D-Rendering/2.1.-Lighting-and-shading/2.1.3.-Gouraud-shading'
                        },
                        {
                            icon: chapterIcons[1],
                            href: '/2.-3D-Rendering/2.1.-Lighting-and-shading/2.1.4.-Phong-shading'
                        },
                        {
                            icon: chapterIcons[1],
                            href: '/2.-3D-Rendering/2.1.-Lighting-and-shading/2.1.5.-Phong-reflection-model'
                        },
                        {
                            icon: chapterIcons[1],
                            href: '/2.-3D-Rendering/2.1.-Lighting-and-shading/2.1.6.-Considerations'
                        },
                    ]
                },
                {
                    icon: chapterIcons[1],
                    href: '/2.-3D-Rendering/2.2.-Complex-models',
                    children: [
                        {
                            icon: chapterIcons[1],
                            href: '/2.-3D-Rendering/2.2.-Complex-models/2.2.1.-Importing-objects' 
                        },
                        {
                            icon: chapterIcons[1],
                            href: '/2.-3D-Rendering/2.2.-Complex-models/2.2.2.-Phong-on-Suzanne' 
                        }
                    ]
                },
                {
                    icon: chapterIcons[1],
                    href: '/2.-3D-Rendering/2.3.-Texture-mapping',
                    children: [
                        {
                            icon: chapterIcons[1],
                            href: '/2.-3D-Rendering/2.3.-Texture-mapping/2.3.1.-Checkerboard-texture'
                        },
                        {
                            icon: chapterIcons[1],
                            href: '/2.-3D-Rendering/2.3.-Texture-mapping/2.3.2.-Wrapping-and-filtering'
                        },
                        {
                            icon: chapterIcons[1],
                            href: '/2.-3D-Rendering/2.3.-Texture-mapping/2.3.3.-Sphere-texturing'
                        },
                        {
                            icon: chapterIcons[1],
                            href: '/2.-3D-Rendering/2.3.-Texture-mapping/2.3.4.-Earth-model'
                        }
                    ]
                },
                {
                    icon: chapterIcons[2],
                    href: '/2.-3D-Rendering/2.4.-Environment-and-normal-mapping',
                    children: [
                        {
                            icon: chapterIcons[1],
                            href: '/2.-3D-Rendering/2.4.-Environment-and-normal-mapping/2.4.1.-Cube-map'
                        },
                        {
                            icon: chapterIcons[1],
                            href: '/2.-3D-Rendering/2.4.-Environment-and-normal-mapping/2.4.2.-Environment'
                        },
                        {
                            icon: chapterIcons[1],
                            href: '/2.-3D-Rendering/2.4.-Environment-and-normal-mapping/2.4.3.-Reflection'
                        },
                        {
                            icon: chapterIcons[1],
                            href: '/2.-3D-Rendering/2.4.-Environment-and-normal-mapping/2.4.4.-Bump-mapping'
                        }
                    ]
                }
            ] 
        },
        { 
            icon: chapterIcons[2], 
            href: '/3.-Advanced-rendering',
            children: []
        },
        { 
            icon: chapterIcons[3], 
            href: '/4.-Advanced-techniques',  
            children: []
        },
        {
            icon: chapterIcons[4],
            href: '/E.-Extras',
            children: []
        }
    ]
};

export const contentSequence = getAllNodes(contentTree);

function getAllNodes(node) {
    const nodes = [node];
    if (node.children)
        for (let child of node.children)
            nodes.push(...getAllNodes(child));
    
    return nodes;
}

export function getChildren(url) {
    if (url == '/home')
        return contentTree.children.map(child => child.href.split("/").pop());
    
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

    const node = findByUrl(contentTree, url);

    if (node)
        return node.children.map(child => child.href.split("/").pop());
    else
        return [];
}