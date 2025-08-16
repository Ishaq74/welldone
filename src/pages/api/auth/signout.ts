export const prerender = false;
import { auth } from "@lib/auth";
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  try {
    // La déconnexion est gérée par Better Auth via le handler
    let res, data;
    try {
      res = await auth.handler(request);
      data = await res.json();
    } catch (err) {
      if (err && (err as Error).name === 'BetterAuthError') {
        return new Response(JSON.stringify({ error: (err as Error).message }), { status: 400 });
      }
      return new Response(JSON.stringify({ error: 'Erreur serveur.' }), { status: 500 });
    }
    if (data && data.error && !String(data.error).toLowerCase().includes('serveur')) {
      return new Response(JSON.stringify({ error: data.error }), { status: 400 });
    }
    if (res.status === 200 && data && data.success) {
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }
    return new Response(JSON.stringify({ error: data.error || 'Erreur serveur.' }), { status: 500 });
  } catch (err) {
    if (err && (err as Error).name === 'BetterAuthError') {
      return new Response(JSON.stringify({ error: (err as Error).message }), { status: 400 });
    }
    return new Response(JSON.stringify({ error: 'Erreur serveur.' }), { status: 500 });
  }
};
