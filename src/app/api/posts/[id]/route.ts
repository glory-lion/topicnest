import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/posts/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const posts = await sql`
      SELECT p.id, p.title, p.content, p.image_url, p.created_at, p.updated_at, p.category_id, p.user_id,
             row_to_json(u.*) as user, row_to_json(c.*) as category,
             (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      JOIN categories c ON p.category_id = c.id
      WHERE p.id = ${id}
    `;

    if (posts.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const post = posts[0];
    post.comment_count = parseInt(post.comment_count, 10);

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/posts/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getUserFromRequest(req);
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Verify ownership
    const existingPosts = await sql`SELECT user_id FROM posts WHERE id = ${id}`;
    if (existingPosts.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    if (existingPosts[0].user_id !== user.id) {
      return NextResponse.json({ error: 'You are not authorized to update this post' }, { status: 403 });
    }

    const body = await req.json();
    const { title, content, image_url } = body;

    const updatedPosts = await sql`
      UPDATE posts 
      SET title = COALESCE(${title}, title), 
          content = COALESCE(${content}, content), 
          image_url = COALESCE(${image_url}, image_url),
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, title, content, image_url, created_at, updated_at, category_id, user_id
    `;

    return NextResponse.json(updatedPosts[0]);
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/posts/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getUserFromRequest(req);
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Verify ownership
    const existingPosts = await sql`SELECT user_id FROM posts WHERE id = ${id}`;
    if (existingPosts.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    if (existingPosts[0].user_id !== user.id) {
      return NextResponse.json({ error: 'You are not authorized to delete this post' }, { status: 403 });
    }

    // Delete related records manually to simulate cascade
    await sql`DELETE FROM bookmarks WHERE post_id = ${id}`;
    await sql`DELETE FROM comments WHERE post_id = ${id}`;

    await sql`DELETE FROM posts WHERE id = ${id}`;

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
