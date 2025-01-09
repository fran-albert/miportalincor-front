import LoadingAnimation from "@/components/Loading/loading";
import { BlodTestTable } from "../Table/table";
import { useBlodTest } from "@/hooks/Blod-Test/useBlodTest";
import useUserRole from "@/hooks/useRoles";

function BlodTestComponent() {
  const { isDoctor, isSecretary, isAdmin } = useUserRole();
  const { blodTests, isLoading, error } = useBlodTest({
    auth: isDoctor || isSecretary || isAdmin,
  });
  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (error) {
    return <div>Error al cargar los análisis bioquímicos</div>;
  }

  return <BlodTestTable blodTests={blodTests} />;
}

export default BlodTestComponent;
