import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// GET /api/users/[id]/stats
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const users = await sql`
      SELECT id, username, bio, avatar_url, created_at 
      FROM users 
      WHERE id = ${id}
    `;

    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const postCountResult = await sql`SELECT COUNT(*) FROM posts WHERE user_id = ${id}`;
    const commentCountResult = await sql`SELECT COUNT(*) FROM comments WHERE user_id = ${id}`;

    return NextResponse.json({
      ...users[0],
      post_count: parseInt(postCountResult[0].count, 10),
      comment_count: parseInt(commentCountResult[0].count, 10),
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
