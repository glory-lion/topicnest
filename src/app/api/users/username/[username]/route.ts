import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// GET /api/users/username/[username]
export async function GET(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  try {
    const { username } = await params;

    const users = await sql`
      SELECT id, username, bio, avatar_url, created_at 
      FROM users 
      WHERE LOWER(username) = LOWER(${username})
    `;

    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(users[0]);
  } catch (error) {
    console.error('Error fetching user by username:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
