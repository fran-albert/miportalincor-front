import HomeComponent from "@/components/Home";
import PatientHomePage from "@/components/Home/Patient";
import useUserRole from "@/hooks/useRoles";
import { Helmet } from "react-helmet-async";

const HomePage = () => {
  const { isPatient, isDoctor, isSecretary, session } = useUserRole();
  return (
    <div>
      <Helmet>
        <title>Inicio</title>
      </Helmet>
      {isSecretary && <HomeComponent name={String(session?.FirstName)} />}
      {isDoctor && <HomeComponent name={String(session?.FirstName)} />}
      {isPatient && <PatientHomePage name={String(session?.FirstName)} />}
    </div>
  );
};

export default HomePage;
