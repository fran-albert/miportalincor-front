import DoctorProfileComponent from "@/components/Doctors/Profile";
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

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <div>Cargando perfil del médico...</div>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="space-y-4 p-6">
      {doctor && <DoctorProfileComponent doctor={doctor} />}
    </div>
  );
};

export default DoctorProfilePage;
