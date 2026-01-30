const MODAL_TRAIN_WEB_URL = process.env.MODAL_TRAIN_WEB_URL ?? '';
const MODAL_GENERATE_WEB_URL = process.env.MODAL_GENERATE_WEB_URL ?? '';
const MODAL_STORE_UPLOAD_WEB_URL = process.env.MODAL_STORE_UPLOAD_WEB_URL ?? '';

export async function storeUploadFile(
  producerId: string,
  jobId: string,
  filename: string,
  contentBase64: string
): Promise<{ path: string; producer_id: string; job_id: string }> {
  if (!MODAL_STORE_UPLOAD_WEB_URL) {
    throw new Error('MODAL_STORE_UPLOAD_WEB_URL not set');
  }
  const res = await fetch(MODAL_STORE_UPLOAD_WEB_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      producer_id: producerId,
      job_id: jobId,
      filename,
      content_base64: contentBase64,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (data.error) {
    throw new Error(data.error);
  }
  return { path: data.path, producer_id: data.producer_id, job_id: data.job_id };
}

export async function triggerTraining(producerId: string, uploadUrls: string[], options?: { modelName?: string; metadataPerFile?: unknown[]; jobId?: string }) {
  if (!MODAL_TRAIN_WEB_URL) {
    return { jobId: `job_${producerId}_train`, error: 'MODAL_TRAIN_WEB_URL not set' };
  }
  const res = await fetch(MODAL_TRAIN_WEB_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      producer_id: producerId,
      upload_urls: uploadUrls,
      model_name: options?.modelName ?? 'nawfside_lora',
      metadata_per_file: options?.metadataPerFile,
      job_id: options?.jobId,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (data.error) {
    throw new Error(data.error);
  }
  return { jobId: data.job_id ?? data.jobId ?? `job_${producerId}_train`, ...data };
}

export async function triggerTrainingWithPaths(
  producerId: string,
  uploadPaths: string[],
  options?: { modelName?: string; jobId?: string }
) {
  if (!MODAL_TRAIN_WEB_URL) {
    return { jobId: `job_${producerId}_train`, error: 'MODAL_TRAIN_WEB_URL not set' };
  }
  const res = await fetch(MODAL_TRAIN_WEB_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      producer_id: producerId,
      upload_paths: uploadPaths,
      model_name: options?.modelName ?? 'nawfside_lora',
      job_id: options?.jobId,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (data.error) {
    throw new Error(data.error);
  }
  return { jobId: data.job_id ?? data.jobId ?? `job_${producerId}_train`, ...data };
}

export async function triggerInference(artistId: string, loraId: string, prompt: string, options?: { durationSeconds?: number }) {
  if (!MODAL_GENERATE_WEB_URL) {
    return { generationId: `gen_${artistId}_${Date.now()}`, audioUrl: null, error: 'MODAL_GENERATE_WEB_URL not set' };
  }
  const res = await fetch(MODAL_GENERATE_WEB_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      lora_id: loraId,
      duration_seconds: options?.durationSeconds ?? 60,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (data.error) {
    throw new Error(data.error);
  }
  const audioBase64 = data.audio_base64;
  const generationId = `gen_${artistId}_${Date.now()}`;
  return {
    generationId,
    audioUrl: audioBase64 ? `data:audio/wav;base64,${audioBase64}` : null,
    audioBase64: audioBase64 ?? null,
  };
}

