import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// POST /api/users - GetOrCreateUser
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username } = body;

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const trimmedUsername = username.trim();

    // Check if user exists
    const existingUsers = await sql`
      SELECT id, username, bio, avatar_url, created_at, password_hash 
      FROM users 
      WHERE LOWER(username) = LOWER(${trimmedUsername})
    `;

    if (existingUsers.length > 0) {
      const user = existingUsers[0];
      return NextResponse.json({
        user,
        token: user.id
      });
    }

    // Create new user
    const newUsers = await sql`
      INSERT INTO users (username) 
      VALUES (${trimmedUsername}) 
      RETURNING id, username, bio, avatar_url, created_at
    `;

    if (newUsers.length > 0) {
      const newUser = newUsers[0];
      return NextResponse.json({
        user: newUser,
        token: newUser.id
      }, { status: 201 });
    }

    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
