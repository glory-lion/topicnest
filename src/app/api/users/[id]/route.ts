import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/users/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Check if the user is asking for "me"
    if (id === 'me') {
      const user = await getUserFromRequest(req);
      if (!user) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }
      return NextResponse.json(user);
    }

    const users = await sql`
      SELECT id, username, bio, avatar_url, created_at 
      FROM users 
      WHERE id = ${id}
    `;

    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(users[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/users/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const authenticatedUser = await getUserFromRequest(req);
    
    if (!authenticatedUser || authenticatedUser.id !== id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { bio, avatar_url } = body;

    const updatedUsers = await sql`
      UPDATE users 
      SET bio = COALESCE(${bio}, bio), avatar_url = COALESCE(${avatar_url}, avatar_url)
      WHERE id = ${id}
      RETURNING id, username, bio, avatar_url, created_at
    `;

    if (updatedUsers.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(updatedUsers[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
