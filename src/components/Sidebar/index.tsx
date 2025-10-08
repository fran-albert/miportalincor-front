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
  Microscope,
  TestTube,
  Calendar,
  Shield,
  Stethoscope,
  UserCheck,
  Users,
  Home,
  ClipboardList,
  Settings,
  Activity,
  TrendingUp,
  FileBarChart,
} from "lucide-react";
import { Badge } from "../ui/badge";
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

const navigationItems = [
  {
    title: "Dashboard",
    url: "/inicio",
    icon: Home,
    allowedRoles: PERMISSIONS.DASHBOARD,
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
    title: "Mis Estudios",
    url: "/mis-estudios",
    icon: TestTube,
    allowedRoles: PERMISSIONS.MY_STUDIES,
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
    title: "Reportes",
    url: "#",
    icon: FileBarChart,
    allowedRoles: PERMISSIONS.REPORTS,
  },
  {
    title: "Estadísticas",
    url: "#",
    icon: TrendingUp,
    allowedRoles: PERMISSIONS.STATISTICS,
  },
  {
    title: "Actividad",
    url: "#",
    icon: Activity,
    allowedRoles: PERMISSIONS.ACTIVITY,
  },
];

const systemItems = [
  {
    title: "Configuración",
    url: "#",
    icon: Settings,
    allowedRoles: PERMISSIONS.SETTINGS,
  },
  {
    title: "Usuarios del Sistema",
    url: "#",
    icon: User,
    allowedRoles: PERMISSIONS.SYSTEM_USERS,
  },
  {
    title: "Auditoría",
    url: "#",
    icon: ClipboardList,
    allowedRoles: PERMISSIONS.AUDIT,
  },
];

export function AppSidebar() {
  const { pathname } = useLocation();
  const { handleLogout } = useLogout();
  const { session } = useUserRole();

  const userName = session?.firstName || "Usuario";
  const userRoles = session?.role || [];

  // Filtrar items del menú según roles del usuario
  const filteredNavigationItems = filterMenuItems(navigationItems, userRoles);
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
                  <span className="truncate text-xs">Sistema de Gestión</span>
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

        {filteredReportsItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Reportes y Análisis</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredReportsItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link to={item.url}>
                        <item.icon className="text-greenPrimary" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {filteredSystemItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Administración</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredSystemItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link to={item.url}>
                        <item.icon className="text-greenPrimary" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
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
