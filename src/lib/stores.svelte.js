import { writable } from 'svelte/store';

export const theme = writable('light');
export const viewIndex = writable(1);
