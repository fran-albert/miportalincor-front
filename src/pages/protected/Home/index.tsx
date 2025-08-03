import HomeComponent from "@/components/Home";
import PatientHomePage from "@/components/Home/Patient";
import useUserRole from "@/hooks/useRoles";
import { Helmet } from "react-helmet-async";

const HomePage = () => {
  const { isPatient, isDoctor, isSecretary, session, isAdmin } = useUserRole();

  return (
    <div>
      <Helmet>
        <title>Inicio</title>
      </Helmet>
      {(isSecretary || isAdmin) && (
        <HomeComponent name={String(session?.firstName)} />
      )}
      {isDoctor && <HomeComponent name={String(session?.firstName)} />}
      {isPatient && <PatientHomePage name={String(session?.firstName)} />}
    </div>
  );
};

export default HomePage;
