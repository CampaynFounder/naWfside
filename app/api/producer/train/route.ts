import { NextResponse } from 'next/server';
import { triggerTraining } from '../../../../lib/modal-client';

export async function POST(request: Request) {
  // Expect JSON body { producerId, uploadUrls }
  const body = await request.json().catch(() => ({}));
  if (!body.producerId || !body.uploadUrls) {
    return NextResponse.json({ error: 'producerId and uploadUrls are required' }, { status: 400 });
  }
  const job = await triggerTraining(body.producerId, body.uploadUrls);
  return NextResponse.json({ job });
}

