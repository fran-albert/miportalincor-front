import HomeComponent from "@/components/Home";
import PatientHomePage from "@/components/Home/Patient";
import useUserRole from "@/hooks/useRoles";
import { Helmet } from "react-helmet-async";

const HomePage = () => {
  const { isPatient, isDoctor, isSecretary, session, isAdmin } = useUserRole();

  const userName = session?.firstName || session?.email || "Usuario";

  return (
    <div>
      <Helmet>
        <title>Inicio</title>
      </Helmet>
      {(isSecretary || isAdmin) && <HomeComponent name={userName} />}
      {isDoctor && <HomeComponent name={userName} />}
      {isPatient && <PatientHomePage name={userName} />}
    </div>
  );
};

export default HomePage;
