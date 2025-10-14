import { Outlet, Link } from "react-router-dom";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { isStaging } from "@/config/environment";
import { useLogout } from "@/hooks/useLogout";
import useUserRole from "@/hooks/useRoles";

export function DashboardLayout() {
  const { handleLogout } = useLogout();
  const { session, isPatient } = useUserRole();

  const userName = session?.firstName || "Usuario";
  const userInitials = userName.substring(0, 2).toUpperCase();

  // Determinar si mostrar el buscador (no mostrar para pacientes)
  const showSearchBar = !isPatient;

  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          {isStaging() && (
            <div className="sticky top-0 z-50 bg-orange-500 text-white text-center py-1 px-4 text-sm font-medium ">
              🚧 ENTORNO DE STAGING - VERSIÓN DE PRUEBA
            </div>
          )}
          <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-4 border-b px-4 bg-white shadow-sm">
            <SidebarTrigger className="-ml-1" />
            <div className="flex flex-1 items-center gap-4 justify-between">
              {/* Buscador - Solo visible para médicos, secretarias y administradores */}
              {showSearchBar && (
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar pacientes, médicos..."
                    className="pl-8 w-full"
                  />
                </div>
              )}

              {/* Espaciador para pacientes cuando no hay buscador */}
              {!showSearchBar && <div className="flex-1" />}

              {/* Menú de usuario */}
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <div className="h-8 w-8 rounded-full bg-greenPrimary flex items-center justify-center text-white text-sm font-semibold">
                        {userInitials}
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{userName}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/mi-perfil">Perfil</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>Configuración</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
