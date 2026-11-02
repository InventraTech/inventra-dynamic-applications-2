import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

// Aliases apply only to this dedicated test server. Production configuration is untouched.
export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: { alias: [
        { find: /^(?:\.\.\/)+services\/authSession$|^\.\/authSession$/, replacement: fileURLToPath(new URL("./session.ts", import.meta.url)) },
        { find: /^(?:\.\.\/)+services\/api$|^\.\/api$/, replacement: fileURLToPath(new URL("./api.ts", import.meta.url)) },
    ] },
    server: { host: "127.0.0.1", port: 5174, strictPort: true },
});
