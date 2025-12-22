import useUserRole from "@/hooks/useRoles";
import LoadingAnimation from "@/components/Loading/loading";
import { PersonalStudiesPage } from "@/components/Studies/Page";
import { Helmet } from "react-helmet-async";
import { useGetStudyWithUrlByUserId } from "@/hooks/Study/useGetStudyWithUrlByUserId";

function MyStudiesPage() {
  const { session } = useUserRole();
  const userId = session?.id || "";

  const { data: studies, isLoading: isLoadingStudies } =
    useGetStudyWithUrlByUserId({
      userId,
      auth: true,
    });

  if (isLoadingStudies) {
    return <LoadingAnimation />;
  }

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Mis Estudios", href: "/mis-estudios" },
  ];

  return (
    <>
      <Helmet>
        <title>Mis Estudios</title>
      </Helmet>
      {studies && (
        <PersonalStudiesPage
          studies={studies}
          loading={isLoadingStudies}
          breadcrumbItems={breadcrumbItems}
        />
      )}
    </>
  );
}

export default MyStudiesPage;
