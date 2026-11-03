import { routes, type VercelConfig } from "@vercel/config/v1";

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

const iaOriginUrl = new URL(process.env.IA_ORIGIN || `${apiOriginUrl.origin}/ia`);

if (
    (iaOriginUrl.protocol !== "http:" && iaOriginUrl.protocol !== "https:") ||
    iaOriginUrl.search ||
    iaOriginUrl.hash
) {
    throw new Error("IA_ORIGIN deve conter uma URL HTTP(S), sem query ou fragmento.");
}

const iaBasePath = iaOriginUrl.pathname.replace(/\/+$/, "");

export const config: VercelConfig = {
    routes: routes
        .route({
            src: "^/api/(.*)$",
            dest: `${apiOriginUrl.origin}/api/$1`,
            transforms: [
                {
                    type: "request.headers",
                    op: "delete",
                    target: { key: "origin" },
                },
            ],
        })
        .route({
            src: "^/ia/(.*)$",
            dest: `${iaOriginUrl.origin}${iaBasePath}/$1`,
        })
        .route({
            src: "^/(.*)$",
            dest: "/index.html",
        })
        .getConfig().routes,
};
