export const prerender = false;
import { db } from "@lib/db";
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return new Response(JSON.stringify({ error: 'userId est requis' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if user exists and is banned
    const userCheck = await db.query('SELECT id, banned FROM "user" WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Utilisateur non trouvé' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!userCheck.rows[0].banned) {
      return new Response(JSON.stringify({ error: 'Utilisateur n\'est pas banni' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Unban the user
    await db.query(
      'UPDATE "user" SET banned = false, banReason = NULL, banExpires = NULL, updatedAt = NOW() WHERE id = $1',
      [userId]
    );

    return new Response(JSON.stringify({ success: true, message: 'Utilisateur débanni avec succès' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error unbanning user:', error);
    return new Response(JSON.stringify({ error: 'Erreur serveur' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};