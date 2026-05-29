import { NextRequest } from 'next/server';
import { sql } from './db';

export async function getUserFromRequest(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    return null;
  }

  try {
    const users = await sql`SELECT id, username, bio, avatar_url, created_at FROM users WHERE id = ${token}`;
    if (users.length === 0) {
      return null;
    }
    return users[0];
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}
