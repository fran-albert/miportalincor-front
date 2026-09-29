import { useSearchPatients } from "@/hooks/Patient/useSearchPatients";
import { PatientsTable } from "@/components/Patients/Table/table";
import { Helmet } from "react-helmet-async";
import { useState } from "react";

const PatientsComponent = () => {
  const [onlySelfSignupUnverified, setOnlySelfSignupUnverified] =
    useState(false);
  const {
    patients,
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
    onlySelfSignupUnverified,
  });

  return (
    <>
      <Helmet>
        <title>Pacientes</title>
      </Helmet>
      {error && <div>Hubo un error al cargar los pacientes.</div>}
      <PatientsTable
        patients={patients}
        isFetching={isFetching}
        searchQuery={search}
        setSearch={setSearch}
        currentPage={page}
        totalPages={totalPages}
        onNextPage={nextPage}
        onPrevPage={prevPage}
        onlySelfSignupUnverified={onlySelfSignupUnverified}
        onToggleSelfSignupFilter={() =>
          setOnlySelfSignupUnverified((current) => !current)
        }
      />
    </>
  );
};

export default PatientsComponent;
