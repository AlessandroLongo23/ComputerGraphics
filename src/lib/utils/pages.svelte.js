import { contentSequence } from "$lib/data/pages.svelte.js";

export const getPage = (pathname, off) => {
    if (pathname == '/home')
        return undefined;

    let currentPath = pathname.split("/");
    let currentLevel = currentPath.length;
    let currentIndex = currentPath[currentLevel - 1];

    let sameLevel = contentSequence.filter(it => {
        let path = it.href?.split("/");
        return path?.length === currentLevel && 
               path.slice(0, -1).join("/") === currentPath.slice(0, -1).join("/");
    });

    let index = sameLevel.findIndex(it => it.href?.split('/').pop() === currentIndex);
    
    if (off > 0 && index + off >= sameLevel.length) {
        let parentPath = currentPath.slice(0, -1);
        let parentLevel = parentPath.length;
        let parentIndex = parentPath[parentLevel - 1];
        
        let parentSiblings = contentSequence.filter(it => {
            let path = it.href?.split("/");
            return path?.length === parentLevel && 
                   path.slice(0, -1).join("/") === parentPath.slice(0, -1).join("/");
        });
        
        let parentIdx = parentSiblings.findIndex(it => it.href?.split('/').pop() === parentIndex);
        if (parentIdx + 1 < parentSiblings.length) {
            return parentSiblings[parentIdx + 1].href;
        } else {
            let sectionPath = parentPath.slice(0, -1);
            let sectionLevel = sectionPath.length;
            let sectionIndex = sectionPath[sectionLevel - 1];

            let sectionSiblings = contentSequence.filter(it => {
                let path = it.href?.split("/");
                return path?.length === sectionLevel &&
                       path.slice(0, -1).join("/") === sectionPath.slice(0, -1).join("/");
            });

            let sectionIdx = sectionSiblings.findIndex(it => it.href?.split('/').pop() === sectionIndex);
            if (sectionIdx + 1 < sectionSiblings.length) {
                return sectionSiblings[sectionIdx + 1].href;
            }
        }
    }
    
    if (off < 0 && index + off < 0) {
        let parentPath = currentPath.slice(0, -1).join("/");
        if (parentPath.length > 0) {
            return parentPath;
        }
    }

    if (index + off < 0 || index + off >= sameLevel.length)
        return undefined;

    return sameLevel[index + off].href;
}