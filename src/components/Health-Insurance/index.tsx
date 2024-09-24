import { useHealthInsurance } from "@/hooks/Health-Insurance/useHealthInsurance";
import LoadingAnimation from "../Loading/loading";
import { HealthInsuranceTable } from "./Table/table";

const HealthInsuranceComponent = () => {
  const { healthInsurances, isLoading } = useHealthInsurance({
    auth: true,
  });

  if (isLoading) {
    return <LoadingAnimation />;
  }

  return <HealthInsuranceTable healthInsurances={healthInsurances} />;
};

export default HealthInsuranceComponent;
