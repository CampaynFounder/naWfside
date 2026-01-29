export async function triggerTrain(payload: { producerId: string; uploadUrls: string[] }) {
  const res = await fetch('/api/producer/train', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function createCheckout(payload: { quantity?: number; success_url?: string; cancel_url?: string }) {
  const res = await fetch('/api/credits/purchase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function generateBeat(payload: { artistId: string; loraId: string; prompt: string }) {
  const res = await fetch('/api/artist/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

