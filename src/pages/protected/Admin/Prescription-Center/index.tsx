import { Helmet } from "react-helmet-async";
import OperatorManagement from "@/components/Prescription-Center/OperatorManagement";

const PrescriptionCenterPage = () => {
  return (
    <>
      <Helmet>
        <title>Operadores de Recetas</title>
      </Helmet>
      <OperatorManagement />
    </>
  );
};

export default PrescriptionCenterPage;
