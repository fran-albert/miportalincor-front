import { getAllStudyWithUrl } from "@/api/Study/get-all-by-study-with-url.action";
import { useQuery } from "@tanstack/react-query";

interface Props {
  auth: boolean;
  userId: string;
}

export const useGetStudyWithUrlByUserId = ({ auth = true, userId }: Props) => {
  const isValidUserId = Boolean(userId && userId.length > 0);

  const { isLoading, isError, error, data, isFetching } = useQuery({
    queryKey: ["studies-by-user-id", { userId }],
    queryFn: () => getAllStudyWithUrl(userId),
    staleTime: 1000 * 60,
    enabled: auth && isValidUserId,
  });

  return {
    isLoading,
    isError, isFetching,
    error,
    data,
  };
};
