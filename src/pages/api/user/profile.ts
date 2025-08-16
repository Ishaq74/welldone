export const prerender = false;
import { db } from "@lib/db";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ locals }) => {
  try {
    const user = locals.user;
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Non authentifié' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get full user profile with additional details
    const userQuery = `
      SELECT id, name, email, emailVerified, role, banned, banReason, banExpires, 
             createdAt, updatedAt, username, displayUsername
      FROM "user" 
      WHERE id = $1
    `;
    
    const userResult = await db.query(userQuery, [user.id]);
    
    if (userResult.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Utilisateur non trouvé' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const userProfile = userResult.rows[0];

    // Get user's active sessions count
    const sessionQuery = `
      SELECT COUNT(*) as session_count 
      FROM "session" 
      WHERE userId = $1 AND expiresAt > NOW()
    `;
    
    const sessionResult = await db.query(sessionQuery, [user.id]);
    const sessionCount = parseInt(sessionResult.rows[0].session_count);

    return new Response(JSON.stringify({
      user: userProfile,
      sessionCount,
      isActive: !userProfile.banned || (userProfile.banExpires && new Date(userProfile.banExpires) <= new Date())
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return new Response(JSON.stringify({ error: 'Erreur serveur' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const PUT: APIRoute = async ({ request, locals }) => {
  try {
    const user = locals.user;
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Non authentifié' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json();
    const { name } = body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return new Response(JSON.stringify({ error: 'Nom invalide (minimum 2 caractères)' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (name.trim().length > 100) {
      return new Response(JSON.stringify({ error: 'Nom trop long (maximum 100 caractères)' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if user is banned
    const userCheck = await db.query('SELECT banned FROM "user" WHERE id = $1', [user.id]);
    if (userCheck.rows.length > 0 && userCheck.rows[0].banned) {
      return new Response(JSON.stringify({ error: 'Compte suspendu' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update user name
    await db.query(
      'UPDATE "user" SET name = $1, updatedAt = NOW() WHERE id = $2',
      [name.trim(), user.id]
    );

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Profil mis à jour avec succès' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    return new Response(JSON.stringify({ error: 'Erreur serveur' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};