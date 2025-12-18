import { SecretariesTable } from "@/components/Secretaries/Table/table";
import LoadingAnimation from "@/components/Loading/loading";
import { useSecretaries } from "@/hooks/Secretary/useSecretaries";
import { Helmet } from "react-helmet-async";
import useRoles from "@/hooks/useRoles";

const SecretariesComponent = () => {
  const { session } = useRoles();
  const isAuthenticated = !!session;
  const { secretaries, isLoading, error } = useSecretaries({
    auth: isAuthenticated,
    fetchSecretaries: true,
  });

  return (
    <>
      <Helmet>
        <title>Secretarias</title>
      </Helmet>
      {error && <div>Hubo un error al cargar las secretarias.</div>}
      {isLoading ? (
        <LoadingAnimation />
      ) : (
        <SecretariesTable
          secretaries={secretaries}
          isLoading={isLoading}
        />
      )}
    </>
  );
};

export default SecretariesComponent;
