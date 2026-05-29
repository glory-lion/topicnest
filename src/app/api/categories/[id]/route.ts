import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// GET /api/categories/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const categories = await sql`
      SELECT id, name, slug, description, icon, gradient, glow_color, created_at 
      FROM categories 
      WHERE id = ${id}
    `;

    if (categories.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json(categories[0]);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/categories/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Delete related records manually to simulate Go backend CASCADE
    await sql`DELETE FROM bookmarks WHERE post_id IN (SELECT id FROM posts WHERE category_id = ${id})`;
    await sql`DELETE FROM comments WHERE post_id IN (SELECT id FROM posts WHERE category_id = ${id})`;
    // Note: votes table wasn't actually created in schema, but included in Go backend manually. Skip it or add it if it exists
    await sql`DELETE FROM posts WHERE category_id = ${id}`;

    const result = await sql`DELETE FROM categories WHERE id = ${id} RETURNING id`;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
