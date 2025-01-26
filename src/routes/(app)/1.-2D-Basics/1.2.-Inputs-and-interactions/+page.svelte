<script>
    import Section from '$lib/components/Section.svelte';
</script>

<div class="flex flex-col gap-12">
    <div class="flex flex-col gap-6 items-start w-1/2 m-auto">
        <p class="text-xl font-medium m-0">Introduction</p>

        <div class="flex flex-col gap-4">
            <p>The purpose of this set of exercises is to start interacting with the graphics elements that we draw using input devices. You will make a small 2D drawing program where primitive shapes of different colors can be added using the mouse.</p>
            <p>The purpose of this set of exercises is to start interacting with the graphics elements that we draw using input devices. You will make a small 2D drawing program where primitive shapes of different colors can be added using the mouse.</p>
            <p>Although it is possible to draw 2D shapes using a 2D canvas context, you will do it with a WebGL context as it is really not much harder, and WebGL enables later extension to full 3D.</p>
            <p>The following screenshot is an example of what the final web application could look like. Your version doesn't have to be exactly like it. The important point is that it has the features we want.</p>
            <img src="/assets/images/1.2.-Inputs-and-interactions.png" alt="2D drawing" class="w-4/5 m-auto">
        </div>
    </div>

    <Section IndexingLevel="Exercises"></Section>
</div>