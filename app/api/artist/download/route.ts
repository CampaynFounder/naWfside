import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase/server';
import { inject_metadata, generate_split_sheet_pdf } from '../../../../modal_app/metadata';

export async function POST(request: Request) {
  // Expect { artistId, generationId }
  const body = await request.json().catch(() => ({}));
  if (!body.artistId || !body.generationId) return NextResponse.json({ error: 'missing' }, { status: 400 });
  // Placeholder: lookup generation, then call metadata injection
  // const gen = await supabaseAdmin.from('generations').select('*').eq('id', body.generationId).single();
  // For now, return not implemented
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
}

