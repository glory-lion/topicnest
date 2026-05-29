import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// GET /api/categories/slug/[slug]
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const categories = await sql`
      SELECT id, name, slug, description, icon, gradient, glow_color, created_at 
      FROM categories 
      WHERE slug = ${slug}
    `;

    if (categories.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json(categories[0]);
  } catch (error) {
    console.error('Error fetching category by slug:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
