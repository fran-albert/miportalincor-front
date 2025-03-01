import { usePrefetchPatient } from "@/hooks/Patient/usePrefetchPatient";
import { Helmet } from "react-helmet-async";
import { CollaboratorsTable } from "@/components/Collaborators/Table/table";
import { useCollaborators } from "@/hooks/Collaborator/useCollaborators";

const PreOcuppationalPage = () => {
  const { collaborators, isFetching } = useCollaborators({
    auth: true,
    fetch: true,
  });

  const prefetchPatients = usePrefetchPatient();

  return (
    <>
      <Helmet>
        <title>Incor Laboral</title>
      </Helmet>
      <CollaboratorsTable
        Collaborators={collaborators || []}
        prefetchCollaborators={prefetchPatients}
        isFetching={isFetching}
      />
    </>
  );
};

export default PreOcuppationalPage;
