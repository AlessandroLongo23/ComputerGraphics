<script>
    import { ChevronDown, Menu, X, ChevronsUpDown, ChevronsDownUp } from 'lucide-svelte';
    import { themeStore } from "$lib/stores/theme.svelte.js";
    import { page } from '$app/stores';
    import { contentTree } from '$lib/data/pages.svelte.js';
    import { onMount } from 'svelte';
    import { slide } from 'svelte/transition';

    let { children } = $props();
    
    let isSidebarClosed = $state(true);
    let sidebarWidth = 435;
    // let minWidth = 450;
    // let maxWidth = 450;
    let isDragging = $state(false);
    let isCollapsed = $state(false);
    
    const toggleSidebar = () => {
        isSidebarClosed = !isSidebarClosed;
    }

    // const startResize = () => {
    //     isDragging = true;
    //     document.addEventListener('mousemove', handleMouseMove);
    //     document.addEventListener('mouseup', stopResize);
    // }

    // const handleMouseMove = (event) => {
    //     if (isDragging)
    //         sidebarWidth = Math.max(minWidth, Math.min(maxWidth, event.clientX));
    // }

    // const stopResize = () => {
    //     isDragging = false;
    //     document.removeEventListener('mousemove', handleMouseMove);
    //     document.removeEventListener('mouseup', stopResize);
    // }

    let expandedItems = $state([]);

    onMount(() => {
        contentTree.children.forEach(item => {
            if (isParentRouteActive(item)) {
                if (!expandedItems.find(it => it == item.href))
                    expandedItems.push(item.href);

                if (item.children) {
                    item.children.forEach(child => {
                        if (isParentRouteActive(child) && !expandedItems.find(it => it == child.href))
                            expandedItems.push(child.href);
                    });
                }
            }
        });
    });

    const isRouteActive = (href) => {
        return $page.url.pathname === href;
    }

    const isParentRouteActive = (item) => {
        if (isRouteActive(item.href)) 
            return true;
        
        if (item.children) {
            return item.children.some(child => {
                if (isRouteActive(child.href)) 
                    return true;
                
                if (child.children)
                    return child.children.some(grandchild => isRouteActive(grandchild.href));

                return false;
            });
        }
        return false;
    }

    const toggleExpanded = (href) => {
        if (expandedItems.find(it => it == href))
            expandedItems.splice(expandedItems.findIndex(it => it == href), 1);
        else
            expandedItems.push(href);
    }

    const collapseAll = () => {
        expandedItems = [];
        isCollapsed = true;
    }

    const expandAll = () => {
        const getAllHrefs = (items) => {
            let hrefs = [];
            items.forEach(item => {
                hrefs.push(item.href);
                if (item.children) {
                    hrefs = hrefs.concat(getAllHrefs(item.children));
                }
            });
            return hrefs;
        };

        expandedItems = getAllHrefs(contentTree.children);
        isCollapsed = false;
    }

    const toggleCollapsed = () => {
        if (isCollapsed)
            expandAll();
        else
            collapseAll();
    }
</script>

<div class="flex min-h-screen">
    {#if !isSidebarClosed}
        <div onclick={toggleSidebar} aria-hidden="true" class="fixed inset-0 bg-zinc-950/75 z-40 transition-all duration-300 ease-in-out opacity-0 {!isSidebarClosed && 'opacity-100'} cursor-pointer"></div>
    {/if}

    <div class="relative">
        <div class="z-50 h-screen p-6 flex flex-col justify-between bg-zinc-100 text-zinc-900 dark:text-zinc-300 dark:bg-zinc-900 transition-transform duration-300 fixed transform scroll-hidden {isSidebarClosed ? '-translate-x-full' : 'translate-x-0'} overflow-y-auto" style="width: {sidebarWidth}px">
            
            <div class="flex flex-col items-center justify-start gap-12">
                <div class="flex flex-row justify-between items-center w-full px-2">
                    <a href="/home" class="relative w-12 h-12 me-4">
                        <img src="/assets/images/favicon-{ $themeStore == 0 ? 'light' : 'dark' }.png" alt="logo"/>
                    </a>
                    
                    <div class="flex items-center">
                        <button onclick={toggleSidebar} class="p-1 rounded-lg hover:bg-zinc-500/25 transition-colors" aria-label="Collapse sidebar">
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <div class="w-full flex flex-col gap-6">
                    <div class="flex flex-row items-center justify-between px-2">
                        <p class="w-full text-lg font-medium m-0">Table of Contents</p>
                        <button onclick={() => toggleCollapsed()} class="p-1 rounded-lg hover:bg-zinc-500/25 transition-colors cursor-pointer">
                            {#if isCollapsed}
                                <ChevronsUpDown size={18}/>
                            {:else}
                                <ChevronsDownUp size={18}/>
                            {/if}
                        </button>
                    </div>

                    <div class="[&_*]:text-sm">
                        {#each contentTree.children as item}
                            {@const hasChildren = item.children}
                            <div class="flex flex-col">
                                <button onclick={() => toggleExpanded(item.href)} class="flex items-center gap-4 ps-2 p-1 py-[6px] mb-1 rounded-lg transition-colors hover:bg-zinc-500/20 { isRouteActive(item.href) && 'bg-zinc-500/20'}">
                                    <a href={item.href} class="flex items-center gap-4 flex-1 hover:no-underline text-zinc-900 dark:text-zinc-300">
                                        <item.icon size={16} strokeWidth={1.5}/>
                                        <span class="truncate">{item.href.split("/").pop().replaceAll('-', ' ')}</span>
                                    </a>

                                    {#if hasChildren}
                                        <ChevronDown size={16} class="transition-transform me-2 duration-200 {expandedItems.find(it => it == item.href) ? 'text-red-500' : 'rotate-90'}"/>
                                    {/if}
                                </button>

                                {#if hasChildren && expandedItems.find(it => it == item.href)}
                                    <div transition:slide={{duration: 300}} class="border-l-2 border-zinc-500/20 pl-2">
                                        {#each item.children as child}
                                            {@const hasGrandchildren = child.children}
                                            <div class="flex flex-col">
                                                <button onclick={() => toggleExpanded(child.href)} class="flex items-center gap-4 ps-2 p-1 py-[6px] mb-1 ms-4 rounded-lg transition-colors hover:bg-zinc-500/20 {isRouteActive(child.href) && 'bg-zinc-500/20'}">
                                                    <a href={child.href} class="flex items-center gap-4 flex-1 hover:no-underline text-zinc-900 dark:text-zinc-300">
                                                        <child.icon size={16} strokeWidth={1.5}/>
                                                        <span class="truncate">{child.href.split("/").pop().replaceAll('-', ' ')}</span>
                                                    </a>

                                                    {#if hasGrandchildren}
                                                        <ChevronDown size={16} class="transition-transform duration-200 me-2 {expandedItems.find(it => it == child.href) ? 'text-red-500' : 'rotate-90'}"/>
                                                    {/if}
                                                </button>

                                                {#if hasGrandchildren && expandedItems.find(it => it == child.href)}
                                                    <div transition:slide={{duration: 300}} class="pl-2 border-l-2 ml-4 border-zinc-500/20">
                                                        {#each child.children as grandchild}
                                                            <a href={grandchild.href} class="flex items-center gap-4 ps-2 p-1 py-[6px] mb-1 ms-4 rounded-lg hover:no-underline text-zinc-900 dark:text-zinc-300 transition-colors hover:bg-zinc-500/20 {isRouteActive(grandchild.href) && 'bg-zinc-500/20'}">
                                                                <grandchild.icon size={16} strokeWidth={1.5}/>
                                                                <span class="flex-1 truncate">{grandchild.href.split("/").pop().replaceAll('-', ' ')}</span>
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
                    </div>
                </div>
            </div>

            <div class="flex flex-row justify-center items-center mb-4 mt-8">
                <p class="text-lg m-0">Computer</p>
                <img src="/assets/images/favicon-{ $themeStore == 0 ? 'light' : 'dark' }.png" alt="icon" class="size-6 mx-2">
                <p class="text-lg m-0">Graphics</p>
            </div>

            <!-- <div on:mousedown={startResize} class="absolute top-0 right-0 w-4 h-full cursor-col-resize flex items-center justify-center hover:bg-zinc-500/20 transition-colors">
                <div class="p-1 rounded-md text-zinc-400 dark:text-zinc-500">
                    <GripVertical size={16} />
                </div>
            </div> -->
        </div>
    </div>

    <div class="flex-1">
        <button onclick={toggleSidebar} class="fixed top-4 left-4 z-10 p-1 rounded-lg hover:bg-zinc-500/20 transition-colors" aria-label={isSidebarClosed ? "Expand sidebar" : "Collapse sidebar"}>
            <Menu size={18}/>
        </button>

        <div class="p-4">
            {@render children?.()}
        </div>
    </div>

    {#if isDragging}
        <div class="fixed inset-0 z-[100] cursor-col-resize"></div>
    {/if}
</div>