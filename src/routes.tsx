import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SpecialityPage from "./pages/protected/Specialities/page";
import LoginPage from "./pages/auth/Login";
import { HeaderComponent } from "./components/Header";
import HomePage from "./pages/protected/Home";
import DoctorsComponent from "./pages/protected/Doctors";
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
import PreOcuppationalPage from "./pages/protected/Collaborators";
import PreOccupationalPreviewPage from "./pages/protected/Collaborator/Pre-Occupattional/Preview";
import NutritionPage from "./pages/protected/Patient/Nutrition";
import CreateCollaboratorPage from "./pages/protected/Collaborator/Create";
import CreatePreoccupationalPage from "./pages/protected/Collaborator/Pre-Occupattional/Create";
import LaboralIncorPage from "./pages/protected/Laboral-Incor";
import CompaniesPage from "./pages/protected/Companies";
import CollaboratorEditPage from "./pages/protected/Collaborator/Edit";
import CollaboratorPage from "./pages/protected/Collaborator";
import PatientDashboardPage from "./pages/protected/Patient";
import PatientHistoryPage from "./pages/protected/Patient/Historia-Clinica";
import PatientStudiesPage from "./pages/protected/Patient/Studies";
import PatientAntecedentesPage from "./pages/protected/Patient/Antecedentes";
import PatientEvolucionesPage from "./pages/protected/Patient/Evoluciones";
import PatientMedicacionActualPage from "./pages/protected/Patient/Medicacion-Actual";
import DoctorHistoryPage from "./pages/protected/Doctor/Historia-Clinica";
import DoctorEvolucionesPage from "./pages/protected/Doctor/Evoluciones";
import DoctorAntecedentesPage from "./pages/protected/Doctor/Antecedentes";
import DoctorMedicacionActualPage from "./pages/protected/Doctor/Medicacion-Actual";
import ShiftsPage from "./pages/protected/Shift/page";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";
import { AppSidebar } from "./components/Sidebar";
import { Bell, Search } from "lucide-react";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./components/ui/dropdown-menu";

function App() {
  return (
    <>
      <Router>
        <HeaderComponent />
        <div className="mx-auto container px-4 sm:px-6 lg:px-8">
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
                  <PatientDashboardPage />
                </Private_Routes>
              }
            />

            <Route
              path="/pacientes/:slug/historia-clinica"
              element={
                <Private_Routes allowedRoles={["Medico", "Administrador"]}>
                  <PatientHistoryPage />
                </Private_Routes>
              }
            />

            <Route
              path="/pacientes/:slug/estudios"
              element={
                <Private_Routes
                  allowedRoles={["Medico", "Secretaria", "Administrador"]}
                >
                  <PatientStudiesPage />
                </Private_Routes>
              }
            />
            <Route
              path="/pacientes/:slug/historia-clinica/antecedentes"
              element={
                <Private_Routes allowedRoles={["Medico", "Administrador"]}>
                  <PatientAntecedentesPage />
                </Private_Routes>
              }
            />
            <Route
              path="/pacientes/:slug/historia-clinica/evoluciones"
              element={
                <Private_Routes allowedRoles={["Medico", "Administrador"]}>
                  <PatientEvolucionesPage />
                </Private_Routes>
              }
            />
            <Route
              path="/pacientes/:slug/historia-clinica/medicacion-actual"
              element={
                <Private_Routes allowedRoles={["Medico", "Administrador"]}>
                  <PatientMedicacionActualPage />
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
              path="/medicos/:slug/control-nutricional"
              element={
                <Private_Routes allowedRoles={["Medico", "Secretaria"]}>
                  <NutritionPage />
                </Private_Routes>
              }
            />
            <Route
              path="/incor-laboral/colaboradores/:slug/examen/:medicalEvaluationId"
              element={
                <Private_Routes allowedRoles={["Medico", "Secretaria"]}>
                  <CreatePreoccupationalPage />
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
              path="/incor-laboral/colaboradores/:slug/editar"
              element={
                <Private_Routes allowedRoles={["Medico", "Secretaria"]}>
                  <CollaboratorEditPage />
                </Private_Routes>
              }
            />
            <Route
              path="/incor-laboral/colaboradores/:slug/examen/:medicalEvaluationId/previsualizar-informe"
              element={
                <Private_Routes allowedRoles={["Medico", "Secretaria"]}>
                  <PreOccupationalPreviewPage />
                </Private_Routes>
              }
            />
            <Route
              path="/incor-laboral/colaboradores"
              element={
                <Private_Routes allowedRoles={["Medico", "Secretaria"]}>
                  <PreOcuppationalPage />
                </Private_Routes>
              }
            />
            <Route
              path="/incor-laboral"
              element={
                <Private_Routes allowedRoles={["Medico", "Secretaria"]}>
                  <LaboralIncorPage />
                </Private_Routes>
              }
            />
            <Route
              path="/incor-laboral/empresas"
              element={
                <Private_Routes allowedRoles={["Medico", "Secretaria"]}>
                  <CompaniesPage />
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
              path="/medicos/:slug/historia-clinica"
              element={
                <Private_Routes allowedRoles={["Medico", "Administrador"]}>
                  <DoctorHistoryPage />
                </Private_Routes>
              }
            />
            <Route
              path="/medicos/:slug/historia-clinica/evoluciones"
              element={
                <Private_Routes allowedRoles={["Medico", "Administrador"]}>
                  <DoctorEvolucionesPage />
                </Private_Routes>
              }
            />
            <Route
              path="/medicos/:slug/historia-clinica/medicacion-actual"
              element={
                <Private_Routes allowedRoles={["Medico", "Administrador"]}>
                  <DoctorMedicacionActualPage />
                </Private_Routes>
              }
            />
            <Route
              path="/medicos/:slug/historia-clinica/antecedentes"
              element={
                <Private_Routes allowedRoles={["Medico", "Administrador"]}>
                  <DoctorAntecedentesPage />
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
              path="/incor-laboral/colaboradores/agregar"
              element={
                <Private_Routes
                  allowedRoles={["Secretaria", "Administrador", "Médico"]}
                >
                  <CreateCollaboratorPage />
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
        {/* <HeaderComponent /> */}
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <div className="flex flex-1 items-center gap-2">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar pacientes, médicos..."
                    className="pl-8"
                    // value={busqueda}
                    // onChange={(e) => setBusqueda(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Bell className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                    >
                      <img
                        src="/placeholder.svg?height=32&width=32&text=DM"
                        width="32"
                        height="32"
                        className="rounded-full"
                        alt="Avatar"
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Dr. María González</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Perfil</DropdownMenuItem>
                    <DropdownMenuItem>Configuración</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Cerrar Sesión</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>

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
                <Route
                  path="/turnos"
                  element={
                    <Private_Routes
                      allowedRoles={["Medico", "Secretaria", "Administrador"]}
                    >
                      <ShiftsPage />
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
                      <PatientDashboardPage />
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
                  path="/medicos/:slug/control-nutricional"
                  element={
                    <Private_Routes allowedRoles={["Medico", "Secretaria"]}>
                      <NutritionPage />
                    </Private_Routes>
                  }
                />
                <Route
                  path="/incor-laboral/colaboradores/:slug/examen/:medicalEvaluationId"
                  element={
                    <Private_Routes allowedRoles={["Medico", "Secretaria"]}>
                      <CreatePreoccupationalPage />
                    </Private_Routes>
                  }
                />
                <Route
                  path="/incor-laboral/colaboradores/:slug"
                  element={
                    <Private_Routes allowedRoles={["Medico", "Secretaria"]}>
                      <PreOcuppationalPage />
                    </Private_Routes>
                  }
                />
                <Route
                  path="/incor-laboral/colaboradores/:slug/editar"
                  element={
                    <Private_Routes allowedRoles={["Medico", "Secretaria"]}>
                      <CollaboratorEditPage />
                    </Private_Routes>
                  }
                />
                <Route
                  path="/incor-laboral/colaboradores/:slug/examen/:medicalEvaluationId/previsualizar-informe"
                  element={
                    <Private_Routes allowedRoles={["Medico", "Secretaria"]}>
                      <PreOccupationalPreviewPage />
                    </Private_Routes>
                  }
                />
                <Route
                  path="/incor-laboral/colaboradores"
                  element={
                    <Private_Routes allowedRoles={["Medico", "Secretaria"]}>
                      <PreOcuppationalPage />
                    </Private_Routes>
                  }
                />
                <Route
                  path="/incor-laboral"
                  element={
                    <Private_Routes allowedRoles={["Medico", "Secretaria"]}>
                      <LaboralIncorPage />
                    </Private_Routes>
                  }
                />
                <Route
                  path="/incor-laboral/empresas"
                  element={
                    <Private_Routes allowedRoles={["Medico", "Secretaria"]}>
                      <CompaniesPage />
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
                <Route
                  path="/nueva-contraseña"
                  element={<ResetPaswordPage />}
                />
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
                    <Private_Routes
                      allowedRoles={["Secretaria", "Administrador"]}
                    >
                      <CreatePatientPage />
                    </Private_Routes>
                  }
                />
                <Route
                  path="/incor-laboral/colaboradores/agregar"
                  element={
                    <Private_Routes
                      allowedRoles={["Secretaria", "Administrador", "Médico"]}
                    >
                      <CreateCollaboratorPage />
                    </Private_Routes>
                  }
                />
                <Route
                  path="/medicos/agregar"
                  element={
                    <Private_Routes
                      allowedRoles={["Secretaria", "Administrador"]}
                    >
                      <CreateDoctorPage />
                    </Private_Routes>
                  }
                />
              </Routes>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </Router>
    </>
  );
}

export default App;
