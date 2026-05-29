import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// GET /api/search
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    const posts = await sql`
      SELECT p.id, p.title, p.content, p.image_url, p.created_at, p.updated_at, p.category_id, p.user_id,
             row_to_json(u.*) as user, row_to_json(c.*) as category,
             (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      JOIN categories c ON p.category_id = c.id
      WHERE p.title ILIKE ${'%' + query + '%'} OR p.content ILIKE ${'%' + query + '%'}
      ORDER BY p.created_at DESC
    `;

    const processedPosts = posts.map(post => ({
      ...post,
      comment_count: parseInt(post.comment_count, 10)
    }));

    return NextResponse.json(processedPosts || []);
  } catch (error) {
    console.error('Error searching posts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
