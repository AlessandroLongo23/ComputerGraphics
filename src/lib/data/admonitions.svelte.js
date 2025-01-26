import * as ls from 'lucide-svelte';

export const admonitions = [
    {
        name: 'warning',
        icon: ls.TriangleAlert,
        backgroundColor: 'bg-red-100',
        borderColor: 'border-red-500',
        iconColor: 'text-red-700',
    },
    {
        name: 'note',
        icon: ls.Notebook,
        backgroundColor: 'bg-zinc-100',
        borderColor: 'border-zinc-500',
        iconColor: 'text-zinc-700',
    },
    {
        name: 'tip',
        icon: ls.Lightbulb,
        backgroundColor: 'bg-teal-100',
        borderColor: 'border-teal-500',
        iconColor: 'text-teal-700',
    },
    {
        name: 'formula',
        icon: ls.Sigma,
        backgroundColor: 'bg-blue-100',
        borderColor: 'border-blue-500',
        iconColor: 'text-blue-700',
    }
];