import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuLink,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import LogoutButton from "../Button/Logout";
import useUserRole from "@/hooks/useRoles";
import { isStaging } from "@/config/environment";

export function HeaderComponent() {
  const [activeLink, setActiveLink] = useState<string | null>(null);
  const handleLinkClick = (link: string) => {
    setActiveLink(link);
  };
  const { isDoctor, isSecretary, session, isAdmin } = useUserRole();
  return (
    <>
      {isStaging() && (
        <div className="bg-orange-500 text-white text-center py-1 px-4 text-sm font-medium">
          🚧 ENTORNO DE STAGING - VERSIÓN DE PRUEBA
        </div>
      )}
      <header className="flex h-16 sm:h-20 w-full shrink-0 items-center px-4 md:px-6 bg-greenPrimary">
      <Link to="#" className="mr-2 sm:mr-4 lg:mr-6 flex items-center">
        <img
          src="https://res.cloudinary.com/dfoqki8kt/image/upload/v1740059697/uboivjuv41dkkdeaqhfa.png"
          className="h-8 sm:h-10 lg:h-12 w-auto"
          alt="Logo Incor"
        />
      </Link>
      <NavigationMenu className="ml-auto hidden lg:flex">
        <NavigationMenuList>
          {session ? (
            <>
              <NavigationMenuLink asChild>
                <Link
                  to="/inicio"
                  className={`group inline-flex h-9 w-max items-center text-white justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 hover:underline underline-offset-4 hover:decoration-teal-600 ${
                    activeLink === "Inicio"
                      ? "underline decoration-teal-500"
                      : ""
                  }`}
                  onClick={() => handleLinkClick("Inicio")}
                >
                  Inicio
                </Link>
              </NavigationMenuLink>
              <NavigationMenuLink asChild>
                <Link
                  to="/mi-perfil"
                  className={`group inline-flex h-9 w-max items-center justify-center text-white rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 hover:underline underline-offset-4 hover:decoration-teal-600 ${
                    activeLink === "Mi Perfil"
                      ? "underline decoration-teal-500"
                      : ""
                  }`}
                  onClick={() => handleLinkClick("Mi Perfil")}
                >
                  Mi Perfil
                </Link>
              </NavigationMenuLink>
              <NavigationMenuLink asChild>
                <Link
                  to="/mis-estudios"
                  className={`group inline-flex h-9 w-max items-center justify-center text-white rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 hover:underline underline-offset-4 hover:decoration-teal-600 ${
                    activeLink === "Mis Estudios"
                      ? "underline decoration-teal-500"
                      : ""
                  }`}
                  onClick={() => handleLinkClick("Mis Estudios")}
                >
                  Mis Estudios
                </Link>
              </NavigationMenuLink>
              {(isDoctor || isSecretary || isAdmin) && (
                <>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="bg-transparent text-white">
                      Gestionar
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="relative">
                      <div className="grid w-full min-w-[300px] max-w-[400px] p-2">
                        <NavigationMenuLink asChild>
                          <Link
                            to="/medicos"
                            className="group grid h-auto w-full items-center justify-start text-black gap-1 rounded-md p-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                          >
                            Médicos
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/pacientes"
                            className="group grid h-auto w-full items-center justify-start text-black gap-1 rounded-md p-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                          >
                            Pacientes
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/especialidades"
                            className="group grid h-auto w-full items-center justify-start text-black gap-1 rounded-md p-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                          >
                            Especialidades
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/obras-sociales"
                            className="group grid h-auto w-full items-center justify-start text-black gap-1 rounded-md p-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                          >
                            Obras Sociales
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/analisis-bioquimicos"
                            className="group grid h-auto w-full items-center justify-start text-black gap-1 rounded-md p-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                          >
                            Laboratorios
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/tipos-de-estudios"
                            className="group grid h-auto w-full items-center justify-start text-black gap-1 rounded-md p-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                          >
                            Tipos de Estudios
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/incor-laboral"
                            className="group grid h-auto w-full items-center justify-start text-black gap-1 rounded-md p-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                          >
                            Incor Laboral
                          </Link>
                        </NavigationMenuLink>
                      </div>
                    </NavigationMenuContent>
                    <NavigationMenuLink asChild>
                      <Link
                        to="/reportes"
                        className={`group inline-flex h-9 w-max items-center justify-center text-white rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 hover:underline underline-offset-4 hover:decoration-teal-600 ${
                          activeLink === "Reportes"
                            ? "underline decoration-teal-500"
                            : ""
                        }`}
                        onClick={() => handleLinkClick("Reportes")}
                      >
                        Reportes
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </>
              )}

              <NavigationMenuLink asChild>
                <LogoutButton />
              </NavigationMenuLink>
            </>
          ) : null}
        </NavigationMenuList>
      </NavigationMenu>
      {session ? (
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="ml-auto lg:hidden">
              <MenuIcon className="h-6 w-6" />
              <span className="sr-only">Menú de navegación</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <div className="grid gap-2 py-6">
              <>
                <Link
                  to="/inicio"
                  className="flex w-full items-center py-2 text-lg font-semibold"
                  onClick={() => handleLinkClick("Inicio")}
                >
                  Inicio
                </Link>
                <Link
                  to="/mi-perfil"
                  className="flex w-full items-center py-2 text-lg font-semibold"
                  onClick={() => handleLinkClick("Mi Perfil")}
                >
                  Mi Perfil
                </Link>
                <Link
                  to="/mis-estudios"
                  className="flex w-full items-center py-2 text-lg font-semibold"
                  onClick={() => handleLinkClick("Mis Estudios")}
                >
                  Mis Estudios
                </Link>
                {(isDoctor || isSecretary || isAdmin) && (
                  <Collapsible className="grid gap-4">
                    <CollapsibleTrigger className="flex w-full items-center text-lg font-semibold [&[data-state=open]>svg]:rotate-90">
                      Gestionar
                      <ChevronRightIcon className="ml-auto h-5 w-5 transition-all" />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="-mx-6 grid gap-6 bg-muted p-6">
                        <Link
                          to="/medicos"
                          className="group grid h-auto w-full justify-start gap-1"
                        >
                          Médicos
                        </Link>
                        <Link
                          to="/pacientes"
                          className="group grid h-auto w-full justify-start gap-1"
                        >
                          Pacientes
                        </Link>
                        <Link
                          to="/especialidades"
                          className="group grid h-auto w-full justify-start gap-1"
                        >
                          Especialidades
                        </Link>
                        <Link
                          to="/obras-sociales"
                          className="group grid h-auto w-full justify-start gap-1"
                        >
                          Obras Sociales
                        </Link>
                        <Link
                          to="/analisis-bioquimicos"
                          className="group grid h-auto w-full justify-start gap-1"
                        >
                          Laboratorios
                        </Link>
                        <Link
                          to="/incor-laboral"
                          className="group grid h-auto w-full justify-start gap-1"
                        >
                          Incor Laboral
                        </Link>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}
                <div className="grid gap-2 py-6">
                  <div className="flex w-full items-center py-2 text-lg font-semibold">
                    <LogoutButton />
                  </div>
                </div>
              </>
            </div>
          </SheetContent>
        </Sheet>
      ) : null}
    </header>
    </>
  );
}

function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function MenuIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}
