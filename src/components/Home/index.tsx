import { WelcomeHero } from "./Dashboard/WelcomeHero";
import { StatsCard } from "./Dashboard/StatsCard";
import { QuickAccessCard } from "./Dashboard/QuickAccessCard";
import { useDashboardStats } from "@/hooks/Dashboard/useDashboardStats";
import {
  Users,
  Stethoscope,
  FileText,
  UserCog,
  Heart,
  Shield,
  TestTube,
  Building2,
  Calendar,
} from "lucide-react";
import useUserRole from "@/hooks/useRoles";

export default function HomeComponent({ name }: { name: string }) {
  const { isSecretary, isAdmin, session, isDoctor } = useUserRole();
  const { stats, isLoading } = useDashboardStats(!!session);

  const quickAccessCards = [
    {
      title: "Pacientes",
      description:
        "Gestiona la información y historias clínicas de los pacientes",
      icon: Users,
      href: "/pacientes",
    },
    {
      title: "Médicos",
      description: "Administra el equipo médico y sus especialidades",
      icon: Stethoscope,
      href: "/medicos",
    },
    {
      title: "Especialidades",
      description: "Configura y gestiona las especialidades médicas del centro",
      icon: Heart,
      href: "/especialidades",
    },
    {
      title: "Obras Sociales",
      description: "Administra las obras sociales y planes de salud",
      icon: Shield,
      href: "/obras-sociales",
    },
    {
      title: "Análisis Bioquímicos",
      description:
        "Configura y gestiona los análisis bioquímicos del laboratorio",
      icon: TestTube,
      href: "/analisis-bioquimicos",
    },
    {
      title: "Tipos de Estudios",
      description: "Administra las categorías de estudios médicos disponibles",
      icon: FileText,
      href: "/tipos-de-estudios",
    },
  ];

  // Solo Admin y Secretaria ven Incor Laboral y Turnos
  if (isSecretary || isAdmin || isDoctor) {
    quickAccessCards.push(
      {
        title: "Incor Laboral",
        description: "Gestiona colaboradores y exámenes preocupacionales",
        icon: UserCog,
        href: "/incor-laboral",
      },
      {
        title: "Turnos",
        description: "Administra y visualiza las citas médicas del centro",
        icon: Calendar,
        href: "/turnos",
      }
    );
  }

  const statsCards = [
    {
      title: "Total Pacientes",
      value: stats.patients.total,
      lastMonthValue: stats.patients.lastMonth,
      icon: Users,
      gradient: "bg-gradient-to-br from-blue-500 to-blue-600",
    },
    {
      title: "Total Médicos",
      value: stats.doctors.total,
      lastMonthValue: stats.doctors.lastMonth,
      icon: Stethoscope,
      gradient: "bg-gradient-to-br from-greenPrimary to-teal-600",
    },
    {
      title: "Total Estudios",
      value: stats.studies.total,
      lastMonthValue: stats.studies.lastMonth,
      icon: FileText,
      gradient: "bg-gradient-to-br from-purple-500 to-purple-600",
    },
    {
      title: "Empresas Activas",
      value: 0, // TODO: Agregar cuando esté disponible
      icon: Building2,
      gradient: "bg-gradient-to-br from-orange-500 to-orange-600",
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Hero Section */}
      <WelcomeHero name={name} />

      {/* Stats Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">
          Estadísticas Generales
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat, index) => (
            <StatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              lastMonthValue={stat.lastMonthValue}
              icon={stat.icon}
              gradient={stat.gradient}
              isLoading={isLoading}
            />
          ))}
        </div>
      </div>

      {/* Quick Access Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Acceso Rápido</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {quickAccessCards.map((card, index) => (
            <QuickAccessCard
              key={index}
              title={card.title}
              description={card.description}
              icon={card.icon}
              href={card.href}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
