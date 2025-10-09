import LoadingAnimation from "@/components/Loading/loading";
import ProfileDoctorCardComponent from "@/components/Profile/Doctor";
import MyProfilePatientComponent from "@/components/Profile/Patient";
import SecretaryProfileComponent from "@/components/Profile/Secretary";
import { useDoctor } from "@/hooks/Doctor/useDoctor";
import { usePatient } from "@/hooks/Patient/usePatient";
import { useUser } from "@/hooks/User/useUser";
import useUserRole from "@/hooks/useRoles";
import { Helmet } from "react-helmet-async";

const MyProfilePage = () => {
  const { session, isDoctor, isPatient, isSecretary } = useUserRole();
  const userId = Number(session?.id);
  const { user: secretary, isLoading: isLoadingSecretary } = useUser({
    auth: isSecretary && userId !== undefined,
    id: userId !== undefined ? userId : -1,
  });

  const { patient, isLoading: isLoadingPatient } = usePatient({
    auth: isPatient && userId !== undefined,
    id: userId !== undefined ? userId : -1,
  });

  const { doctor, isLoading: isLoadingDoctor } = useDoctor({
    auth: isDoctor && userId !== undefined,
    id: userId !== undefined ? userId : -1,
  });

  if (
    (isDoctor && isLoadingDoctor) ||
    (isPatient && isLoadingPatient) ||
    (isSecretary && isLoadingSecretary)
  ) {
    return <LoadingAnimation />;
  }

  if (isDoctor && doctor) {
    return (
      <>
        <Helmet>
          <title>{isLoadingDoctor ? "" : `Mi Perfil`}</title>
        </Helmet>
        <ProfileDoctorCardComponent data={doctor} />
      </>
    );
  }

  if (isSecretary && secretary) {
    return <SecretaryProfileComponent user={secretary} />;
  }

  if (isPatient && patient) {
    return <MyProfilePatientComponent patient={patient} />;
  }

  return null;
};

export default MyProfilePage;
