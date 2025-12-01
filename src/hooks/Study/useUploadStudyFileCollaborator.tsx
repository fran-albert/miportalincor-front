import { uploadStudyCollaborator } from "@/api/Study/Collaborator/upload-study.collaborator.action";
import { StudySection } from "@/types/Study/Study";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useToastContext } from "@/hooks/Toast/toast-context";
import type { AxiosError } from "axios";
import { useRef } from "react";

interface Props {
  collaboratorId: number;
  setSections?: React.Dispatch<React.SetStateAction<StudySection[]>>;
}

interface UploadVariables {
  collaboratorId: number;
  formData: FormData;
}

interface UploadResponse {
  url: string;
}

export const useUploadStudyFileMutation = ({
  collaboratorId,
  setSections,
}: Props) => {
  const queryClient = useQueryClient();
  const { showLoading, showSuccess, showError, removeToast } = useToastContext();
  const toastIdRef = useRef<string | null>(null);

  return useMutation<
    UploadResponse,
    AxiosError<{ message: string }>,
    UploadVariables
  >({
    mutationFn: uploadStudyCollaborator,

    onMutate: async (variables) => {
      const studyType = variables.formData.get("studyType") as string;

      if (studyType) {
        toastIdRef.current = showLoading("Subiendo estudio", `Cargando ${studyType}...`);
      }
    },

    onSuccess: (data: UploadResponse, variables: UploadVariables) => {
      const studyType = variables.formData.get("studyType") as string;
      if (!studyType) return;

      const urlParts = data.url.split("/");
      const fileName = urlParts[urlParts.length - 1].split("?")[0];

      if (setSections) {
        setSections((prev: StudySection[]) =>
          prev.map((section: StudySection) =>
            section.title.toLowerCase() === studyType.toLowerCase() ||
            section.id === studyType.toLowerCase().replace(/\s/g, "-")
              ? {
                  ...section,
                  files: [...section.files, { name: fileName, url: data.url }],
                }
              : section
          )
        );
      }
      queryClient.invalidateQueries({
        queryKey: ["studies-by-collaborator-id", collaboratorId],
      });
      queryClient.invalidateQueries({
        queryKey: ["collaborator-medical-evaluation", { collaboratorId }],
      });

      if (toastIdRef.current) {
        removeToast(toastIdRef.current);
      }
      showSuccess("Estudio subido", `${studyType} subido con éxito`);
    },

    onError: (error: AxiosError<{ message: string }>) => {
      const backendMsg = error.response?.data?.message;

      if (toastIdRef.current) {
        removeToast(toastIdRef.current);
      }
      showError("Error al subir", backendMsg ?? "Error al subir el estudio");

      console.error("Error uploading study:", error.message);
    },
  });
};
