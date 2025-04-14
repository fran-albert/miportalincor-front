import { usePrefetchPatient } from "@/hooks/Patient/usePrefetchPatient";
import { usePatients } from "@/hooks/Patient/usePatients";
import { PatientsTable } from "@/components/Patients/Table/table";
import { Helmet } from "react-helmet-async";
import { useState } from "react";

const PatientsComponent = () => {
  const [search, setSearch] = useState("");
  const { patients, isFetching } = usePatients({
    auth: true,
    fetchPatients: true,
    search,
  });

  const prefetchPatients = usePrefetchPatient();
  return (
    <>
      <Helmet>
        <title>Pacientes</title>
      </Helmet>
      <PatientsTable
        patients={patients || []}
        prefetchPatients={prefetchPatients}
        isFetching={isFetching}
        searchQuery={search}
        setSearch={setSearch}
      />
    </>
  );
};

export default PatientsComponent;
