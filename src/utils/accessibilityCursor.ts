import type { CursorColor, CursorSize } from "../types/accessibility";

export function createAccessibilityCursor(size: CursorSize, color: CursorColor, shape: "arrow" | "pointer" | "text"): string {
    const pixels = { medium: 32, large: 48, "extra-large": 64 }[size];
    const fill = { default: "#5700bb", black: "#000000", yellow: "#ecc506", white: "#ffffff" }[color];
    const stroke = color === "white" ? "#221b2e" : "#ffffff";
    const paths = {
        arrow: "M3 2v26l7-7 5 10 5-3-5-9h10Z",
        pointer: "M12 17V4a3 3 0 0 1 6 0v9l3-1 7 4v9c0 4-3 6-7 6h-5c-3 0-5-2-7-5l-5-7a3 3 0 0 1 4-4Z",
        text: "M10 3h12v3h-4v20h4v3H10v-3h4V6h-4Z",
    };
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${pixels}" height="${pixels}" viewBox="0 0 32 32"><path d="${paths[shape]}" fill="${fill}" stroke="${stroke}" stroke-width="2" stroke-linejoin="round"/></svg>`;
    const x = Math.round(pixels * (shape === "text" ? 16 : shape === "pointer" ? 15 : 3) / 32);
    const y = Math.round(pixels * (shape === "text" ? 16 : 2) / 32);
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${x} ${y}, ${shape === "arrow" ? "auto" : shape}`;
}
