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

    // Get user's active sessions
    const sessionsQuery = `
      SELECT id, createdAt, updatedAt, expiresAt, ipAddress, userAgent
      FROM "session" 
      WHERE userId = $1 AND expiresAt > NOW()
      ORDER BY updatedAt DESC
    `;
    
    const sessionsResult = await db.query(sessionsQuery, [user.id]);
    
    const sessions = sessionsResult.rows.map(session => ({
      id: session.id,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      expiresAt: session.expiresAt,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      isCurrent: false // We'll determine this client-side or by token
    }));

    return new Response(JSON.stringify({
      sessions,
      totalCount: sessions.length
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error fetching user sessions:', error);
    return new Response(JSON.stringify({ error: 'Erreur serveur' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const DELETE: APIRoute = async ({ request, locals }) => {
  try {
    const user = locals.user;
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Non authentifié' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json();
    const { sessionId, revokeAll } = body;

    if (revokeAll) {
      // Revoke all sessions except current one
      // This is tricky because we need to identify current session
      await db.query(
        'DELETE FROM "session" WHERE userId = $1',
        [user.id]
      );
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Toutes les sessions ont été révoquées' 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      
    } else if (sessionId) {
      // Revoke specific session
      const result = await db.query(
        'DELETE FROM "session" WHERE id = $1 AND userId = $2',
        [sessionId, user.id]
      );
      
      if (result.rowCount === 0) {
        return new Response(JSON.stringify({ error: 'Session non trouvée' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Session révoquée avec succès' 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      
    } else {
      return new Response(JSON.stringify({ error: 'sessionId ou revokeAll requis' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Error revoking sessions:', error);
    return new Response(JSON.stringify({ error: 'Erreur serveur' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};