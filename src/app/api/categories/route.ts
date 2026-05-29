import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// GET /api/categories
export async function GET(req: NextRequest) {
  try {
    const categories = await sql`
      SELECT id, name, slug, description, icon, gradient, glow_color, created_at 
      FROM categories 
      ORDER BY name ASC
    `;
    return NextResponse.json(categories || []);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/categories
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, icon, gradient, glow_color } = body;

    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const newCategories = await sql`
      INSERT INTO categories (name, slug, description, icon, gradient, glow_color)
      VALUES (${name}, ${slug}, ${description || null}, ${icon || '📁'}, ${gradient || null}, ${glow_color || null})
      RETURNING id, name, slug, description, icon, gradient, glow_color, created_at
    `;

    return NextResponse.json(newCategories[0], { status: 201 });
  } catch (error: any) {
    console.error('Error creating category:', error);
    if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
      return NextResponse.json({ error: 'A category with this name already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
