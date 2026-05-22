import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';

// MVP: auto-join on /join, this is a placeholder for future approval flow
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireUser();
    const { id } = await params;
    // Placeholder — approval not needed for MVP
    return NextResponse.json({ message: 'MVP auto-joins on /join', guildId: id });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
