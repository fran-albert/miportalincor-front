import { Helmet } from "react-helmet-async";
import { AppointmentsManagementDashboardContainer } from "@/components/Appointments-Analytics";

const AppointmentsReportsPage = () => {
  return (
    <>
      <Helmet>
        <title>Reportes de Turnos</title>
      </Helmet>
      <AppointmentsManagementDashboardContainer />
    </>
  );
};

export default AppointmentsReportsPage;
