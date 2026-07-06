import HomeComponent from "@/components/Home";
import { DoctorHomePage } from "@/components/Home/Doctor";
import PatientHomePage from "@/components/Home/Patient";
import { RoleViewSelector } from "@/components/Home/RoleViewSelector";
import useUserRole from "@/hooks/useRoles";
import { useActiveHomeView } from "@/hooks/Home/useActiveHomeView";
import { Helmet } from "react-helmet-async";
import { AnimatePresence, motion } from "framer-motion";

const HomePage = () => {
  const { session, isDoctor, isSecretary, isAdmin } = useUserRole();
  const { activeView, switchView, config } = useActiveHomeView();

  const userName = session?.firstName || session?.email || "Usuario";

  // El lado profesional de un médico sin roles de gestión es su propio home;
  // admin y secretaria (aunque también sean médicos) conservan el operativo.
  const professionalHome =
    isDoctor && !isSecretary && !isAdmin ? (
      <DoctorHomePage name={userName} />
    ) : (
      <HomeComponent name={userName} />
    );

  const renderDashboard = () => {
    // Usuario con un solo rol
    if (!config.hasDualRole) {
      if (config.hasProfessionalRole) {
        return professionalHome;
      }
      return <PatientHomePage name={userName} />;
    }

    // Usuario con roles duales - renderizar según vista activa
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, x: activeView === "professional" ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: activeView === "professional" ? 20 : -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeView === "professional" ? (
            professionalHome
          ) : (
            <PatientHomePage name={userName} />
          )}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div>
      <Helmet>
        <title>Inicio</title>
      </Helmet>

      {/* Selector de rol - solo visible si tiene ambos roles */}
      {config.hasDualRole && (
        <div className="px-6 pt-6">
          <RoleViewSelector
            activeView={activeView}
            onViewChange={switchView}
            config={config}
          />
        </div>
      )}

      {renderDashboard()}
    </div>
  );
};

export default HomePage;
