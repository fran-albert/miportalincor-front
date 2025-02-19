import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SpecialityPage from "./pages/protected/Specialities/page";
import LoginPage from "./pages/auth/Login";
import { HeaderComponent } from "./components/Header";
import HomePage from "./pages/protected/Home";
import DoctorsComponent from "./pages/protected/Doctors";
import PatientPage from "./pages/protected/Patient";
import PatientsComponent from "./pages/protected/Patients";
import { Private_Routes } from "./routes/Private-Routes";
import DoctorPage from "./pages/protected/Doctor";
import CreatePatientPage from "./pages/protected/Patient/Create";
import CreateDoctorPage from "./pages/protected/Doctor/Create";
import DoctorProfilePage from "./pages/protected/Doctor/Profile";
import PatientProfilePage from "./pages/protected/Patient/Profile";
import HealthInsurancesPage from "./pages/protected/Health-Insurance";
import MyProfilePage from "./pages/protected/Profile/page";
import MyStudiesPage from "./pages/protected/My-Studies";
import LaboratoriesPage from "./pages/protected/Laboratories";
import RequestEmailPassword from "./components/Request-Mail-Password";
import ResetPaswordPage from "./pages/auth/Reset-Password";
import BlodTestPage from "./pages/protected/Blod-Test";
import StudyTypePage from "./pages/protected/Study-Type";
import AccessDeniedPage from "./pages/protected/Access-Denied";
import PreOcuppationalPage from "./pages/protected/Pre-Occupational";
import CollaboratorPage from "./pages/protected/Pre-Occupational/Colaborator";
import PreOccupationalPreviewPage from "./pages/protected/Pre-Occupational/Preview";
import NutritionPage from "./pages/protected/Nutrition";

function App() {
  return (
    <>
      <Router>
        <HeaderComponent />
        <div className="mx-auto container">
          <Routes>
            <Route
              path="/especialidades"
              element={
                <Private_Routes
                  allowedRoles={["Medico", "Secretaria", "Administrador"]}
                >
                  <SpecialityPage />
                </Private_Routes>
              }
            />
            <Route path="/iniciar-sesion" element={<LoginPage />} />
            <Route
              path="/inicio"
              element={
                <Private_Routes>
                  <HomePage />
                </Private_Routes>
              }
            />
            <Route
              path="/"
              element={
                <Private_Routes>
                  <HomePage />
                </Private_Routes>
              }
            />
            <Route
              path="/pacientes"
              element={
                <Private_Routes
                  allowedRoles={["Medico", "Secretaria", "Administrador"]}
                >
                  <PatientsComponent />
                </Private_Routes>
              }
            />
            <Route
              path="/mi-perfil"
              element={
                <Private_Routes>
                  <MyProfilePage />
                </Private_Routes>
              }
            />
            <Route
              path="/mis-estudios"
              element={
                <Private_Routes>
                  <MyStudiesPage />
                </Private_Routes>
              }
            />

            <Route
              path="/pacientes/:slug"
              element={
                <Private_Routes
                  allowedRoles={["Medico", "Secretaria", "Administrador"]}
                >
                  <PatientPage />
                </Private_Routes>
              }
            />

            <Route
              path="/pacientes/:slug/laboratorios"
              element={
                <Private_Routes allowedRoles={["Medico"]}>
                  <LaboratoriesPage role="paciente" />
                </Private_Routes>
              }
            />
            <Route
              path="/pacientes/:slug/control-nutricional"
              element={
                <Private_Routes allowedRoles={["Medico", "Secretaria"]}>
                  <NutritionPage />
                </Private_Routes>
              }
            />
            <Route
              path="/incor-laboral/colaboradores/:slug"
              element={
                <Private_Routes allowedRoles={["Medico", "Secretaria"]}>
                  <CollaboratorPage />
                </Private_Routes>
              }
            />
            <Route
              path="/incor-laboral/colaboradores/:slug/previsualizar-informe"
              element={
                <Private_Routes allowedRoles={["Medico", "Secretaria"]}>
                  <PreOccupationalPreviewPage />
                </Private_Routes>
              }
            />
            <Route
              path="/incor-laboral"
              element={
                <Private_Routes allowedRoles={["Medico", "Secretaria"]}>
                  <PreOcuppationalPage />
                </Private_Routes>
              }
            />
            <Route
              path="/medicos/:slug/laboratorios"
              element={
                <Private_Routes allowedRoles={["Medico"]}>
                  <LaboratoriesPage role="medico" />
                </Private_Routes>
              }
            />
            <Route path="/acceso-denegado" element={<AccessDeniedPage />} />
            <Route
              path="/obras-sociales"
              element={
                <Private_Routes
                  allowedRoles={["Medico", "Secretaria", "Administrador"]}
                >
                  <HealthInsurancesPage />
                </Private_Routes>
              }
            />
            <Route
              path="/analisis-bioquimicos"
              element={
                <Private_Routes
                  allowedRoles={["Medico", "Secretaria", "Administrador"]}
                >
                  <BlodTestPage />
                </Private_Routes>
              }
            />
            <Route
              path="/tipos-de-estudios"
              element={
                <Private_Routes
                  allowedRoles={["Medico", "Secretaria", "Administrador"]}
                >
                  <StudyTypePage />
                </Private_Routes>
              }
            />
            <Route
              path="/medicos"
              element={
                <Private_Routes
                  allowedRoles={["Medico", "Secretaria", "Administrador"]}
                >
                  <DoctorsComponent />
                </Private_Routes>
              }
            />
            <Route
              path="/medicos/:slug"
              element={
                <Private_Routes
                  allowedRoles={["Medico", "Secretaria", "Administrador"]}
                >
                  <DoctorPage />
                </Private_Routes>
              }
            />
            <Route
              path="/restablecer-contraseña"
              element={<RequestEmailPassword />}
            />
            <Route path="/nueva-contraseña" element={<ResetPaswordPage />} />
            <Route
              path="/medicos/:slug/perfil"
              element={
                <Private_Routes
                  allowedRoles={["Medico", "Secretaria", "Administrador"]}
                >
                  <DoctorProfilePage />
                </Private_Routes>
              }
            />
            <Route
              path="/pacientes/:slug/perfil"
              element={
                <Private_Routes
                  allowedRoles={["Medico", "Secretaria", "Administrador"]}
                >
                  <PatientProfilePage />
                </Private_Routes>
              }
            />
            <Route
              path="/pacientes/agregar"
              element={
                <Private_Routes allowedRoles={["Secretaria", "Administrador"]}>
                  <CreatePatientPage />
                </Private_Routes>
              }
            />
            <Route
              path="/medicos/agregar"
              element={
                <Private_Routes allowedRoles={["Secretaria", "Administrador"]}>
                  <CreateDoctorPage />
                </Private_Routes>
              }
            />
          </Routes>
        </div>
      </Router>
    </>
  );
}

export default App;
