import { getSignedUrlByCollaboratorIdAndFileName } from "@/api/Study/Collaborator/get-signed-url.collaborators.action";
import { useQuery } from "@tanstack/react-query";

interface Props {
  auth: boolean;
  fileName: string;
  collaboratorId: number;
}

export const useGetSignedUrlByCollaboratorIdAndFileName = ({
  auth = true,
  collaboratorId,
  fileName,
}: Props) => {
  const { isLoading, isError, error, data } = useQuery({
    queryKey: ["fileName", { collaboratorId, fileName }],
    queryFn: () =>
      getSignedUrlByCollaboratorIdAndFileName(collaboratorId, fileName),
    staleTime: 1000 * 60,
    enabled: auth,
  });

  return {
    isLoading,
    isError,
    error,
    data,
  };
};
