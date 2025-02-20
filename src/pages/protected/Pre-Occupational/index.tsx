import { usePrefetchPatient } from "@/hooks/Patient/usePrefetchPatient";
import { usePatients } from "@/hooks/Patient/usePatients";
import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { CollaboratorsTable } from "@/components/Pre-Occupational/Table/table";

const PreOcuppationalPage = () => {
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
        <title>Incor Laboral</title>
      </Helmet>
      <CollaboratorsTable
        Collaborators={patients || []}
        prefetchCollaborators={prefetchPatients}
        isFetching={isFetching}
        searchQuery={search}
        setSearch={setSearch}
      />
    </>
  );
};

export default PreOcuppationalPage;
