import { useDoctor } from "@/hooks/Doctor/useDoctor";
import { DoctorDashboardComponent } from "@/components/Doctors/Dashboard/Component";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { DoctorDashboardSkeleton } from "@/components/Skeleton/Doctor";

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

  const isFirstLoadingDoctor = isLoadingDoctor && !doctor;

  if (isFirstLoadingDoctor) {
    return (
      <div className="container space-y-2 mt-2">
        <DoctorDashboardSkeleton />
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
      <DoctorDashboardComponent
        doctor={doctor}
        isLoadingDoctor={isLoadingDoctor}
      />
    </>
  );
}

export default DoctorPage;
