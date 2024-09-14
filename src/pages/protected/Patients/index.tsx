import { usePrefetchPatient } from "@/hooks/Patient/usePrefetchPatient";
import { usePatients } from "@/hooks/Patient/usePatients";
import { PatientsTable } from "@/components/Patients/Table/table";
import LoadingAnimation from "@/components/Loading/loading";

const PatientsComponent = () => {
  const { isLoading, patients } = usePatients({
    auth: true,
    fetchPatients: true,
  });
  const prefetchPatients = usePrefetchPatient();

  if (isLoading) {
    return <LoadingAnimation />;
  }

  return (
    <>
      <PatientsTable
        patients={patients || []}
        prefetchPatients={prefetchPatients}
        isLoading={isLoading}
      />
    </>
  );
};

export default PatientsComponent;
