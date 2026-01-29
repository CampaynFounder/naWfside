export async function triggerTraining(producerId: string, uploadUrls: string[]) {
  // Call Modal training function via Modal SDK or REST proxy.
  // Placeholder implementation: return a fake job id.
  return { jobId: `job_${producerId}_train` };
}

export async function triggerInference(artistId: string, loraId: string, prompt: string) {
  // Placeholder: return a signed URL for generated audio
  return { generationId: `gen_${artistId}_${Date.now()}`, audioUrl: null };
}

