import * as ls from 'lucide-svelte';

export const admonitions = [
    {
        name: 'warning',
        icon: ls.TriangleAlert,
        backgroundColor: 'bg-red-300/25',
        borderColor: 'border-red-500',
        iconColor: 'text-red-700',
    },
    {
        name: 'note',
        icon: ls.Notebook,
        backgroundColor: 'bg-gray-300/25',
        borderColor: 'border-gray-500',
        iconColor: 'text-gray-700',
    },
    {
        name: 'tip',
        icon: ls.Lightbulb,
        backgroundColor: 'bg-teal-300/25',
        borderColor: 'border-teal-500',
        iconColor: 'text-teal-700',
    },
    {
        name: 'formula',
        icon: ls.Sigma,
        backgroundColor: 'bg-blue-300/25',
        borderColor: 'border-blue-500',
        iconColor: 'text-blue-700',
    }
];