import LoadingAnimation from "@/components/Loading/loading";
import { BlodTestTable } from "../Table/table";
import { useBlodTest } from "@/hooks/Blod-Test/useBlodTest";

function BlodTestComponent() {
  const { blodTests, isLoading, error } = useBlodTest({});

  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (error) {
    return <div>Error al cargar los análisis bioquímicos</div>;
  }

  return <BlodTestTable blodTests={blodTests} />;
}

export default BlodTestComponent;
