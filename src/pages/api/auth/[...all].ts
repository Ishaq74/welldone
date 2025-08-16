export const prerender = false;
import { auth } from "@lib/auth";
import type { APIRoute } from "astro";
 
export const ALL: APIRoute = async (ctx) => {
	// If you want to use rate limiting, make sure to set the 'x-forwarded-for' header to the request headers from the context
	// ctx.request.headers.set("x-forwarded-for", ctx.clientAddress);
	try {
		const res = await auth.handler(ctx.request);
		if (res.status && res.status !== 200) {
			const data = await res.json();
			return new Response(JSON.stringify({ error: data.error || 'Erreur de connexion.' }), { status: res.status });
		}
		return new Response(JSON.stringify({ success: true }), { status: 200 });
	} catch (err) {
		return new Response(JSON.stringify({ error: 'Erreur serveur.' }), { status: 500 });
	}
};