export const prerender = false;
import { auth } from "@lib/auth";
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');
    if (!name || !email || !password) {
      return new Response(JSON.stringify({ error: 'Tous les champs sont requis.' }), { status: 400 });
    }
    // Forward to Better Auth
    let res, data;
    try {
      res = await auth.handler(request);
      data = await res.json();
    } catch (err) {
      // Si Better Auth lève une erreur métier, renvoie 400
      if (err && (err as Error).name === 'BetterAuthError') {
        return new Response(JSON.stringify({ error: (err as Error).message }), { status: 400 });
      }
      return new Response(JSON.stringify({ error: 'Erreur serveur.' }), { status: 500 });
    }
    // Si la réponse contient une erreur métier, renvoie 400
    if (data && data.error && !String(data.error).toLowerCase().includes('serveur')) {
      return new Response(JSON.stringify({ error: data.error }), { status: 400 });
    }
    // Succès strict
    if (res.status === 200 && data && data.success) {
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }
    // Autre cas : erreur serveur
    return new Response(JSON.stringify({ error: data.error || 'Erreur serveur.' }), { status: 500 });
  } catch (err) {
    // Si Better Auth lève une erreur métier, renvoie 400
    if (err && (err as Error).name === 'BetterAuthError') {
      return new Response(JSON.stringify({ error: (err as Error).message }), { status: 400 });
    }
    return new Response(JSON.stringify({ error: 'Erreur serveur.' }), { status: 500 });
  }
};
