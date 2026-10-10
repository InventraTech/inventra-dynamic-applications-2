const API_ORIGIN = "https://ms-inventra-api.onrender.com";

export default async function proxy(request: Request): Promise<Response> {
    const incomingUrl = new URL(request.url);
    const upstreamUrl = new URL(
        `${incomingUrl.pathname}${incomingUrl.search}`,
        API_ORIGIN,
    );
    const headers = new Headers(request.headers);

    headers.delete("connection");
    headers.delete("content-length");
    headers.delete("host");
    headers.delete("origin");

    const body = request.method === "GET" || request.method === "HEAD"
        ? undefined
        : await request.arrayBuffer();

    try {
        const upstreamResponse = await fetch(upstreamUrl, {
            method: request.method,
            headers,
            body,
            cache: "no-store",
            redirect: "manual",
            signal: request.signal,
        });
        const responseHeaders = new Headers(upstreamResponse.headers);

        responseHeaders.delete("connection");
        responseHeaders.delete("content-length");
        responseHeaders.delete("transfer-encoding");

        const responseBody = [204, 205, 304].includes(upstreamResponse.status)
            ? null
            : upstreamResponse.body;

        return new Response(responseBody, {
            status: upstreamResponse.status,
            statusText: upstreamResponse.statusText,
            headers: responseHeaders,
        });
    } catch {
        return Response.json(
            { message: "A API do Inventra está indisponível no momento." },
            { status: 502 },
        );
    }
}
