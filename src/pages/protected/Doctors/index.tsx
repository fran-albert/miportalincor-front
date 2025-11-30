import { DoctorsTable } from "@/components/Doctors/Table/table";
import LoadingAnimation from "@/components/Loading/loading";
import { useSearchDoctors } from "@/hooks/Doctor/useSearchDoctors";
import { usePrefetchDoctor } from "@/hooks/Doctor/usePrefetchDoctor";
import { Helmet } from "react-helmet-async";

const DoctorsComponent = () => {
  const {
    doctors,
    isLoading,
    error,
    search,
    setSearch,
    page,
    totalPages,
    nextPage,
    prevPage,
  } = useSearchDoctors({
    initialLimit: 10,
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
          doctors={doctors}
          prefetchDoctors={prefetchDoctors}
          isLoading={isLoading}
          searchQuery={search}
          setSearch={setSearch}
          currentPage={page}
          totalPages={totalPages}
          onNextPage={nextPage}
          onPrevPage={prevPage}
        />
      )}
    </>
  );
};

export default DoctorsComponent;
