import HealthInsuranceComponent from "@/components/Health-Insurance";
import { Helmet } from "react-helmet-async";

const HealthInsurancesPage = () => {
  return (
    <>
      <Helmet>
        <title>Obras Sociales</title>
      </Helmet>
      <HealthInsuranceComponent />
    </>
  );
};

export default HealthInsurancesPage;
