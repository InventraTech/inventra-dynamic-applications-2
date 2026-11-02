import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  const apiOrigin = env.API_ORIGIN || "http://localhost:8080"
  const apiUrl = new URL(apiOrigin)
  const isLocalApi = ["localhost", "127.0.0.1", "::1"].includes(apiUrl.hostname)
  const defaultIaUrl = isLocalApi ? "http://localhost:8000" : new URL("/ia", apiUrl.origin).toString()
  const iaUrl = new URL(env.IA_ORIGIN || defaultIaUrl)
  if ((iaUrl.protocol !== "http:" && iaUrl.protocol !== "https:") || iaUrl.search || iaUrl.hash) {
    throw new Error("IA_ORIGIN deve ser uma URL HTTP(S), sem query ou fragmento.")
  }
  const iaPath = iaUrl.pathname.replace(/\/+$/, "")

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        "/api": {
          target: apiOrigin,
          changeOrigin: true,
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyRequest) => {
              proxyRequest.removeHeader("origin");
            });
          },
        },
        "/ia": {
          target: iaUrl.origin,
          changeOrigin: true,
          rewrite: (path) => `${iaPath}${path.replace(/^\/ia(?=\/|$)/, "")}`,
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyRequest) => {
              proxyRequest.removeHeader("origin");
            });
          },
        },
      },
    },
  }
})
