import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/posts/[id]/comments
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const comments = await sql`
      SELECT c.id, c.content, c.created_at, c.updated_at, c.post_id, c.user_id,
             row_to_json(u.*) as user
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ${id}
      ORDER BY c.created_at ASC
    `;

    return NextResponse.json(comments || []);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/posts/[id]/comments
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getUserFromRequest(req);
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
    }

    const newComments = await sql`
      INSERT INTO comments (content, post_id, user_id)
      VALUES (${content}, ${id}, ${user.id})
      RETURNING id, content, created_at, updated_at, post_id, user_id
    `;

    if (newComments.length > 0) {
      // Fetch the full comment with user data
      const fullComment = await sql`
        SELECT c.id, c.content, c.created_at, c.updated_at, c.post_id, c.user_id,
               row_to_json(u.*) as user
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.id = ${newComments[0].id}
      `;
      return NextResponse.json(fullComment[0], { status: 201 });
    }

    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
