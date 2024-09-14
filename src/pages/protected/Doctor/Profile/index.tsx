import BreadcrumbComponent from "@/components/Breadcrumb";
import DoctorProfileComponent from "@/components/Doctors/Profile";
import LoadingAnimation from "@/components/Loading/loading";
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
      label: doctor ? `${doctor.firstName} ${doctor.lastName}` : "Médico",
      href: `/medicos/${doctor?.slug}`,
    },
    {
      label: doctor ? `Perfil Completo` : "Médico",
      href: `/medicos/${doctor?.slug}`,
    },
  ];
  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (doctor) {
    return (
      <div className="container space-y-2 mt-2">
        <BreadcrumbComponent items={breadcrumbItems} />
        <div className="">
          {doctor && <DoctorProfileComponent doctor={doctor} />}
        </div>
      </div>
    );
  }
};

export default DoctorProfilePage;
