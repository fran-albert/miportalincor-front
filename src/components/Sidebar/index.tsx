import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import {
  User,
  ChevronDown,
  TestTube,
  Calendar,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  Shield,
  UserCircle,
  Stethoscope,
  UserCheck,
  Users,
  Home,
  ClipboardList,
  Settings,
  Activity,
  TrendingUp,
  FileBarChart,
  ShieldCheck,
  UserCog,
  Clock,
  FileText,
  Pill,
  CreditCard,
  GraduationCap,
  ClipboardCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogout } from "@/hooks/useLogout";
import useUserRole from "@/hooks/useRoles";
import { PERMISSIONS, filterMenuItems } from "@/common/constants/permissions";
import { Briefcase } from "lucide-react";
import { usePrescriptionNotifications } from "@/hooks/Prescription-Request/usePrescriptionNotifications";
import { useOperatorPrescriptionNotifications } from "@/hooks/Prescription-Request/useOperatorPrescriptionNotifications";
import { useMyGreenCardServiceEnabled } from "@/hooks/Doctor-Services/useDoctorServices";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/inicio",
    icon: Home,
    allowedRoles: PERMISSIONS.DASHBOARD,
  },
  {
    title: "Mi Perfil",
    url: "/mi-perfil",
    icon: UserCircle,
    allowedRoles: PERMISSIONS.MY_PROFILE,
  },
  {
    title: "Pacientes",
    url: "/pacientes",
    icon: Users,
    allowedRoles: PERMISSIONS.PATIENTS,
  },
  {
    title: "Médicos",
    url: "/medicos",
    icon: UserCheck,
    allowedRoles: PERMISSIONS.DOCTORS,
  },
  {
    title: "Especialidades",
    url: "/especialidades",
    icon: Stethoscope,
    allowedRoles: PERMISSIONS.SPECIALTIES,
  },
  {
    title: "Obras Sociales",
    url: "/obras-sociales",
    icon: Shield,
    allowedRoles: PERMISSIONS.HEALTH_INSURANCE,
  },
  {
    title: "Turnos",
    url: "/turnos",
    icon: Calendar,
    allowedRoles: PERMISSIONS.APPOINTMENTS,
  },
  {
    title: "Mi Sala de Espera",
    url: "/mi-sala-de-espera",
    icon: Clock,
    allowedRoles: PERMISSIONS.DOCTOR_WAITING_ROOM,
    strictRoles: true,
  },
  {
    title: "Mi Configuración",
    url: "/mi-configuracion",
    icon: Settings,
    allowedRoles: PERMISSIONS.MY_SETTINGS,
    strictRoles: true,
  },
  {
    title: "Mis Estudios",
    url: "/mis-estudios",
    icon: TestTube,
    allowedRoles: PERMISSIONS.MY_STUDIES,
    strictRoles: true,
  },
  {
    title: "Mis Turnos",
    url: "/mis-turnos",
    icon: CalendarCheck,
    allowedRoles: PERMISSIONS.MY_APPOINTMENTS,
    strictRoles: true,
  },
  {
    title: "Medicación y Recetas",
    url: "/mis-solicitudes-recetas",
    icon: Pill,
    allowedRoles: PERMISSIONS.MY_PRESCRIPTION_REQUESTS,
    strictRoles: true,
  },
  {
    title: "Mis Chequeos",
    url: "/mis-chequeos",
    icon: CalendarClock,
    allowedRoles: PERMISSIONS.MY_CHECKUPS,
    strictRoles: true,
  },
  {
    title: "Solicitudes de Recetas",
    url: "/solicitudes-recetas",
    icon: FileText,
    allowedRoles: PERMISSIONS.DOCTOR_PRESCRIPTION_REQUESTS,
    strictRoles: true,
  },
  {
    title: "Bandeja de Recetas",
    url: "/bandeja-recetas",
    icon: FileText,
    allowedRoles: PERMISSIONS.OPERATOR_PRESCRIPTION_REQUESTS,
  },
  {
    title: "Programas",
    url: "/programas",
    icon: GraduationCap,
    allowedRoles: PERMISSIONS.PROGRAMS,
  },
  {
    title: "Mis Programas",
    url: "/mis-programas",
    icon: ClipboardCheck,
    allowedRoles: PERMISSIONS.MY_PROGRAMS,
    strictRoles: true,
  },
  {
    title: "Incor Laboral",
    url: "/incor-laboral",
    icon: Briefcase,
    allowedRoles: PERMISSIONS.INCOR_LABORAL,
  },
];

const reportsItems = [
  {
    title: "Reportes de Recetas",
    url: "/admin/reportes-recetas",
    icon: FileBarChart,
    allowedRoles: PERMISSIONS.PRESCRIPTION_REPORTS,
  },
  {
    title: "Reportes de Turnos",
    url: "/admin/reportes-turnos",
    icon: TrendingUp,
    allowedRoles: PERMISSIONS.STATISTICS,
  },
  {
    title: "Actividad",
    url: "#",
    icon: Activity,
    allowedRoles: PERMISSIONS.ACTIVITY,
    comingSoon: true,
  },
];

const systemItems = [
  {
    title: "Configuración",
    url: "/configuracion",
    icon: Settings,
    allowedRoles: PERMISSIONS.SETTINGS,
  },
  {
    title: "Usuarios del Sistema",
    url: "/usuarios",
    icon: User,
    allowedRoles: PERMISSIONS.SYSTEM_USERS,
  },
  {
    title: "Secretarias",
    url: "/secretarias",
    icon: UserCog,
    allowedRoles: PERMISSIONS.SECRETARIES,
  },
  {
    title: "Gestión de Roles",
    url: "/gestion-roles",
    icon: ShieldCheck,
    allowedRoles: PERMISSIONS.ROLE_MANAGEMENT,
  },
  {
    title: "Asignar Roles",
    url: "/asignar-roles",
    icon: Users,
    allowedRoles: PERMISSIONS.ASSIGN_ROLES,
  },
  {
    title: "Auditoría",
    url: "/auditoria",
    icon: ClipboardList,
    allowedRoles: PERMISSIONS.AUDIT,
  },
  {
    title: "Servicios Médicos",
    url: "/admin/servicios-medicos",
    icon: CreditCard,
    allowedRoles: PERMISSIONS.DOCTOR_SERVICES,
  },
  {
    title: "Operadores Recetas",
    url: "/admin/centro-recetas",
    icon: ClipboardCheck,
    allowedRoles: PERMISSIONS.PRESCRIPTION_CENTER,
  },
  {
    title: "Feriados",
    url: "/admin/feriados",
    icon: CalendarDays,
    allowedRoles: PERMISSIONS.HOLIDAYS,
  },
];

export function AppSidebar() {
  const { pathname } = useLocation();
  const { handleLogout } = useLogout();
  const { session } = useUserRole();

  const userName = session?.firstName || "Usuario";
  const userRoles = session?.role || [];
  const isDoctor = userRoles.includes("Medico");
  const isOperator = userRoles.includes("Secretaria") || userRoles.includes("Administrador");

  // Check if doctor has GREEN_CARD service enabled
  const { isServiceEnabled: hasGreenCardService } = useMyGreenCardServiceEnabled();

  // Get pending prescription count for doctors (only if they have GREEN_CARD service)
  const { pendingCount } = usePrescriptionNotifications({
    enabled: isDoctor && hasGreenCardService,
    showToasts: false, // Toasts are handled in DashboardLayout
  });

  // Get pending prescription count for operators
  const { pendingCount: operatorPendingCount } = useOperatorPrescriptionNotifications({
    enabled: isOperator,
    showToasts: false,
  });

  // Filtrar items del menú según roles del usuario
  let filteredNavigationItems = filterMenuItems(navigationItems, userRoles);

  // Si es médico y no tiene GREEN_CARD, ocultar "Solicitudes de Recetas"
  if (isDoctor && !hasGreenCardService) {
    filteredNavigationItems = filteredNavigationItems.filter(
      (item) => item.url !== "/solicitudes-recetas"
    );
  }
  const filteredReportsItems = filterMenuItems(reportsItems, userRoles);
  const filteredSystemItems = filterMenuItems(systemItems, userRoles);

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/inicio">
                <img
                  src="https://res.cloudinary.com/dfoqki8kt/image/upload/v1748058948/bligwub9dzzcxzm4ovgv.png"
                  alt="Incor Centro Médico"
                  className="h-10 w-10 rounded-full"
                />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    Incor Centro Médico
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {filteredNavigationItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Gestión Principal</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredNavigationItems.map((item) => {
                  const active = pathname === item.url;
                  const isComingSoon = "comingSoon" in item && item.comingSoon;

                  if (isComingSoon) {
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton disabled className="opacity-60 cursor-not-allowed">
                          <item.icon className="text-gray-400" />
                          <span className="text-gray-400 flex-1">{item.title}</span>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-amber-50 text-amber-600 border-amber-200">
                            Próximamente
                          </Badge>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  }

                  // Check if this is the prescription requests item for doctors
                  const isPrescriptionRequestsItem =
                    item.url === "/solicitudes-recetas" && isDoctor;
                  const isOperatorPrescriptionItem =
                    item.url === "/bandeja-recetas" && isOperator;
                  const badgeCount = isPrescriptionRequestsItem
                    ? pendingCount
                    : isOperatorPrescriptionItem
                      ? operatorPendingCount
                      : 0;
                  const showBadge = badgeCount > 0;

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={active}>
                        <Link
                          to={item.url}
                          className={`flex items-center gap-2 px-2 py-1 rounded ${
                            active
                              ? "font-bold bg-gray-100 text-greenPrimary"
                              : "font-normal text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <item.icon className="text-greenPrimary" />
                          <span className="flex-1">{item.title}</span>
                          {showBadge && (
                            <Badge
                              variant="destructive"
                              className="h-5 min-w-[20px] px-1.5 text-[10px] font-bold"
                            >
                              {badgeCount > 9 ? "9+" : badgeCount}
                            </Badge>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {filteredReportsItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Reportes y Análisis</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredReportsItems.map((item) => {
                  const isComingSoon = "comingSoon" in item && item.comingSoon;

                  if (isComingSoon) {
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton disabled className="opacity-60 cursor-not-allowed">
                          <item.icon className="text-gray-400" />
                          <span className="text-gray-400">{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  }

                  const active = pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={active}>
                        <Link
                          to={item.url}
                          className={`flex items-center gap-2 px-2 py-1 rounded ${
                            active
                              ? "font-bold bg-gray-100 text-greenPrimary"
                              : "font-normal text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <item.icon className="text-greenPrimary" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {filteredSystemItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Administración</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredSystemItems.map((item) => {
                  const active = pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={active}>
                        <Link
                          to={item.url}
                          className={`flex items-center gap-2 px-2 py-1 rounded ${
                            active
                              ? "font-bold bg-gray-100 text-greenPrimary"
                              : "font-normal text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <item.icon className="text-greenPrimary" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User />
                  <span>{userName}</span>
                  <ChevronDown className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/mi-perfil">Perfil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Configuración</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
