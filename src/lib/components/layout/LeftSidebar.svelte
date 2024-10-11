<script>
    import { ChevronDown, Menu, GripVertical, X } from 'lucide-svelte';
    import { theme } from "$lib/stores";
    import { page } from '$app/stores';
    import { content_tree } from '$lib/data/pages';
    
    let isCollapsed = true;
    let sidebarWidth = 350;
    let isDragging = false;
    
    function toggleSidebar() {
        isCollapsed = !isCollapsed;
    }

    function startResize() {
        isDragging = true;
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', stopResize);
    }

    function handleMouseMove(event) {
        if (isDragging)
            sidebarWidth = Math.max(280, Math.min(400, event.clientX));
    }

    function stopResize() {
        isDragging = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', stopResize);
    }

    function isRouteActive(href) {
        return $page.url.pathname === href;
    }

    function isParentRouteActive(item) {
        if (isRouteActive(item.href)) 
            return true;
        
        if (item.children) {
            return item.children.some(child => {
                if (isRouteActive(child.href)) return true;
                if (child.children)
                    return child.children.some(grandchild => isRouteActive(grandchild.href));

                return false;
            });
        }
        return false;
    }

    let expandedItems = new Set();

    $: if ($page) {
        content_tree.children.forEach(item => {
            if (isParentRouteActive(item)) {
                expandedItems.add(item.href);
                if (item.children) {
                    item.children.forEach(child => {
                        if (isParentRouteActive(child))
                            expandedItems.add(child.href);
                    });
                }
            }
        });
    }

    function toggleExpanded(href) {
        if (expandedItems.has(href))
            expandedItems.delete(href);
        else
            expandedItems.add(href);

        expandedItems = expandedItems;
    }
</script>

<div class="flex min-h-screen">
    {#if !isCollapsed}
        <div on:click={toggleSidebar} aria-hidden="true" class="fixed inset-0 bg-black/50 z-40 transition-all duration-300 ease-in-out opacity-0 {!isCollapsed ? 'opacity-100' : ''}"/>
    {/if}

    <div class="relative">
        <aside class="z-50 h-screen flex flex-col justify-between { $theme == 'light' ? 'bg-gray-100 text-black' : 'bg-gray-800 text-white'} transition-transform duration-300 fixed transform {isCollapsed ? '-translate-x-full' : 'translate-x-0'} overflow-y-auto" style="width: {sidebarWidth}px">
            <div>
                <div class="flex flex-row justify-between items-center p-6 mb-6">
                    <a href="/home" class="relative w-12 h-12 me-4">
                        <img src="/images/favicon-{ $theme }.png" alt="logo"/>
                    </a>
                    
                    <div class="flex items-center">
                        <button on:click={toggleSidebar} class="p-2 rounded-lg { $theme == 'light' ? 'hover:bg-gray-300' : 'hover:bg-gray-700' } transition-colors" aria-label="Collapse sidebar">
                            <X size={18}/>
                        </button>
                    </div>
                </div>
                
                <nav class="flex flex-col gap-1 pe-4">
                    {#each content_tree.children as item}
                        {@const hasChildren = item.children && item.children.length > 0}
                        <div class="flex flex-col">
                            <div class="flex items-center gap-4 p-2 ms-4 rounded-lg { $theme == 'light' ? 
                                isRouteActive(item.href) ? 'bg-gray-300' : 'hover:bg-gray-300' : 
                                isRouteActive(item.href) ? 'bg-gray-700' : 'hover:bg-gray-700'} transition-colors">
                                <a href={item.href} class="flex items-center gap-4 flex-1 hover:no-underline { $theme == 'light' ? 'text-black' : 'text-white'}
                                {isRouteActive(item.href) ? 'font-semibold' : ''}">
                                    <svelte:component this={item.icon} size={18}/>
                                    <span class="flex-1 truncate">{item.href.split("/").pop()}</span>
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
                                            <div class="flex items-center gap-4 p-2 ms-4 rounded-lg transition-colors { $theme == 'light' ? 
                                                isRouteActive(child.href) ? 'bg-gray-300' : 'hover:bg-gray-300' : 
                                                isRouteActive(child.href) ? 'bg-gray-700' : 'hover:bg-gray-700'}">
                                                <a href={child.href} class="flex items-center gap-4 flex-1 hover:no-underline { $theme == 'light' ? 'text-black' : 'text-white'}
                                                {isRouteActive(child.href) ? 'font-semibold' : ''}">
                                                    <svelte:component this={child.icon} size={18}/>
                                                    <span class="flex-1 truncate">{child.href.split("/").pop()}</span>
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
                                                        <a href={grandchild.href} 
                                                        class="flex items-center gap-4 p-2 ms-4 rounded-lg hover:no-underline transition-colors 
                                                                { $theme == 'light' ? 
                                                                    isRouteActive(grandchild.href) ? 'bg-gray-300 font-semibold' : 'hover:bg-gray-300' : 
                                                                    isRouteActive(grandchild.href) ? 'bg-gray-700 font-semibold' : 'hover:bg-gray-700'}
                                                                { $theme == 'light' ? 'text-black' : 'text-white'}">
                                                            <svelte:component this={grandchild.icon} size={18}/>
                                                            <span class="flex-1 truncate">{grandchild.href.split("/").pop()}</span>
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
            </div>


            <div class="flex flex-row justify-center items-center mb-4">
                <p class="text-xl">Computer</p>
                <img src="/images/favicon-{ $theme }.png" alt="icon" class="w-8 h-8 mx-2">
                <p class="text-xl">Graphics</p>
            </div>

            <div on:mousedown={startResize} class="absolute top-0 right-0 w-4 h-full cursor-col-resize flex items-center justify-center hover:bg-gray-500/20 transition-colors">
                <div class="p-1 rounded-md { $theme == 'light' ? 'text-gray-400' : 'text-gray-500' }">
                    <GripVertical size={16} />
                </div>
            </div>
        </aside>
    </div>

    <div class="flex-1">
        <button on:click={toggleSidebar} class="fixed top-4 left-4 z-10 p-2 rounded-lg { $theme == 'light' ? 'hover:bg-gray-300' : 'hover:bg-gray-700' } transition-colors" aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
            <Menu size={18}/>
        </button>

        <div class="p-4">
            <slot></slot>
        </div>
    </div>

    {#if isDragging}
        <div class="fixed inset-0 z-[100] cursor-col-resize" />
    {/if}
</div>

<style>
    :global(*) {
        user-select: none;
        font-size: 16px;
    }
</style>