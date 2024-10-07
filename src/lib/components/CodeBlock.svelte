<script>
    import { onMount } from 'svelte';
    import hljs from 'highlight.js';
    import 'highlight.js/styles/atom-one-dark.css';

    export let classes = '';
    export let style = '';

    export let code_snippets;
    let current_snippet_index = 0;
    let button_text = 'Copy Code';
    $: current_code = code_snippets[current_snippet_index].code;
    $: current_language = code_snippets[current_snippet_index].language;

    onMount(() => {
        highlightCode();
    });

    function unescapeHtml(escapedHtml) {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = escapedHtml;
        return textarea.value;
    }

    function highlightCode() {
        setTimeout(() => {
            const block = document.querySelector('pre code');
            if (block) {
                const processedCode = current_code.includes('&lt;') ? unescapeHtml(current_code) : current_code;
                    
                block.dataset.highlighted = '';
                block.textContent = processedCode;
                hljs.highlightElement(block);
            }
        }, 0);
    }

    function copyToClipboard() {
        const textToCopy = current_code.includes('&lt;') ? unescapeHtml(current_code) : current_code;
            
        navigator.clipboard.writeText(textToCopy).then(() => {
            button_text = 'Copied!';
            setTimeout(() => {
                button_text = 'Copy Code';
            }, 1000);
        }).catch(err => {
            console.error('Could not copy text: ', err);
        });
    }

    function selectSnippet(index) {
        current_snippet_index = index;
        highlightCode();
    }
</script>

<div class="relative my-8 w-full" style="min-width: 768px;">
    <div class="button-container absolute flex flex-row justify-between p-4 w-full rounded-l-lg">
        <div class="flex flex-row justify-start">
            {#if code_snippets.length > 1}
                {#each code_snippets as code_snippet, i}
                    <button class="me-2 text-sm px-4 py-4 rounded-lg w-auto" class:selected={i === current_snippet_index} on:click={() => selectSnippet(i)}> 
                        {code_snippet.name} 
                    </button>
                {/each}
            {:else}
                <p class="me-2 rounded-lg">{code_snippets[0].name}</p>
            {/if}
        </div>

        <button on:click={copyToClipboard} class="text-sm px-4 py-4 rounded-lg w-auto">
            {button_text}
        </button>
    </div>

    <pre class="language-{current_language} m-0 {classes}" style={style}>
        <code class="language-{current_language}">
            {current_code}
        </code>
    </pre>
</div>

<style>
    .button-container {
        background-color: #282c34;
    }

    pre { 
        background-color: #282c34; 
        overflow-x: auto;
        width: 100%;
        padding: 2rem 1rem 1rem 1rem;
    } 

    code { 
        font-family: 'Fira Code', monospace;
        white-space: pre;
    }

    button { 
        background: rgba(51, 51, 51, 0.8);
        color: white; 
        border: none; 
        cursor: pointer; 
        transition: background-color 0.2s;
        backdrop-filter: blur(4px);
        height: 2rem;
        width: auto;
        display: flex;
        align-items: center;
    } 

    button:hover { 
        background-color: rgba(68, 68, 68, 0.9);
    } 

    button.selected { 
        background-color: rgba(0, 122, 204, 0.8);
    }  
</style>