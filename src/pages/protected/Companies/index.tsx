import { Helmet } from "react-helmet-async";
import { CompaniesTable } from "@/components/Companies/Table/table";
import { useCompanies } from "@/hooks/Company/useCompanies";

const CompaniesPage = () => {
  const { companies, isFetching } = useCompanies({
    auth: true,
    fetch: true,
  });
  return (
    <>
      <Helmet>
        <title>Incor Laboral - Empresas</title>
      </Helmet>
      <CompaniesTable companies={companies || []} isFetching={isFetching} />
    </>
  );
};

export default CompaniesPage;
