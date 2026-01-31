import DoctorServicesComponent from "@/components/Doctor-Services";
import { Helmet } from "react-helmet-async";

const DoctorServicesPage = () => {
  return (
    <>
      <Helmet>
        <title>Servicios Medicos</title>
      </Helmet>
      <DoctorServicesComponent />
    </>
  );
};

export default DoctorServicesPage;
