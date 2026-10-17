export function getReadableText(element: HTMLElement): string {
    if (element.closest('[aria-hidden="true"], [hidden], [data-no-read-aloud]')) return "";
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
            const parent = node.parentElement;
            if (!parent || parent.closest('script, style, svg, [aria-hidden="true"], [hidden], [data-no-read-aloud]')) return NodeFilter.FILTER_REJECT;
            const style = getComputedStyle(parent);
            return style.display === "none" || style.visibility === "hidden" || parent.getClientRects().length === 0
                ? NodeFilter.FILTER_REJECT
                : NodeFilter.FILTER_ACCEPT;
        },
    });
    const parts: string[] = [];
    while (walker.nextNode()) parts.push(walker.currentNode.textContent ?? "");
    return parts.join(" ").replace(/\s+/g, " ").trim();
}

export function getControlReadingText(element: HTMLElement): string {
    if (element.closest('[aria-hidden="true"], [hidden], [data-no-read-aloud]')) return "";
    const labelledBy = element.getAttribute("aria-labelledby")?.split(/\s+/)
        .map((id) => document.getElementById(id)?.textContent ?? "").join(" ");
    const label = element.getAttribute("aria-label") ?? labelledBy;
    if (label) return label;
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) {
        // Valores digitados e senhas nunca são enviados ao sintetizador de voz.
        return Array.from(element.labels ?? []).map((item) => item.textContent ?? "").join(" ");
    }
    return getReadableText(element);
}
