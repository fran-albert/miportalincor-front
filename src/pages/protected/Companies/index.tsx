import { Helmet } from "react-helmet-async";
import { CompaniesTable } from "@/components/Companies/Table/table";
import { useCompanies } from "@/hooks/Company/useCompanies";
import { usePrefetchCompany } from "@/hooks/Company/usePrefetchCompany";

const CompaniesPage = () => {
  const { companies, isFetching } = useCompanies({
    auth: true,
    fetch: true,
  });
  const prefetchCompanies = usePrefetchCompany();
  return (
    <>
      <Helmet>
        <title>Incor Laboral - Empresas</title>
      </Helmet>
      <CompaniesTable
        companies={companies || []}
        isFetching={isFetching}
        prefetchCompanies={prefetchCompanies}
      />
    </>
  );
};

export default CompaniesPage;
