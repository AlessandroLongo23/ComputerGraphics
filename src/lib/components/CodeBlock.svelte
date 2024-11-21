<script>
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import hljs from 'highlight.js';
    import 'highlight.js/styles/atom-one-dark.css';

    let { style = '', codeSnippets, viewIndex, folderPath } = $props();
    let currentSnippetIndex = $state(0);
    let copyIcon = $state('copy');
    let currentCode = $derived(codeSnippets[currentSnippetIndex].code);
    let currentLanguage = $derived(codeSnippets[currentSnippetIndex].language);

    let zipFilePath = $page.url.pathname + '/' + $page.url.pathname.split('/').pop() + '.zip'; 
    
    onMount(() => {
        highlightCode();
    });

    const unescapeHtml = (escapedHtml) => {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = escapedHtml;
        return textarea.value;
    }

    const highlightCode = () => {
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

    const copyToClipboard = () => {
        const textToCopy = currentCode.includes('&lt;') ? unescapeHtml(currentCode) : currentCode;
            
        navigator.clipboard.writeText(textToCopy).then(() => {
            copyIcon = 'check';
            setTimeout(() => {
                copyIcon = 'copy';
            }, 2000);
        }).catch(err => {
            console.error('Could not copy text: ', err);
        });
    }

    const selectSnippet = (index) => {
        currentSnippetIndex = index;
        highlightCode();
    }
</script>

<div class="relative w-full">
    <div class="button-container absolute flex flex-row w-full justify-between p-4 rounded-lg {viewIndex == 1 && 'rounded-r-none'}">
        <div class="flex flex-row justify-start overflow-x-scroll scroll-hidden">
            {#if codeSnippets.length > 1}
                {#each codeSnippets as codeSnippet, i}
                    <button class="flex me-2 text-sm h-8 transition-colors duration-200 items-center text-white px-4 py-4 rounded-lg w-auto" class:selected={i === currentSnippetIndex} onclick={() => selectSnippet(i)}> 
                        {codeSnippet.name} 
                    </button>
                {/each}
            {:else}
                <p class="me-2 rounded-lg">{codeSnippets[0].name}</p>
            {/if}
        </div>

        <div class="flex flex-row justify-end gap-2 ps-4">
            <button onclick={copyToClipboard} class="flex items-center transition-colors duration-200 text-sm h-8 text-white px-4 py-2 rounded-lg w-auto {copyIcon == 'check' && 'copied'}" aria-label="Copy code to clipboard">
                <i class="fa fa-{copyIcon}"></i>
            </button>

            <a download href="{zipFilePath}" class="flex items-center transition-colors duration-200 text-sm h-8 text-white px-4 py-2 rounded-lg w-auto" aria-label="Download zip folder">
                <i class="fa-solid fa-download"></i>
            </a>
        </div>
    </div>

    <pre class="language-{currentLanguage} m-0 rounded-lg {viewIndex == 1 && 'rounded-r-none'} scroll-hidden" style={style}>
        <code class="language-{currentLanguage} scroll-hidden">
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
        line-height: 1.2rem;
    }

    button, a {
        background: rgba(51, 51, 51, 0.8);
    }

    button:hover, a:hover { 
        background-color: rgba(68, 68, 68, 0.9);
    } 

    button.selected, .copied { 
        background-color: rgba(0, 122, 204, 0.8) !important;
    }  
</style>