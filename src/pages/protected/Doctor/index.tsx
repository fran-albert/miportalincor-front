import { useDoctor } from "@/hooks/Doctor/useDoctor";
import { DoctorComponent } from "@/components/Doctors/Component";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useGetStudyWithUrlByUserId } from "@/hooks/Study/useGetStudyWithUrlByUserId";
import {
  PatientCardSkeleton,
  StudiesCardSkeleton,
} from "@/components/Skeleton/Patient";

function DoctorPage() {
  const params = useParams();
  const slug = params.slug;
  const slugString = slug as string;
  const slugParts = slugString.split("-");
  const id = parseInt(slugParts[slugParts.length - 1], 10);
  const {
    isLoading: isLoadingDoctor,
    doctor,
    error,
  } = useDoctor({
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

  const isFirstLoadingPatient = isLoadingDoctor && !doctor;
  const isFirstLoadingStudies = isLoadingStudies;

  if (isFirstLoadingPatient && isFirstLoadingStudies) {
    return (
      <div className="container space-y-2 mt-2">
        <div className="md:grid md:grid-cols-[320px_1fr] gap-6">
          <PatientCardSkeleton />
          <StudiesCardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="text-center font-bold">
          Hubo un error al cargos los datos del Doctor.
        </div>
      )}
      <Helmet>
        <title>
          {isLoadingDoctor
            ? "Médicos"
            : `${doctor?.firstName} ${doctor?.lastName}`}
        </title>
      </Helmet>
      <DoctorComponent
        doctor={doctor}
        studies={studies}
        isLoadingDoctor={isFirstLoadingPatient}
        isFetchingStudies={isFetching}
      />
    </>
  );
}

export default DoctorPage;
