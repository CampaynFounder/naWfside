import { NextResponse } from 'next/server';
import { storeUploadFile, triggerTrainingWithPaths } from '../../../../lib/modal-client';
import { isAuthenticated } from '../../../../lib/session';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
const ALLOWED_TYPES = ['audio/wav', 'audio/wave', 'audio/x-wav', 'audio/mpeg', 'audio/mp3'];

async function isAuthorized(request: Request): Promise<boolean> {
  const sessionOk = await isAuthenticated(request);
  if (sessionOk) return true;
  const password = process.env.NAWFSIDE_APP_PASSWORD;
  if (!password) return true;
  const header = request.headers.get('x-train-password');
  return header === password;
}

export async function POST(request: Request) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }
  const file = formData.get('file') as File | null;
  const producerId = (formData.get('producerId') as string)?.trim() || 'test_producer';
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'file is required' }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'File too large (max 50 MB)' }, { status: 400 });
  }
  const type = file.type?.toLowerCase();
  if (type && !ALLOWED_TYPES.some((t) => type.includes(t.split('/')[1]))) {
    const allowed = ALLOWED_TYPES.join(', ');
    return NextResponse.json({ error: `Invalid file type. Allowed: ${allowed}` }, { status: 400 });
  }
  const modelName = (formData.get('modelName') as string)?.trim() || 'nawfside_lora';
  const jobId = (formData.get('jobId') as string)?.trim() || undefined;
  let contentBase64: string;
  try {
    const buf = await file.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    contentBase64 = typeof btoa !== 'undefined' ? btoa(binary) : Buffer.from(bytes).toString('base64');
  } catch (e) {
    return NextResponse.json({ error: 'Failed to read file' }, { status: 400 });
  }
  const filename = file.name || 'audio.wav';
  try {
    const { path } = await storeUploadFile(producerId, jobId || `job_${Date.now()}`, filename, contentBase64);
    const job = await triggerTrainingWithPaths(producerId, [path], { modelName, jobId });
    return NextResponse.json({ job });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Upload/train failed';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
