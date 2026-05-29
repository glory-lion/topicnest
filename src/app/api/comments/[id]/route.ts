import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// DELETE /api/comments/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getUserFromRequest(req);
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Verify ownership
    const existingComments = await sql`SELECT user_id FROM comments WHERE id = ${id}`;
    if (existingComments.length === 0) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }
    
    if (existingComments[0].user_id !== user.id) {
      return NextResponse.json({ error: 'You are not authorized to delete this comment' }, { status: 403 });
    }

    await sql`DELETE FROM comments WHERE id = ${id}`;

    return NextResponse.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
