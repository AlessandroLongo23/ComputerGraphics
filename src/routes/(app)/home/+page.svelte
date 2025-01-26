<script>
    let sections = [
        { href: "/1.-2D-Basics", title: "Section 1: 2D Basics" },
        { href: "/2.-3D-Rendering", title: "Section 2: 3D Rendering" },
        { href: "/3.-Advanced-rendering", title: "Section 3: Advanced Rendering" },
        { href: "/4.-Advanced-techniques", title: "Section 4: Advanced Techniques" },
        { href: "/5.-Final-project", title: "Section 5: Final Project" }
    ];
</script>

<div class="flex flex-col gap-12 w-1/2 m-auto">
    <div class="flex flex-col gap-6 w-full">
        <p class="text-xl font-medium m-0">Course Description</p>

        <div class="flex flex-col gap-4 [&_*]:text-zinc-850 [&_*]:dark:text-zinc-100/50">
            <p>Interactive computer graphics enables us to manipulate digital 3D objects. The ability to work interactively with digital objects is an important engineering skill.</p>
            
            <p>Our objective in this course is to enable the participants to:</p>
            <ul class="list-disc list-inside">
                <li>implement real-time computer graphics systems</li>
                <li>to develop graphics algorithms with applications in visualization, modelling, and animation.</li>
            </ul>
            
            <p>The course covers web graphics technology and introduces the principles of 3D graphics that one would need for working on CAD systems, game engines, computer animation, 3D multimedia, virtual reality, and scientific visualization.</p>
        </div>
    </div>

    <div class="flex flex-col gap-6">
        <p class="text-xl font-medium m-0">Sections</p>

        <div class="flex flex-col gap-4">
            {#each sections as section}
                <div class="relative">
                    <a class="text-zinc-950/50 hover:text-zinc-950 dark:text-zinc-100/50 hover:dark:text-zinc-100 relative after:absolute after:bg-zinc-850 after:dark:bg-zinc-200 after:-bottom-[3px] after:left-0 after:h-[1px] after:w-0 hover:after:w-full transition-all duration-300 after:transition-all after:duration-300" href={section.href}>{section.title}</a>
                </div>
            {/each}
        </div>
    </div>
</div>