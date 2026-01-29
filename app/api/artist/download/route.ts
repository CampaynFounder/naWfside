import { NextResponse } from 'next/server';
// Metadata injection and split-sheet PDF are implemented in modal_app/metadata.py;
// this route will call Modal or a backend service when wired up.
export async function POST(request: Request) {
  // Expect { artistId, generationId }
  const body = await request.json().catch(() => ({}));
  if (!body.artistId || !body.generationId) return NextResponse.json({ error: 'missing' }, { status: 400 });
  // TODO: lookup generation via supabaseAdmin, then call Modal metadata endpoint
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
}

