import { useCollaborator } from "@/hooks/Collaborator/useCollaborator";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useGetStudyWithUrlByUserId } from "@/hooks/Study/useGetStudyWithUrlByUserId";
import { PatientProfileSkeleton } from "@/components/Skeleton/Patient";
import { PatientStudiesPage as GenericStudiesPage } from "@/components/Studies/Page";
import { PageHeader } from "@/components/PageHeader";
import { FileImage } from "lucide-react";
import { StudiesCardSkeleton } from "@/components/Skeleton/Doctor";
import { parseSlug } from "@/common/helpers/helpers";

const CollaboratorStudiesPage = () => {
  const params = useParams();
  const slug = params.slug as string;
  const { id, formattedName } = parseSlug(slug);

  const {
    collaborator,
    isLoading: isLoadingCollaborator,
    error: collaboratorError,
  } = useCollaborator({
    auth: true,
    id,
  });

  const {
    data: studies,
    isLoading: isLoadingStudies,
    isFetching,
  } = useGetStudyWithUrlByUserId({
    userId: id,
    auth: true,
  });

  const isFirstLoadingCollaborator = isLoadingCollaborator && !collaborator;
  const isFirstLoadingStudies = isLoadingStudies;

  if (isFirstLoadingCollaborator && isFirstLoadingStudies) {
    return (
      <div className="space-y-4 p-6">
        <div className="md:grid md:grid-cols-[320px_1fr] gap-6">
          <PatientProfileSkeleton />
          <StudiesCardSkeleton />
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Incor Laboral", href: "/incor-laboral" },
    { label: "Colaboradores", href: "/incor-laboral/colaboradores" },
    {
      label: formattedName,
      href: `/incor-laboral/colaboradores/${slug}`,
    },
    {
      label: "Estudios Complementarios",
    },
  ];

  return (
    <>
      <Helmet>
        <title>Estudios - {formattedName}</title>
        <meta
          name="description"
          content={`Estudios complementarios del colaborador ${formattedName}.`}
        />
      </Helmet>

      {collaboratorError && (
        <div className="p-4 text-red-500">
          Hubo un error al cargar los datos del colaborador.
        </div>
      )}

      <div className="space-y-6 p-6">
        <PageHeader
          breadcrumbItems={breadcrumbItems}
          title="Estudios Complementarios"
          description={`Laboratorios, imágenes y otros estudios de ${formattedName}`}
          icon={<FileImage className="h-6 w-6" />}
        />

        {studies && (
          <GenericStudiesPage
            userData={collaborator}
            studies={studies}
            loading={isFetching}
            role="colaborador"
            slug={String(slug)}
            idUser={Number(id)}
            showUserInfo={false}
            breadcrumbItems={[]}
            onRefresh={() => {
              window.location.reload();
            }}
          />
        )}
      </div>
    </>
  );
};

export default CollaboratorStudiesPage;
