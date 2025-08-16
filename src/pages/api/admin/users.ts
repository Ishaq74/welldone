export const prerender = false;
import { db } from "@lib/db";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ request, url }) => {
  try {
    // Parse query parameters
    const params = new URLSearchParams(url.search);
    const page = parseInt(params.get('page') || '1');
    const pageSize = Math.min(parseInt(params.get('pageSize') || '20'), 100); // Max 100 per page
    const offset = (page - 1) * pageSize;
    
    const roleFilter = params.get('role') || null;
    const bannedFilter = params.get('banned');
    const searchTerm = params.get('search') || null;

    // Build the query conditions
    const conditions: string[] = [];
    const values: any[] = [];
    let valueIndex = 1;

    if (roleFilter) {
      conditions.push(`role = $${valueIndex++}`);
      values.push(roleFilter);
    }

    if (bannedFilter !== null) {
      conditions.push(`banned = $${valueIndex++}`);
      values.push(bannedFilter === 'true');
    }

    if (searchTerm) {
      conditions.push(`(LOWER(name) LIKE LOWER($${valueIndex}) OR LOWER(email) LIKE LOWER($${valueIndex}))`);
      values.push(`%${searchTerm}%`);
      valueIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) as count FROM "user" ${whereClause}`;
    const countResult = await db.query(countQuery, values);
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / pageSize);

    // Get paginated users
    const usersQuery = `
      SELECT id, name, email, role, banned, banReason, banExpires, createdAt, updatedAt
      FROM "user"
      ${whereClause}
      ORDER BY createdAt DESC
      LIMIT $${valueIndex} OFFSET $${valueIndex + 1}
    `;
    
    const usersResult = await db.query(usersQuery, [...values, pageSize, offset]);

    return new Response(JSON.stringify({
      users: usersResult.rows,
      totalCount,
      totalPages,
      currentPage: page,
      pageSize
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return new Response(JSON.stringify({ error: 'Erreur serveur' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};