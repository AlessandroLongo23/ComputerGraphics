const menuItems = [
    { 
        icon: 'Tangent', 
        label: '2D Basics',
        href: '/1. 2D Basics',
        children: [
            {
                icon: 'Tangent',
                label: 'Primitives in WebGL',
                href: '/1. 2D Basics/1.1. Primitives in WebGL',
                children: [
                    {
                        icon: 'Tangent',
                        label: 'WebGL environment setup',
                        href: '/1. 2D Basics/1.1. Primitives in WebGL/1.1.1. WebGL environment setup',
                    },
                    {
                        icon: 'Tangent',
                        label: 'Shaders and buffers',
                        href: '/1. 2D Basics/1.1. Primitives in WebGL/1.1.2. Shaders and buffers',
                    },
                    {
                        icon: 'Tangent',
                        label: 'Triangles',
                        href: '/1. 2D Basics/1.1. Primitives in WebGL/1.1.3. Triangles',
                    },
                    {
                        icon: 'Tangent',
                        label: 'Rotating square',
                        href: '/1. 2D Basics/1.1. Primitives in WebGL/1.1.4. Rotating square',
                    },
                    {
                        icon: 'Tangent',
                        label: 'Fan of triangles',
                        href: '/1. 2D Basics/1.1. Primitives in WebGL/1.1.5. Fan of triangles',
                    }
                ]
            },
            {
                icon: 'Tangent',
                label: 'Inputs and interactions',
                href: '/1. 2D Basics/1.2. Inputs and interactions',
            },
            {
                icon: 'Tangent',
                label: 'Model, view and projection',
                href: '/1. 2D Basics/1.3. Model, view and projection',
            }
        ]
    },
    { 
        icon: 'Box', 
        label: '3D Rendering', 
        href: '/2. 3D Rendering', 
        children: [
            {   
                icon: 'Box',
                label: 'Lighting and shading',
                href: '/2. 3D Rendering/2.1. Lighting and shading',
            }
        ] 
    },
    { icon: 'Grid2x2', label: 'Advanced Rendering', href: '/3. Advanced rendering', children: [] },
    { icon: 'Rotate3D', label: 'Advanced Techniques', href: '/4. Advanced techniques', children: [] },
];

export { menuItems };