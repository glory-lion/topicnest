import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/posts
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('category_id');
    const userId = searchParams.get('user_id');

    let posts;
    
    // Base query that joins user and category
    if (categoryId) {
      posts = await sql`
        SELECT p.id, p.title, p.content, p.image_url, p.created_at, p.updated_at, p.category_id, p.user_id,
               row_to_json(u.*) as user, row_to_json(c.*) as category,
               (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
        FROM posts p
        JOIN users u ON p.user_id = u.id
        JOIN categories c ON p.category_id = c.id
        WHERE p.category_id = ${categoryId}
        ORDER BY p.created_at DESC
      `;
    } else if (userId) {
      posts = await sql`
        SELECT p.id, p.title, p.content, p.image_url, p.created_at, p.updated_at, p.category_id, p.user_id,
               row_to_json(u.*) as user, row_to_json(c.*) as category,
               (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
        FROM posts p
        JOIN users u ON p.user_id = u.id
        JOIN categories c ON p.category_id = c.id
        WHERE p.user_id = ${userId}
        ORDER BY p.created_at DESC
      `;
    } else {
      posts = await sql`
        SELECT p.id, p.title, p.content, p.image_url, p.created_at, p.updated_at, p.category_id, p.user_id,
               row_to_json(u.*) as user, row_to_json(c.*) as category,
               (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
        FROM posts p
        JOIN users u ON p.user_id = u.id
        JOIN categories c ON p.category_id = c.id
        ORDER BY p.created_at DESC
      `;
    }

    // Process comment_count to be integer
    const processedPosts = posts.map(post => ({
      ...post,
      comment_count: parseInt(post.comment_count, 10)
    }));

    return NextResponse.json(processedPosts || []);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/posts
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { title, content, category_id, image_url } = body;

    if (!title || !content || !category_id) {
      return NextResponse.json({ error: 'Title, content, and category_id are required' }, { status: 400 });
    }

    const newPosts = await sql`
      INSERT INTO posts (title, content, category_id, user_id, image_url)
      VALUES (${title}, ${content}, ${category_id}, ${user.id}, ${image_url || null})
      RETURNING id, title, content, image_url, created_at, updated_at, category_id, user_id
    `;

    return NextResponse.json(newPosts[0], { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
