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

const navigationItems = [
  {
    title: "Dashboard",
    url: "/inicio",
    icon: Home,
  },
  {
    title: "Pacientes",
    url: "/pacientes",
    icon: Users,
    badge: "1,247",
  },
  {
    title: "Médicos",
    url: "/medicos",
    icon: UserCheck,
    badge: "89",
  },
  {
    title: "Especialidades",
    url: "/especialidades",
    icon: Stethoscope,
  },
  {
    title: "Obras Sociales",
    url: "/obras-sociales",
    icon: Shield,
  },
  {
    title: "Turnos",
    url: "/turnos",
    icon: Calendar,
    badge: "24",
    isActive: true,
  },
  {
    title: "Laboratorios",
    url: "/laboratorios",
    icon: TestTube,
  },
  {
    title: "Estudios",
    url: "#",
    icon: Microscope,
  },
];

const reportsItems = [
  {
    title: "Reportes",
    url: "#",
    icon: FileBarChart,
  },
  {
    title: "Estadísticas",
    url: "#",
    icon: TrendingUp,
  },
  {
    title: "Actividad",
    url: "#",
    icon: Activity,
  },
];

const systemItems = [
  {
    title: "Configuración",
    url: "#",
    icon: Settings,
  },
  {
    title: "Usuarios del Sistema",
    url: "#",
    icon: User,
  },
  {
    title: "Auditoría",
    url: "#",
    icon: ClipboardList,
  },
];

export function AppSidebar() {
  const { pathname } = useLocation();
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="#">
                <img
                  src="https://res.cloudinary.com/dfoqki8kt/image/upload/v1748058948/bligwub9dzzcxzm4ovgv.png"
                  alt=""
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
        <SidebarGroup>
          <SidebarGroupLabel>Gestión Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
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
                        <item.icon />
                        <span>{item.title}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto">
                            {item.badge}
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

        <SidebarGroup>
          <SidebarGroupLabel>Reportes y Análisis</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {reportsItems.map((item) => (
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

        <SidebarGroup>
          <SidebarGroupLabel>Administración</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemItems.map((item) => (
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
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User />
                  <span>Dr. María González</span>
                  <ChevronDown className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Configuración</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
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
