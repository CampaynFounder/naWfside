import { NextResponse } from 'next/server';
import { getCreditBalance, chargeCredits } from '../../../../lib/credits';
import { triggerInference } from '../../../../lib/modal-client';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { artistId, loraId, prompt } = body;
  if (!artistId || !loraId || !prompt) return NextResponse.json({ error: 'missing fields' }, { status: 400 });
  const balance = await getCreditBalance(artistId);
  if (Number(balance) <= 0) return NextResponse.json({ error: 'insufficient credits' }, { status: 402 });
  // charge 1 credit (placeholder)
  await chargeCredits(artistId, 1);
  const gen = await triggerInference(artistId, loraId, prompt);
  return NextResponse.json({ generation: gen });
}

