import DoctorProfileComponent from "@/components/Doctors/Profile";
import { DoctorCardSkeleton } from "@/components/Skeleton/Doctor";
import { useDoctor } from "@/hooks/Doctor/useDoctor";
import { useParams } from "react-router-dom";

const DoctorProfilePage = () => {
  const params = useParams();
  const slug = params.slug;
  const slugString = slug as string;
  const slugParts = slugString.split("-");
  const id = parseInt(slugParts[slugParts.length - 1], 10);
  const { isLoading, doctor, error } = useDoctor({
    auth: true,
    id,
  });

   const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Médicos", href: "/medicos" },
    {
      label: doctor ? `${doctor.firstName} ${doctor.lastName}` : "Médico", href: "/medicos/" + (slug || "")
    },
    { label: "Perfil Completo", href: "#" }
  ];

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <DoctorCardSkeleton />
      </div>
    );
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="space-y-4 p-6">
      {doctor && <DoctorProfileComponent doctor={doctor} breadcrumbItems={breadcrumbItems} />}
    </div>
  );
};

export default DoctorProfilePage;
