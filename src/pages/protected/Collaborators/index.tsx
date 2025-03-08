import { Helmet } from "react-helmet-async";
import { CollaboratorsTable } from "@/components/Collaborators/Table/table";
import { useCollaborators } from "@/hooks/Collaborator/useCollaborators";

const PreOcuppationalPage = () => {
  const { collaborators, isFetching } = useCollaborators({
    auth: true,
    fetch: true,
  });


  return (
    <>
      <Helmet>
        <title>Incor Laboral</title>
      </Helmet>
      <CollaboratorsTable
        Collaborators={collaborators || []}
        isFetching={isFetching}
      />
    </>
  );
};

export default PreOcuppationalPage;
