// utils/imageConverter.ts

/**
 * Convierte una URL de datos base64 a una URL de objeto
 * Esto es útil para manejar imágenes en React PDF que tiene problemas con URLs de datos
 */
export const convertDataUrlToObjectUrl = (dataUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        try {
            // Verificar que sea una URL de datos válida
            if (!dataUrl || !dataUrl.startsWith('data:')) {
                reject(new Error('No es una URL de datos válida'));
                return;
            }

            // Extraer el tipo MIME y los datos base64
            const matches = dataUrl.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);

            if (!matches || matches.length !== 3) {
                reject(new Error('Formato de URL de datos inválido'));
                return;
            }

            const mimeType = matches[1];
            const base64Data = matches[2];

            // Convertir los datos base64 a un array de bytes
            const byteCharacters = atob(base64Data);
            const byteArrays = [];

            for (let offset = 0; offset < byteCharacters.length; offset += 512) {
                const slice = byteCharacters.slice(offset, offset + 512);

                const byteNumbers = new Array(slice.length);
                for (let i = 0; i < slice.length; i++) {
                    byteNumbers[i] = slice.charCodeAt(i);
                }

                const byteArray = new Uint8Array(byteNumbers);
                byteArrays.push(byteArray);
            }

            // Crear un objeto Blob con los datos
            const blob = new Blob(byteArrays, { type: mimeType });

            // Crear una URL de objeto para el Blob
            const objectUrl = URL.createObjectURL(blob);

            resolve(objectUrl);
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Libera una URL de objeto cuando ya no se necesita
 * Importante llamar a esta función para evitar fugas de memoria
 */
export const revokeObjectUrl = (objectUrl: string): void => {
    if (objectUrl && objectUrl.startsWith('blob:')) {
        URL.revokeObjectURL(objectUrl);
    }
};