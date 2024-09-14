import HomeComponent from "@/components/Home";
import PatientHomePage from "@/components/Home/Patient";
import useUserRole from "@/hooks/useRoles";

const HomePage = () => {
  const { isPatient, isDoctor, isSecretary, session } = useUserRole();
  return (
    <div>
      {isSecretary && <HomeComponent name={String(session?.FirstName)} />}
      {isDoctor && <p>Bienvenido Doctor</p>}
      {isPatient && <PatientHomePage name={String(session?.FirstName)} />}

      {!session && <p>No tiene acceso</p>}
    </div>
  );
};

export default HomePage;
