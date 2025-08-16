export const prerender = false;
import { db } from "@lib/db";
import type { APIRoute } from "astro";

const VALID_ROLES = ['admin', 'user', 'member', 'guest'];

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return new Response(JSON.stringify({ error: 'userId et role sont requis' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate role
    if (!VALID_ROLES.includes(role)) {
      return new Response(JSON.stringify({ 
        error: `Rôle invalide. Rôles valides: ${VALID_ROLES.join(', ')}` 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if user exists
    const userCheck = await db.query('SELECT id, role FROM "user" WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Utilisateur non trouvé' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (userCheck.rows[0].role === role) {
      return new Response(JSON.stringify({ error: 'L\'utilisateur a déjà ce rôle' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update user role
    await db.query(
      'UPDATE "user" SET role = $1, updatedAt = NOW() WHERE id = $2',
      [role, userId]
    );

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Rôle mis à jour vers "${role}" avec succès` 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error updating user role:', error);
    return new Response(JSON.stringify({ error: 'Erreur serveur' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};