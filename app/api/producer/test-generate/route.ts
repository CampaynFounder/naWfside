import { NextResponse } from 'next/server';
import { triggerInference } from '../../../../lib/modal-client';
import { isAuthenticated } from '../../../../lib/session';

/**
 * Producer-only test generation: no credit charge.
 * Lets producers confirm their LoRA produces appropriate output.
 * Requires a valid session (login) or will return 401.
 */
export async function POST(request: Request) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const { producerId, prompt, modelName } = body;
  if (!producerId || !prompt) {
    return NextResponse.json({ error: 'producerId and prompt are required' }, { status: 400 });
  }
  const loraId = `${producerId}:${modelName?.trim() || 'nawfside_lora'}`;
  try {
    const gen = await triggerInference(producerId, loraId, prompt.trim());
    return NextResponse.json({ generation: gen });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Generation failed';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
