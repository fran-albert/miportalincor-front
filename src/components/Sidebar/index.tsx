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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Activity,
  Briefcase,
  Calendar,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  Clock,
  CreditCard,
  FileText,
  FilePenLine,
  Home,
  Inbox,
  KeyRound,
  Pill,
  ScrollText,
  Settings,
  Shield,
  ShieldCheck,
  Stethoscope,
  Syringe,
  TestTube,
  TrendingUp,
  User,
  UserCheck,
  UserCog,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
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
import { usePrescriptionNotifications } from "@/hooks/Prescription-Request/usePrescriptionNotifications";
import { useMyGreenCardServiceEnabled } from "@/hooks/Doctor-Services/useDoctorServices";
import useLaboralPermissions from "@/hooks/Laboral/useLaboralPermissions";

interface SidebarNavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  allowedRoles: readonly string[];
  strictRoles?: boolean;
}

// Los permisos (allowedRoles/strictRoles) de cada ítem son exactamente los
// mismos que antes del rediseño; acá solo cambia el agrupado y el estilo.
const operacionItems: SidebarNavItem[] = [
  {
    title: "Inicio",
    url: "/inicio",
    icon: Home,
    allowedRoles: PERMISSIONS.DASHBOARD,
  },
  {
    title: "Mi Sala de Espera",
    url: "/mi-sala-de-espera",
    icon: Clock,
    allowedRoles: PERMISSIONS.DOCTOR_WAITING_ROOM,
    strictRoles: true,
  },
  {
    title: "Mis estudios por informar",
    url: "/mis-estudios-por-informar",
    icon: FilePenLine,
    allowedRoles: PERMISSIONS.STUDY_REPORTS,
    strictRoles: true,
  },
  {
    title: "Turnos",
    url: "/turnos",
    icon: Calendar,
    allowedRoles: PERMISSIONS.APPOINTMENTS,
  },
  {
    title: "Pacientes",
    url: "/pacientes",
    icon: Users,
    allowedRoles: PERMISSIONS.PATIENTS,
  },
  {
    title: "Estudios recibidos",
    url: "/estudios-recibidos",
    icon: Inbox,
    allowedRoles: PERMISSIONS.STUDY_INBOX,
  },
  {
    title: "Solicitudes de Recetas",
    url: "/solicitudes-recetas",
    icon: FileText,
    allowedRoles: PERMISSIONS.DOCTOR_PRESCRIPTION_REQUESTS,
    strictRoles: true,
  },
];

// "Médicos" es operación diaria para admin/secretaría, pero catálogo de
// consulta para el médico: se ubica según el rol al armar los grupos.
const medicosItem: SidebarNavItem = {
  title: "Médicos",
  url: "/medicos",
  icon: UserCheck,
  allowedRoles: PERMISSIONS.DOCTORS,
};

const catalogoItems: SidebarNavItem[] = [
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
    title: "Programas",
    url: "/programas",
    icon: Activity,
    allowedRoles: PERMISSIONS.PROGRAMS,
  },
  {
    title: "Servicios Médicos",
    url: "/admin/servicios-medicos",
    icon: CreditCard,
    allowedRoles: PERMISSIONS.DOCTOR_SERVICES,
  },
  {
    title: "Feriados",
    url: "/admin/feriados",
    icon: CalendarDays,
    allowedRoles: PERMISSIONS.HOLIDAYS,
  },
];

const reportesItems: SidebarNavItem[] = [
  {
    title: "Reportes de Turnos",
    url: "/admin/reportes-turnos",
    icon: TrendingUp,
    allowedRoles: PERMISSIONS.STATISTICS,
  },
  {
    title: "Auditoría",
    url: "/auditoria",
    icon: ScrollText,
    allowedRoles: PERMISSIONS.AUDIT,
  },
];

const sistemaItems: SidebarNavItem[] = [
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
    icon: KeyRound,
    allowedRoles: PERMISSIONS.ASSIGN_ROLES,
  },
  {
    title: "Configuración",
    url: "/configuracion",
    icon: Settings,
    allowedRoles: PERMISSIONS.SETTINGS,
  },
];

const miSaludItems: SidebarNavItem[] = [
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
    title: "Mis Vacunas",
    url: "/mis-vacunas",
    icon: Syringe,
    allowedRoles: PERMISSIONS.MY_VACCINATION,
    strictRoles: true,
  },
  {
    title: "Mis Programas",
    url: "/mis-programas",
    icon: ClipboardList,
    allowedRoles: PERMISSIONS.MY_PROGRAMS,
    strictRoles: true,
  },
];

const incorLaboralItem: SidebarNavItem = {
  title: "Incor Laboral",
  url: "/incor-laboral",
  icon: Briefcase,
  allowedRoles: PERMISSIONS.APPOINTMENTS,
};

// Íconos apagados por defecto; el color de marca queda reservado para el ítem
// activo. El peso tipográfico es constante para que nada "salte" al navegar.
const menuButtonClassName =
  "font-medium text-gray-600 hover:bg-gray-100/70 hover:text-gray-900 [&>svg]:text-gray-400 data-[active=true]:bg-greenPrimary/10 data-[active=true]:text-greenPrimary data-[active=true]:[&>svg]:text-greenPrimary";

interface SidebarNavMenuProps {
  items: SidebarNavItem[];
  pathname: string;
  getBadgeCount?: (item: SidebarNavItem) => number;
}

const SidebarNavMenu = ({ items, pathname, getBadgeCount }: SidebarNavMenuProps) => {
  return (
    <SidebarGroupContent>
      <SidebarMenu>
        {items.map((item) => {
          const active = pathname === item.url;
          const badgeCount = getBadgeCount ? getBadgeCount(item) : 0;

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={active}
                tooltip={item.title}
                className={menuButtonClassName}
              >
                <Link to={item.url}>
                  <item.icon />
                  <span className="flex-1">{item.title}</span>
                  {badgeCount > 0 && (
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
  );
};

interface SidebarNavGroupProps extends SidebarNavMenuProps {
  label?: string;
}

const SidebarNavGroup = ({ label, items, pathname, getBadgeCount }: SidebarNavGroupProps) => {
  if (items.length === 0) return null;

  return (
    <SidebarGroup>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarNavMenu items={items} pathname={pathname} getBadgeCount={getBadgeCount} />
    </SidebarGroup>
  );
};

export function AppSidebar() {
  const { pathname } = useLocation();
  const { handleLogout } = useLogout();
  const { session, isDoctor, isSecretary, isAdmin, isPatient } = useUserRole();
  const { canAccessLaboral } = useLaboralPermissions();

  const firstName = session?.firstName || "Usuario";
  const lastName = session?.lastName || "";
  const userRoles = session?.role || [];
  const userInitials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "U";
  const roleLabel = isAdmin
    ? "Administrador"
    : isDoctor
      ? "Médico"
      : isSecretary
        ? "Secretaria"
        : "Paciente";

  // Check if doctor has GREEN_CARD service enabled
  const { isServiceEnabled: hasGreenCardService } = useMyGreenCardServiceEnabled();

  // Get pending prescription count for doctors (only if they have GREEN_CARD service)
  const { pendingCount } = usePrescriptionNotifications({
    enabled: isDoctor && hasGreenCardService,
    showToasts: false, // Toasts are handled in DashboardLayout
  });

  const isPureDoctor = isDoctor && !isAdmin && !isSecretary;
  const isPurePatient = isPatient && !isDoctor && !isAdmin && !isSecretary;

  // "Médicos" va en Operación para admin/secretaría y en Catálogo para el médico
  const pacientesIndex = operacionItems.findIndex(
    (item) => item.url === "/pacientes"
  );
  const operacionSource = isPureDoctor
    ? operacionItems
    : [
        ...operacionItems.slice(0, pacientesIndex + 1),
        medicosItem,
        ...operacionItems.slice(pacientesIndex + 1),
      ];
  const catalogoSource = isPureDoctor
    ? [medicosItem, ...catalogoItems]
    : catalogoItems;

  // Filtrar items del menú según roles del usuario
  let filteredOperacion = filterMenuItems(operacionSource, userRoles);

  // Si es médico y no tiene GREEN_CARD, ocultar "Solicitudes de Recetas"
  if (isDoctor && !hasGreenCardService) {
    filteredOperacion = filteredOperacion.filter(
      (item) => item.url !== "/solicitudes-recetas"
    );
  }

  const filteredMiSalud = filterMenuItems(miSaludItems, userRoles);
  const filteredCatalogo = filterMenuItems(catalogoSource, userRoles);
  const filteredReportes = filterMenuItems(reportesItems, userRoles);
  const filteredSistema = filterMenuItems(sistemaItems, userRoles);
  const laboralItems = canAccessLaboral ? [incorLaboralItem] : [];
  const operacionLabel = isPurePatient
    ? undefined
    : isPureDoctor
      ? "Mi consultorio"
      : "Operación";

  // Si el usuario está parado en una pantalla de Sistema, el grupo arranca abierto
  const sistemaOpenByDefault = filteredSistema.some((item) => item.url === pathname);

  const configUrl = isAdmin
    ? "/configuracion"
    : isDoctor
      ? "/mi-configuracion"
      : null;
  const configLabel = isAdmin ? "Configuración" : "Mi Configuración";

  const getOperacionBadgeCount = (item: SidebarNavItem) =>
    item.url === "/solicitudes-recetas" && isDoctor ? pendingCount : 0;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="Incor Centro Médico">
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
        <SidebarNavGroup
          label={operacionLabel}
          items={filteredOperacion}
          pathname={pathname}
          getBadgeCount={getOperacionBadgeCount}
        />
        <SidebarNavGroup label="Laboral" items={laboralItems} pathname={pathname} />
        <SidebarNavGroup label="Mi salud" items={filteredMiSalud} pathname={pathname} />
        <SidebarNavGroup label="Catálogo" items={filteredCatalogo} pathname={pathname} />
        <SidebarNavGroup label="Reportes" items={filteredReportes} pathname={pathname} />

        {filteredSistema.length > 0 && (
          <Collapsible
            defaultOpen={sistemaOpenByDefault}
            className="group/collapsible"
          >
            <SidebarGroup>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="w-full cursor-pointer">
                  Sistema
                  <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarNavMenu items={filteredSistema} pathname={pathname} />
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" tooltip={firstName}>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-greenPrimary/10 text-xs font-semibold text-greenPrimary">
                    {userInitials}
                  </div>
                  <div className="grid flex-1 text-left leading-tight">
                    <span className="truncate text-sm font-semibold">
                      {`${firstName} ${lastName}`.trim()}
                    </span>
                    <span className="truncate text-xs text-gray-500">
                      {roleLabel}
                    </span>
                  </div>
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
                  <Link to="/mi-perfil">Mi Perfil</Link>
                </DropdownMenuItem>
                {configUrl && (
                  <DropdownMenuItem asChild>
                    <Link to={configUrl}>{configLabel}</Link>
                  </DropdownMenuItem>
                )}
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
