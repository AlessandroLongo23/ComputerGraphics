<script>
    import { ChevronLeft, ChevronDown, Menu, Spline, Box, Boxes, Orbit } from 'lucide-svelte';
    import { theme } from "$lib/stores";
    // import { menuItems } from "$lib/data";
    
    let isCollapsed = false;
    
    function toggleSidebar() {
        isCollapsed = !isCollapsed;
    }

    const menuItems = [
        { 
            icon: Spline, 
            label: '2D Basics',
            href: '/1. 2D Basics',
            children: [
                {
                    icon: Spline,
                    label: 'Primitives in WebGL',
                    href: '/1. 2D Basics/1.1. Primitives in WebGL',
                    children: [
                        {
                            icon: Spline,
                            label: 'WebGL environment setup',
                            href: '/1. 2D Basics/1.1. Primitives in WebGL/1.1.1. WebGL environment setup',
                        },
                        {
                            icon: Spline,
                            label: 'Shaders and buffers',
                            href: '/1. 2D Basics/1.1. Primitives in WebGL/1.1.2. Shaders and buffers',
                        },
                        {
                            icon: Spline,
                            label: 'Triangles',
                            href: '/1. 2D Basics/1.1. Primitives in WebGL/1.1.3. Triangles',
                        },
                        {
                            icon: Spline,
                            label: 'Rotating square',
                            href: '/1. 2D Basics/1.1. Primitives in WebGL/1.1.4. Rotating square',
                        },
                        {
                            icon: Spline,
                            label: 'Fan of triangles',
                            href: '/1. 2D Basics/1.1. Primitives in WebGL/1.1.5. Fan of triangles',
                        }
                    ]
                },
                {
                    icon: Spline,
                    label: 'Inputs and interactions',
                    href: '/1. 2D Basics/1.2. Inputs and interactions',
                },
                {
                    icon: Spline,
                    label: 'Model, view and projection',
                    href: '/1. 2D Basics/1.3. Model, view and projection',
                }
            ]
        },
        { 
            icon: Box, 
            label: '3D Rendering', 
            href: '/2. 3D rendering', 
            children: [
                {   
                    icon: Box,
                    label: 'Lighting and shading',
                    href: '/2. 3D rendering/2.1. Lighting and shading',
                }
            ] 
        },
        { icon: Boxes, label: 'Advanced Rendering', href: '/3. Advanced rendering', children: [] },
        { icon: Orbit, label: 'Advanced Techniques', href: '/4. Advanced techniques', children: [] },
    ];
    
    let expandedItems = new Set();
    function toggleExpanded(href) {
        if (expandedItems.has(href)) {
            expandedItems.delete(href);
        } else {
            expandedItems.add(href);
        }
        expandedItems = expandedItems;
    }
</script>

<div class="flex min-h-screen">
    <div class="relative">
        <aside class="z-50 h-screen { $theme == 'light' ? 'bg-gray-100 text-black' : 'bg-gray-800 text-white'} transition-all duration-300 fixed transform {isCollapsed ? '-translate-x-full' : 'translate-x-0'} overflow-y-auto">
            <div class="flex flex-row justify-between items-center p-4 mb-6">
                <a href="/home" class="relative">
                    <img src="/images/favicon-{ $theme }.png" alt="logo" class="w-12 h-12"/>
                </a>

                <button on:click={toggleSidebar} class="p-2 rounded-lg hover:bg-gray-700 transition-colors" aria-label="Collapse sidebar">
                    <ChevronLeft size={20} />
                </button>
            </div>
            
            <nav class="flex flex-col gap-1 pe-4">
                {#each menuItems as item}
                    {@const hasChildren = item.children && item.children.length > 0}
                    <div class="flex flex-col">
                        <div class="flex items-center gap-4 p-2 ms-4 rounded-lg { $theme == 'light' ?  'hover:bg-gray-300' : ' hover:bg-gray-700'} transition-colors">
                            <a href={item.href} class="flex items-center gap-4 flex-1 hover:no-underline { $theme == 'light' ? 'text-black ' : 'text-white '}">
                                <svelte:component this={item.icon} size={20}/>
                                <span class="flex-1">{item.label}</span>
                            </a>

                            {#if hasChildren}
                                <button on:click={() => toggleExpanded(item.href)} class="p-1 rounded hover:bg-gray-500/20">
                                    <ChevronDown size={16} class="transition-transform duration-200 {expandedItems.has(item.href) ? 'rotate-180' : ''}"/>
                                </button>
                            {/if}
                        </div>

                        {#if hasChildren && expandedItems.has(item.href)}
                            <div class="ml-4 border-l-2 { $theme == 'light' ? 'border-gray-300' : 'border-gray-700'} pl-2">
                                {#each item.children as child}
                                    {@const hasGrandchildren = child.children && child.children.length > 0}
                                    <div class="flex flex-col">
                                        <div class="flex items-center gap-4 p-2 ms-4 rounded-lg transition-colors { $theme == 'light' ?  'hover:bg-gray-300' : ' hover:bg-gray-700'}">
                                            <a href={child.href} class="flex items-center gap-4 flex-1 hover:no-underline { $theme == 'light' ? 'text-black ' : 'text-white '}">
                                                <svelte:component this={child.icon} size={20}/>
                                                <span class="flex-1">{child.label}</span>
                                            </a>

                                            {#if hasGrandchildren}
                                                <button on:click={() => toggleExpanded(child.href)} class="p-1 rounded hover:bg-gray-500/20">
                                                    <ChevronDown size={16} class="transition-transform duration-200 {expandedItems.has(child.href) ? 'rotate-180' : ''}"/>
                                                </button>
                                            {/if}
                                        </div>

                                        {#if hasGrandchildren && expandedItems.has(child.href)}
                                            <div class="pl-2 border-l-2 ml-4 {$theme == 'light' ? 'border-gray-300' : 'border-gray-700'}">
                                                {#each child.children as grandchild}
                                                    <a href={grandchild.href} class="flex items-center gap-4 p-2 ms-4 rounded-lg hover:no-underline transition-colors { $theme == 'light' ? 'text-black hover:bg-gray-300' : 'text-white hover:bg-gray-700'}">
                                                        <svelte:component this={grandchild.icon} size={20}/>
                                                        <span class="flex-1">{grandchild.label}</span>
                                                    </a>
                                                {/each}
                                            </div>
                                        {/if}
                                    </div>
                                {/each}
                            </div>
                        {/if}
                    </div>
                {/each}
            </nav>
        </aside>
    </div>

    <div class="flex-1 {isCollapsed ? 'ml-0' : 'ml-96'} transition-all duration-300">
        <button on:click={toggleSidebar} class="fixed top-4 left-4 z-10 p-2 rounded-lg hover:bg-gray-700 transition-colors" aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
            <Menu size={20}/>
        </button>

        <div class="p-4">
            <slot></slot>
        </div>
    </div>
</div>