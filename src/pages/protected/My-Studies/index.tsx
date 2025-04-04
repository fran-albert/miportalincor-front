import useUserRole from "@/hooks/useRoles";
import LoadingAnimation from "@/components/Loading/loading";
import MyStudiesCardComponent from "@/components/My-Studies";
import { Helmet } from "react-helmet-async";
import { useGetStudyWithUrlByUserId } from "@/hooks/Study/useGetStudyWithUrlByUserId";

function MyStudiesPage() {
  const { session } = useUserRole();
  const userId = session?.id ? Number(session.id) : undefined;

  const { data: studies, isLoading: isLoadingStudies } =
    useGetStudyWithUrlByUserId({
      userId: Number(userId),
      auth: true,
    });

  if (isLoadingStudies) {
    return <LoadingAnimation />;
  }

  return (
    <>
      <Helmet>
        <title>Mis Estudios</title>
      </Helmet>
      {studies && <MyStudiesCardComponent studies={studies} />}
    </>
  );
}

export default MyStudiesPage;
