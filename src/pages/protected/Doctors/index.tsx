import { DoctorsTable } from "@/components/Doctors/Table/table";
import LoadingAnimation from "@/components/Loading/loading";
import { useDoctors } from "@/hooks/Doctor/useDoctors";
import { usePrefetchDoctor } from "@/hooks/Doctor/usePrefetchDoctor";

const DoctorsComponent = () => {
  const { isLoading, doctors, error } = useDoctors({
    auth: true,
    fetchDoctors: true,
  });
  const prefetchDoctors = usePrefetchDoctor();
  return (
    <>
      {error && <div>Hubo un error al cargar los doctores.</div>}
      {isLoading ? (
        <LoadingAnimation />
      ) : (
        <DoctorsTable
          doctors={doctors || []}
          prefetchDoctors={prefetchDoctors}
          isLoading={isLoading}
        />
      )}
    </>
  );
};

export default DoctorsComponent;
