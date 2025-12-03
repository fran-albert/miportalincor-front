import ProfileDoctorCardComponent from "@/components/Profile/Doctor";
import MyProfilePatientComponent from "@/components/Profile/Patient";
import SecretaryProfileComponent from "@/components/Profile/Secretary";
import { DoctorProfileSkeleton } from "@/components/Skeleton/Doctor";
import { PatientProfileSkeleton } from "@/components/Skeleton/Patient";
import { SecretaryProfileSkeleton } from "@/components/Skeleton/Secretary";
import { useDoctor } from "@/hooks/Doctor/useDoctor";
import { usePatient } from "@/hooks/Patient/usePatient";
import { useUser } from "@/hooks/User/useUser";
import useUserRole from "@/hooks/useRoles";
import { Helmet } from "react-helmet-async";

const MyProfilePage = () => {
  const { session, isDoctor, isPatient, isSecretary } = useUserRole();
  const userId = session?.id;
  const numericUserId = userId ? Number(userId) : -1;
  const { user: secretary, isLoading: isLoadingSecretary } = useUser({
    auth: isSecretary && userId !== undefined,
    id: numericUserId,
  });

  const { patient, isLoading: isLoadingPatient } = usePatient({
    auth: isPatient && userId !== undefined,
    id: userId !== undefined ? userId : "",
  });

  const { doctor, isLoading: isLoadingDoctor } = useDoctor({
    auth: isDoctor && userId !== undefined,
    id: userId !== undefined ? userId : "",
  });

  if (isDoctor && isLoadingDoctor) {
    return (
      <div className="space-y-6 p-6">
        <DoctorProfileSkeleton />
      </div>
    );
  }

  if (isSecretary && isLoadingSecretary) {
    return (
      <div className="space-y-6 p-6">
        <SecretaryProfileSkeleton />
      </div>
    );
  }

  if (isPatient && isLoadingPatient) {
    return (
      <div className="space-y-6 p-6">
        <PatientProfileSkeleton />
      </div>
    );
  }

  if (isDoctor && doctor) {
    return (
      <>
        <Helmet>
          <title>Mi Perfil</title>
        </Helmet>
        <div className="space-y-6 p-6">
          <ProfileDoctorCardComponent data={doctor} />
        </div>
      </>
    );
  }

  if (isSecretary && secretary) {
    return (
      <div className="space-y-6 p-6">
        <SecretaryProfileComponent user={secretary} />
      </div>
    );
  }

  if (isPatient && patient) {
    return (
      <>
        {patient && <MyProfilePatientComponent patient={patient} />}
      </>
    );
  }

  return null;
};

export default MyProfilePage;
