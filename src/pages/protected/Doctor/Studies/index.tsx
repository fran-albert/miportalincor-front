import { useDoctor } from "@/hooks/Doctor/useDoctor";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useGetStudyWithUrlByUserId } from "@/hooks/Study/useGetStudyWithUrlByUserId";
import {
  DoctorDashboardSkeleton,
  StudiesCardSkeleton,
} from "@/components/Skeleton/Doctor";
import { PatientStudiesPage as GenericStudiesPage } from "@/components/Studies/Page";
import BreadcrumbComponent from "@/components/Breadcrumb";

const DoctorStudiesPage = () => {
  const params = useParams();
  const slug = params.slug;
  const slugString = slug as string;
  const slugParts = slugString.split("-");
  const id = slugParts[slugParts.length - 1];

  const {
    doctor,
    isLoading: isLoadingDoctor,
    error: doctorError,
  } = useDoctor({
    auth: true,
    id,
  });

  const {
    data: studies,
    isLoading: isLoadingStudies,
    isFetching,
  } = useGetStudyWithUrlByUserId({
    userId: doctor?.userId ? Number(doctor.userId) : 0,
    auth: true,
  });

  const isFirstLoadingDoctor = isLoadingDoctor && !doctor;
  const isFirstLoadingStudies = isLoadingStudies;

  if (isFirstLoadingDoctor && isFirstLoadingStudies) {
    return (
      <div className="space-y-4 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <DoctorDashboardSkeleton />
          <StudiesCardSkeleton />
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Médicos", href: "/medicos" },
    {
      label: doctor ? `${doctor.firstName} ${doctor.lastName}` : "Médico",
      href: `/medicos/${doctor?.slug}`,
    },
    {
      label: "Estudios Médicos",
      href: `/medicos/${doctor?.slug}/estudios`,
    },
  ];

  return (
    <>
      <Helmet>
        <title>
          {isLoadingDoctor
            ? "Médico"
            : `${doctor?.firstName} ${doctor?.lastName} - Estudios`}
        </title>
        <meta
          name="description"
          content={`Estudios médicos del Dr./Dra. ${doctor?.firstName} ${doctor?.lastName}`}
        />
      </Helmet>

      {doctorError && (
        <div className="p-4 text-red-500">
          Hubo un error al cargar los datos del médico.
        </div>
      )}

      <div className="space-y-6 p-6">
        <BreadcrumbComponent items={breadcrumbItems} />

        {/* Studies Section with Modern Table */}
        {studies && (
          <GenericStudiesPage
            userData={doctor}
            studies={studies}
            loading={isFetching}
            role="medicos"
            slug={String(doctor?.slug)}
            idUser={Number(doctor?.userId)}
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

export default DoctorStudiesPage;
