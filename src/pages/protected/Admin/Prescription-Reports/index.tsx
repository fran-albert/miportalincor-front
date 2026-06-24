import { PrescriptionReportsContainer } from "@/components/Prescription-Reports/PrescriptionReportsContainer";
import { Helmet } from "react-helmet-async";

const PrescriptionReportsPage = () => {
  return (
    <>
      <Helmet>
        <title>Reportes de Recetas</title>
      </Helmet>
      <PrescriptionReportsContainer />
    </>
  );
};

export default PrescriptionReportsPage;
