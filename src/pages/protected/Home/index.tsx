import HomeComponent from "@/components/Home";
import PatientHomePage from "@/components/Home/Patient";
import useUserRole from "@/hooks/useRoles";

const HomePage = () => {
  const { isPatient, isDoctor, isSecretary, session } = useUserRole();
  console.log(session);
  return (
    <div>
      {isSecretary && <HomeComponent name={String(session?.FirstName)} />}
      {isDoctor && <HomeComponent name={String(session?.FirstName)} />}
      {isPatient && <PatientHomePage name={String(session?.FirstName)} />}
    </div>
  );
};

export default HomePage;
