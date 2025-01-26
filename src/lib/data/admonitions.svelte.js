import * as ls from 'lucide-svelte';

export const admonitions = [
    {
        name: 'warning',
        icon: ls.TriangleAlert,
        backgroundColor: 'bg-red-100',
        borderColor: 'border-red-500',
        iconColor: 'text-red-700',
        darkBackgroundColor: 'bg-red-950/25',
        darkBorderColor: 'border-red-400',
        darkIconColor: 'text-red-400'
    },
    {
        name: 'note',
        icon: ls.Notebook,
        backgroundColor: 'bg-amber-100',
        borderColor: 'border-amber-500',
        iconColor: 'text-amber-700',
        darkBackgroundColor: 'bg-amber-950/25',
        darkBorderColor: 'border-amber-400',
        darkIconColor: 'text-amber-400'
    },
    {
        name: 'tip',
        icon: ls.Lightbulb,
        backgroundColor: 'bg-teal-100',
        borderColor: 'border-teal-500',
        iconColor: 'text-teal-700',
        darkBackgroundColor: 'bg-teal-950/25',
        darkBorderColor: 'border-teal-400',
        darkIconColor: 'text-teal-400'
    },
    {
        name: 'formula',
        icon: ls.Sigma,
        backgroundColor: 'bg-blue-100',
        borderColor: 'border-blue-500',
        iconColor: 'text-blue-700',
        darkBackgroundColor: 'bg-blue-950/25',
        darkBorderColor: 'border-blue-400',
        darkIconColor: 'text-blue-400'
    }
];