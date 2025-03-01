import { uploadStudyCollaborator } from "@/api/Study/Collaborator/upload-study.collaborator.action";
import { StudySection } from "@/types/Study/Study";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import SuccessToast from "@/components/Toast/Success";
import ErrorToast from "@/components/Toast/Error";
import LoadingToast from "@/components/Toast/Loading";

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

  return useMutation<UploadResponse, Error, UploadVariables>({
    mutationFn: uploadStudyCollaborator,

    onMutate: async (variables) => {
      const studyType = variables.formData.get("studyType") as string;

      if (studyType) {
        toast.loading(<LoadingToast message={`Cargando ${studyType}...`} />, {
          id: "upload-toast",
        });
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

      toast.success(
        <SuccessToast message={`${studyType} subido con éxito`} />,
        {
          id: "upload-toast",
        }
      );
    },

    onError: (error: Error) => {
      toast.error(<ErrorToast message="Error al subir el estudio" />, {
        id: "upload-toast",
      });

      console.error("Error uploading study:", error.message);
    },
  });
};
