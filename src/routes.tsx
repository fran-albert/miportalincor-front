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
                <Private_Routes allowedRoles={["Medico", "Secretaria"]}>
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
              path="/pacientes"
              element={
                <Private_Routes allowedRoles={["Secretaria"]}>
                  <PatientsComponent />
                </Private_Routes>
              }
            />
            {/* <Route
              path="/mi-perfil"
              element={
                <Private_Routes>
                  <ProfilePage />
                </Private_Routes>
              }
            /> */}

            <Route
              path="/pacientes/:slug"
              element={
                <Private_Routes allowedRoles={["Medico", "Secretaria"]}>
                  <PatientPage />
                </Private_Routes>
              }
            />
            <Route
              path="/medicos"
              element={
                <Private_Routes allowedRoles={["Medico", "Secretaria"]}>
                  <DoctorsComponent />
                </Private_Routes>
              }
            />
            <Route
              path="/medicos/:slug"
              element={
                <Private_Routes allowedRoles={["Medico", "Secretaria"]}>
                  <DoctorPage />
                </Private_Routes>
              }
            />
            <Route
              path="/medicos/:slug/perfil"
              element={
                <Private_Routes allowedRoles={["Medico", "Secretaria"]}>
                  <DoctorProfilePage />
                </Private_Routes>
              }
            />
            <Route
              path="/pacientes/:slug/perfil"
              element={
                <Private_Routes allowedRoles={["Medico", "Secretaria"]}>
                  <PatientProfilePage />
                </Private_Routes>
              }
            />
            <Route
              path="/pacientes/agregar"
              element={
                <Private_Routes allowedRoles={["Secretaria"]}>
                  <CreatePatientPage />
                </Private_Routes>
              }
            />
            <Route
              path="/medicos/agregar"
              element={
                <Private_Routes allowedRoles={["Secretaria"]}>
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
