import { useQuery } from "@tanstack/react-query";
import { getStudyInboxCounts } from "@/api/StudyInbox/get-study-inbox-counts.action";
import { StudyInboxCounts } from "@/types/StudyInbox/StudyInbox.types";

// La bandeja recibe correos en cualquier momento: los conteos de las pestañas
// se refrescan solos para que la secretaria no tenga que recargar la página.
export const INBOX_REFRESH_INTERVAL_MS = 30_000;

export const useStudyInboxCounts = (): {
  counts: StudyInboxCounts | undefined;
} => {
  const { data } = useQuery({
    queryKey: ["study-inbox-counts"],
    queryFn: getStudyInboxCounts,
    refetchInterval: INBOX_REFRESH_INTERVAL_MS,
    staleTime: 1000 * 15,
  });

  return { counts: data?.counts };
};
