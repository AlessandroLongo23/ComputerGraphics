<div class="flex flex-col justify-center items-center h-screen">
    <div class="stack" style="--stacks: 3;">
        <span class="text-8xl" style="--index: 2;">404</span>
        <span class="text-8xl" style="--index: 0;">404</span>
        <span class="text-8xl" style="--index: 1;">404</span>
    </div>
    <p class="text-4xl">Page not found</p>
    <a href="/home" class="back-home bg-red-500 hover:bg-red-600 transition-colors text-zinc-100 text-lg rounded-lg hover:no-underline">
        Back to home
    </a>
</div>

<style>
    .back-home {
        padding: 0.5rem 1rem;
        margin-top: 1rem;
    }

    * { 
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    :root {
        --background: #060608;
        --color: #FAFAFA;
    }

    .stack {
        display: grid;
        grid-template-columns: 1fr;
    }

    .stack span {
        font-weight: bold;
        grid-row-start: 1;
        grid-column-start: 1;
        font-size: 8rem;
        --stack-height: calc(100% / var(--stacks) - 1px);
        --inverse-index: calc(calc(var(--stacks) - 1) - var(--index));
        --clip-top: calc(var(--stack-height) * var(--index));
        --clip-bottom: calc(var(--stack-height) * var(--inverse-index));
        clip-path: inset(var(--clip-top) 0 var(--clip-bottom) 0);
        animation: stack 120ms cubic-bezier(.46, .29, 0, 1.24) 1 backwards calc(var(--index) * 120ms), glitch 1.5s ease infinite 1.5s alternate-reverse;
    }

    .stack span:nth-child(odd) { --glitch-translate: 8px; }
    .stack span:nth-child(even) { --glitch-translate: -8px; }

    @keyframes stack {
        0% {
            opacity: 0;
            transform: translateX(-50%);
            text-shadow: -2px 3px 0 red, 2px -3px 0 blue;
        }
        60% {
            opacity: 0.5;
            transform: translateX(50%);
        }
        80% {
            transform: none;
            opacity: 1;
            text-shadow: 2px -3px 0 red, -2px 3px 0 blue;
        }
        100% {
            text-shadow: none;
        }
    }

    @keyframes glitch {
        0% {
            text-shadow: -2px 3px 0 red, 2px -3px 0 blue;
            transform: translate(var(--glitch-translate));
        }
        5% {
            text-shadow: 2px -3px 0 red, -2px 3px 0 blue;
        }
        10%, 100% {  text-shadow: none; transform: none; }
    }
</style>

