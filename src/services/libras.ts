interface LibrasApi { Widget: new (url: string) => unknown }
declare global { interface Window { VLibras?: LibrasApi } }

let loading: Promise<void> | undefined;
let initialized = false;

export async function loadLibrasWidget(): Promise<void> {
    try {
        if (initialized) return;
        if (!loading) {
            loading = new Promise<void>((resolve, reject) => {
                const script = document.createElement("script");
                const timeout = setTimeout(() => { script.remove(); reject(new Error("O VLibras demorou para responder.")); }, 15000);
                script.src = "https://vlibras.gov.br/app/vlibras-plugin.js";
                script.async = true;
                script.onload = () => {
                    clearTimeout(timeout);
                    try {
                        if (!window.VLibras) throw new Error("O serviço do VLibras não ficou disponível.");
                        if (!document.getElementById("vlibras-access-wrapper")) new window.VLibras.Widget("https://vlibras.gov.br/app");
                        initialized = true;
                        resolve();
                    } catch (error) { script.remove(); reject(error); }
                };
                script.onerror = () => { clearTimeout(timeout); script.remove(); reject(new Error("Não foi possível carregar o VLibras.")); };
                document.body.append(script);
            });
        }
        await loading;
    } catch (error) {
        loading = undefined;
        throw error instanceof Error ? error : new Error("Não foi possível carregar o VLibras.");
    }
}
