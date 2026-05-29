import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// GET /api/categories/slug/[slug]/posts
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    
    const categories = await sql`SELECT id FROM categories WHERE slug = ${slug}`;
    if (categories.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    
    const categoryId = categories[0].id;

    const posts = await sql`
      SELECT p.id, p.title, p.content, p.image_url, p.created_at, p.updated_at, p.category_id, p.user_id,
             row_to_json(u.*) as user, row_to_json(c.*) as category,
             (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      JOIN categories c ON p.category_id = c.id
      WHERE p.category_id = ${categoryId}
      ORDER BY p.created_at DESC
    `;

    const processedPosts = posts.map(post => ({
      ...post,
      comment_count: parseInt(post.comment_count, 10)
    }));

    return NextResponse.json(processedPosts || []);
  } catch (error) {
    console.error('Error fetching category posts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
