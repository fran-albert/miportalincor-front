import { usePrefetchPatient } from "@/hooks/Patient/usePrefetchPatient";
import { useSearchPatients } from "@/hooks/Patient/useSearchPatients";
import { PatientsTable } from "@/components/Patients/Table/table";
import { Helmet } from "react-helmet-async";

const PatientsComponent = () => {
  const {
    patients,
    isLoading,
    isFetching,
    error,
    search,
    setSearch,
    page,
    totalPages,
    nextPage,
    prevPage,
  } = useSearchPatients({
    initialLimit: 10,
  });

  const prefetchPatients = usePrefetchPatient();

  return (
    <>
      <Helmet>
        <title>Pacientes</title>
      </Helmet>
      {error && <div>Hubo un error al cargar los pacientes.</div>}
      <PatientsTable
        patients={patients}
        prefetchPatients={prefetchPatients}
        isFetching={isFetching}
        searchQuery={search}
        setSearch={setSearch}
        currentPage={page}
        totalPages={totalPages}
        onNextPage={nextPage}
        onPrevPage={prevPage}
      />
    </>
  );
};

export default PatientsComponent;
