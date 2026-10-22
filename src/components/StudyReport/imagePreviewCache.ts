// Las imágenes de un estudio no cambian: el id es el del PACS (Orthanc) o
// "upload-<uuid>" para las que subió recepción. Se guardan por id para que la
// galería del editor, el panel de dividir y el de huérfanos no vuelvan a
// bajar las mismas imágenes en la sesión (en la clínica cada una tarda
// varios segundos).
const MAX_ENTRIES = 300;

const cache = new Map<string, Promise<Blob>>();

export const getCachedImagePreview = (
  instanceId: string,
  fetchPreview: () => Promise<Blob>,
): Promise<Blob> => {
  const cached = cache.get(instanceId);
  if (cached) return cached;

  const request = fetchPreview().catch((error: unknown) => {
    // Una falla no queda guardada: el próximo intento vuelve a pedirla.
    cache.delete(instanceId);
    throw error;
  });
  cache.set(instanceId, request);
  if (cache.size > MAX_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  return request;
};

export const clearImagePreviewCache = (): void => {
  cache.clear();
};
