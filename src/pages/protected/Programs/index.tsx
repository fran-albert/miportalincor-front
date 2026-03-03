import { Helmet } from "react-helmet-async";
import { usePrograms } from "@/hooks/Program/usePrograms";
import { ProgramsTable } from "@/components/Programs/Table/table";

const ProgramsPage = () => {
  const { programs, isFetching, isError } = usePrograms();

  return (
    <>
      <Helmet>
        <title>Programas</title>
      </Helmet>
      {isError && <div>Hubo un error al cargar los programas.</div>}
      <ProgramsTable programs={programs} isFetching={isFetching} />
    </>
  );
};

export default ProgramsPage;
