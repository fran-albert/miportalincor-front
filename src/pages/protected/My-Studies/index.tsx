import { useStudy } from "@/hooks/Study/useStudy";
import { useStudyAndImageUrls } from "@/hooks/Study/useStudyAndImageUrls";
import useUserRole from "@/hooks/useRoles";
import LoadingAnimation from "@/components/Loading/loading";
import MyStudiesCardComponent from "@/components/My-Studies";

function MyStudiesPage() {
    const { session } = useUserRole();
  const userId = session?.id ? Number(session.id) : undefined;

  const { studiesByUserId = [], isLoadingStudiesByUserId } = useStudy({
    idUser: userId,
    fetchStudiesByUserId: true,
  });

  const { data: allUrls = {}, isLoading: isLoadingUrls } = useStudyAndImageUrls(
    userId,
    studiesByUserId
  );

  if (isLoadingStudiesByUserId || isLoadingUrls) {
    return <LoadingAnimation />;
  }

  return (
    <MyStudiesCardComponent studiesByUserId={studiesByUserId} urls={allUrls} />
  );
}

export default MyStudiesPage;
