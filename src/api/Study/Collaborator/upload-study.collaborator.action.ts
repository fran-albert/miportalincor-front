import { apiLaboral } from "@/services/axiosConfig";
import { environment } from "@/config/environment";

interface Props {
    collaboratorId: number;
    formData: FormData;
}

export interface UploadProgress {
    uploadId: string;
    status: 'uploading' | 'processing' | 'converting' | 'completed' | 'error';
    progress: number;
    message: string;
    currentStep?: number;
    totalSteps?: number;
    url?: string;
    error?: string;
}

export const uploadStudyCollaborator = async (values: Props): Promise<{ url: string }> => {
    const { data } = await apiLaboral.post<{ url: string }>(
        `file/upload-study`,
        values.formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    }
    )
    return data;
}

/**
 * Inicia la subida de un estudio con reporte de progreso via SSE.
 * Retorna el uploadId para conectar al stream de progreso.
 */
export const uploadStudyWithProgress = async (values: Props): Promise<{ uploadId: string }> => {
    const { data } = await apiLaboral.post<{ uploadId: string }>(
        `file/upload-study-with-progress`,
        values.formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );
    return data;
};

/**
 * Crea una conexión SSE para recibir actualizaciones de progreso.
 * @param uploadId - ID del upload obtenido de uploadStudyWithProgress
 * @param onProgress - Callback que se llama con cada actualización de progreso
 * @param onComplete - Callback que se llama cuando el proceso termina exitosamente
 * @param onError - Callback que se llama cuando hay un error
 * @returns Función para cerrar la conexión SSE
 */
export const subscribeToUploadProgress = (
    uploadId: string,
    onProgress: (progress: UploadProgress) => void,
    onComplete: (url: string) => void,
    onError: (error: string) => void
): (() => void) => {
    const baseUrl = environment.API_INCOR_LABORAL_URL.replace(/\/$/, '');

    // Crear URL con el token como query param (SSE no soporta headers custom)
    const url = `${baseUrl}/file/upload-progress/${uploadId}`;

    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
        try {
            const progress: UploadProgress = JSON.parse(event.data);
            onProgress(progress);

            if (progress.status === 'completed' && progress.url) {
                onComplete(progress.url);
                eventSource.close();
            } else if (progress.status === 'error') {
                onError(progress.error || progress.message);
                eventSource.close();
            }
        } catch (err) {
            console.error('Error parsing SSE message:', err);
        }
    };

    eventSource.onerror = (err) => {
        console.error('SSE connection error:', err);
        onError('Error de conexión con el servidor');
        eventSource.close();
    };

    // Retornar función para cerrar la conexión
    return () => {
        eventSource.close();
    };
};
