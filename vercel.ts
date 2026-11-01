interface VercelConfig {
    rewrites: Array<{ source: string; destination: string }>;
}

const apiOriginValue = process.env.API_ORIGIN;

if (!apiOriginValue) {
    throw new Error("Configure API_ORIGIN nas variáveis de ambiente da Vercel.");
}

const apiOriginUrl = new URL(apiOriginValue);

if (
    (apiOriginUrl.protocol !== "http:" && apiOriginUrl.protocol !== "https:") ||
    apiOriginUrl.pathname !== "/" ||
    apiOriginUrl.search ||
    apiOriginUrl.hash
) {
    throw new Error("API_ORIGIN deve conter apenas a origem HTTP(S), sem caminho ou parâmetros.");
}

export const config: VercelConfig = {
    rewrites: [
        {
            source: "/api/:path*",
            destination: `${apiOriginUrl.origin}/api/:path*`,
        },
        {
            source: "/(.*)",
            destination: "/index.html",
        },
    ],
};
