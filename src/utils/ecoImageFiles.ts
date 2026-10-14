/**
 * El ecógrafo exporta JPG o BMP. La API acepta JPG y PNG: el BMP se pasa a
 * JPG acá, en el navegador, antes de subirlo (pesa ~10 veces menos y no hace
 * falta una librería de imágenes en el servidor).
 */
export const ACCEPTED_ECO_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".bmp"];
export const MAX_ECO_IMAGE_BYTES = 15 * 1024 * 1024;
export const MAX_ECO_IMAGES_PER_UPLOAD = 50;

const extensionOf = (name: string): string => {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot).toLowerCase();
};

export const isAcceptedEcoImage = (file: File): boolean =>
  ACCEPTED_ECO_IMAGE_EXTENSIONS.includes(extensionOf(file.name)) ||
  ["image/jpeg", "image/png", "image/bmp", "image/x-ms-bmp"].includes(
    file.type,
  );

export const isBmp = (file: File): boolean =>
  extensionOf(file.name) === ".bmp" ||
  file.type === "image/bmp" ||
  file.type === "image/x-ms-bmp";

const jpegName = (name: string): string => {
  const dot = name.lastIndexOf(".");
  return `${dot === -1 ? name : name.slice(0, dot)}.jpg`;
};

/** Pasa un BMP a JPG con un canvas. Los demás formatos vuelven tal cual. */
export const toUploadableEcoImage = async (file: File): Promise<File> => {
  if (!isBmp(file)) return file;
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("No se pudo convertir la imagen BMP");
    context.drawImage(bitmap, 0, 0);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.92),
    );
    if (!blob) throw new Error("No se pudo convertir la imagen BMP");
    return new File([blob], jpegName(file.name), { type: "image/jpeg" });
  } finally {
    bitmap.close();
  }
};
