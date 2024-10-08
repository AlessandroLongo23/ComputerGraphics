<script>
    import Section from "$lib/components/Section.svelte";
    import { page } from "$app/stores";
</script>

<div>
    <Section title="Exercise 1" href="{ $page.url.pathname }/1.2.1. Exercise 1" style=""></Section>
    <Section title="Exercise 2" href="{ $page.url.pathname }/1.2.2. Exercise 2" style=""></Section>
    <Section title="Exercise 3" href="{ $page.url.pathname }/1.2.3. Exercise 3" style=""></Section>
    <Section title="Exercise 4" href="{ $page.url.pathname }/1.2.4. Exercise 4" style=""></Section>
</div>

<style>
</style>