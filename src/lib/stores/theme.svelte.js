import { writable } from 'svelte/store';

const createThemeStore = () => {
    const { subscribe, set: internalSet } = writable(0);

    const setTheme = (value) => {
        document.documentElement.classList.add('disable-transitions');
        document.documentElement.classList.toggle('dark', value === 1);
        localStorage.setItem('theme', value.toString());
        internalSet(value);
        setTimeout(() => {
            document.documentElement.classList.remove('disable-transitions');
        }, 100);
    };

    return {
        subscribe,
        setTheme,
        set: setTheme
    };
}

export const themeStore = createThemeStore();