<script>
    import { onMount } from 'svelte';
    import hljs from 'highlight.js';
    import 'highlight.js/styles/atom-one-dark.css';

    export let style = '';

    export let codeSnippets;
    export let viewIndex;
    let currentSnippetIndex = 0;
    let buttonIcon = 'copy';
    $: currentCode = codeSnippets[currentSnippetIndex].code;
    $: currentLanguage = codeSnippets[currentSnippetIndex].language;

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
                const processedCode = currentCode.includes('&lt;') ? unescapeHtml(currentCode) : currentCode;
                    
                block.dataset.highlighted = '';
                block.textContent = processedCode;
                hljs.highlightElement(block);
            }
        }, 0);
    }

    function copyToClipboard() {
        const textToCopy = currentCode.includes('&lt;') ? unescapeHtml(currentCode) : currentCode;
            
        navigator.clipboard.writeText(textToCopy).then(() => {
            buttonIcon = 'check';
            setTimeout(() => {
                buttonIcon = 'copy';
            }, 2000);
        }).catch(err => {
            console.error('Could not copy text: ', err);
        });
    }

    function selectSnippet(index) {
        currentSnippetIndex = index;
        highlightCode();
    }
</script>

<div class="relative w-full">
    <div class="button-container absolute flex flex-row w-full justify-between p-4 rounded-lg {viewIndex == 1 ? 'rounded-r-none' : ''}">
        <div class="flex flex-row justify-start">
            {#if codeSnippets.length > 1}
                {#each codeSnippets as codeSnippet, i}
                    <button class="flex me-2 text-sm h-8 transition-colors duration-200 items-center text-white px-4 py-4 rounded-lg w-auto" class:selected={i === currentSnippetIndex} on:click={() => selectSnippet(i)}> 
                        {codeSnippet.name} 
                    </button>
                {/each}
            {:else}
                <p class="me-2 rounded-lg">{codeSnippets[0].name}</p>
            {/if}
        </div>

        <button on:click={copyToClipboard} class="flex items-center transition-colors duration-200 text-sm h-8 text-white px-4 py-2 rounded-lg w-auto {buttonIcon == 'check' ? 'copied' : ''}">
            <i class="fa fa-{buttonIcon} ? 'copy' : 'check'}"></i>
        </button>
    </div>

    <pre class="language-{currentLanguage} m-0 rounded-lg {viewIndex == 1 ? 'rounded-r-none' : ''}" style={style}>
        <code class="language-{currentLanguage}">
            {currentCode}
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
        padding: 2rem 1rem 1rem 1rem;
    } 

    code { 
        font-family: 'Fira Code', monospace;
        white-space: pre;
    }

    button {
        background: rgba(51, 51, 51, 0.8);
    }

    button:hover { 
        background-color: rgba(68, 68, 68, 0.9);
    } 

    button.selected, .copied { 
        background-color: rgba(0, 122, 204, 0.8) !important;
    }  
</style>