import { useState, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToastContext } from "@/hooks/Toast/toast-context";
import {
    uploadStudyWithProgress,
    subscribeToUploadProgress,
    UploadProgress,
} from "@/api/Study/Collaborator/upload-study.collaborator.action";

interface UseUploadStudyWithProgressProps {
    collaboratorId: number;
    onSuccess?: (url: string) => void;
    onError?: (error: string) => void;
    onProgress?: (progress: number, message: string) => void;
}

interface UploadState {
    isUploading: boolean;
    progress: number;
    status: UploadProgress["status"] | "idle";
    message: string;
    currentStep?: number;
    totalSteps?: number;
}

export const useUploadStudyWithProgress = ({
    collaboratorId,
    onSuccess,
    onError,
    onProgress,
}: UseUploadStudyWithProgressProps) => {
    const queryClient = useQueryClient();
    const { showSuccess, showError } = useToastContext();
    const closeSSERef = useRef<(() => void) | null>(null);

    const [uploadState, setUploadState] = useState<UploadState>({
        isUploading: false,
        progress: 0,
        status: "idle",
        message: "",
    });

    const upload = useCallback(
        async (formData: FormData) => {
            // Reset state
            setUploadState({
                isUploading: true,
                progress: 0,
                status: "uploading",
                message: "Iniciando subida...",
            });

            try {
                // Iniciar upload y obtener uploadId
                const { uploadId } = await uploadStudyWithProgress({
                    collaboratorId,
                    formData,
                });

                // Suscribirse al stream de progreso
                closeSSERef.current = subscribeToUploadProgress(
                    uploadId,
                    // onProgress
                    (progressData: UploadProgress) => {
                        setUploadState({
                            isUploading: true,
                            progress: progressData.progress,
                            status: progressData.status,
                            message: progressData.message,
                            currentStep: progressData.currentStep,
                            totalSteps: progressData.totalSteps,
                        });
                        // Llamar al callback del componente
                        onProgress?.(progressData.progress, progressData.message);
                    },
                    // onComplete
                    (url: string) => {
                        setUploadState({
                            isUploading: false,
                            progress: 100,
                            status: "completed",
                            message: "Completado",
                        });

                        // Invalidar queries
                        queryClient.invalidateQueries({
                            queryKey: ["studies-by-collaborator-id", collaboratorId],
                        });
                        queryClient.invalidateQueries({
                            queryKey: ["collaborator-medical-evaluation", { collaboratorId }],
                        });

                        const studyType = formData.get("studyType") as string;
                        showSuccess("Estudio subido", `${studyType} subido con éxito`);

                        onSuccess?.(url);
                        closeSSERef.current = null;
                    },
                    // onError
                    (error: string) => {
                        setUploadState({
                            isUploading: false,
                            progress: 0,
                            status: "error",
                            message: error,
                        });

                        showError("Error al subir", error);
                        onError?.(error);
                        closeSSERef.current = null;
                    }
                );
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Error al iniciar la subida";
                setUploadState({
                    isUploading: false,
                    progress: 0,
                    status: "error",
                    message: errorMessage,
                });
                showError("Error al subir", errorMessage);
                onError?.(errorMessage);
            }
        },
        [collaboratorId, queryClient, showSuccess, showError, onSuccess, onError]
    );

    const cancel = useCallback(() => {
        if (closeSSERef.current) {
            closeSSERef.current();
            closeSSERef.current = null;
        }
        setUploadState({
            isUploading: false,
            progress: 0,
            status: "idle",
            message: "",
        });
    }, []);

    return {
        upload,
        cancel,
        ...uploadState,
    };
};
