export const prerender = false;
import { db } from "@lib/db";
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { userId, reason, expires } = body;

    if (!userId || !reason) {
      return new Response(JSON.stringify({ error: 'userId et reason sont requis' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate expiration date if provided
    let banExpires = null;
    if (expires) {
      banExpires = new Date(expires);
      if (isNaN(banExpires.getTime()) || banExpires <= new Date()) {
        return new Response(JSON.stringify({ error: 'Date d\'expiration invalide' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Check if user exists
    const userCheck = await db.query('SELECT id, banned FROM "user" WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Utilisateur non trouvé' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (userCheck.rows[0].banned) {
      return new Response(JSON.stringify({ error: 'Utilisateur déjà banni' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Start transaction
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');
      
      // Ban the user
      await client.query(
        'UPDATE "user" SET banned = true, banReason = $1, banExpires = $2, updatedAt = NOW() WHERE id = $3',
        [reason, banExpires, userId]
      );

      // Invalidate all user sessions
      await client.query('DELETE FROM "session" WHERE userId = $1', [userId]);

      await client.query('COMMIT');

      return new Response(JSON.stringify({ success: true, message: 'Utilisateur banni avec succès' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error banning user:', error);
    return new Response(JSON.stringify({ error: 'Erreur serveur' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};