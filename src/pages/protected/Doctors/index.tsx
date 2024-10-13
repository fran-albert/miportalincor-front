import { DoctorsTable } from "@/components/Doctors/Table/table";
import LoadingAnimation from "@/components/Loading/loading";
import { useDoctors } from "@/hooks/Doctor/useDoctors";
import { usePrefetchDoctor } from "@/hooks/Doctor/usePrefetchDoctor";
import { Helmet } from "react-helmet-async";

const DoctorsComponent = () => {
  const { isLoading, doctors, error } = useDoctors({
    auth: true,
    fetchDoctors: true,
  });
  const prefetchDoctors = usePrefetchDoctor();
  return (
    <>
      <Helmet>
        <title>Médicos</title>
      </Helmet>
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
