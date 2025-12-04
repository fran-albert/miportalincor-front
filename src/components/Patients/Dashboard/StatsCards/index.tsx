import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, Clock, Stethoscope, LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Study } from "@/types/Study/Study";
import useUserRole from "@/hooks/useRoles";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  gradient: string;
  index: number;
  linkTo?: string;
  subtitle?: string;
  isLoading?: boolean;
  comingSoon?: boolean;
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  gradient,
  index,
  linkTo,
  subtitle,
  isLoading = false,
  comingSoon = false,
}: StatCardProps) => {
  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="space-y-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-16" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (comingSoon) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
      >
        <Card className="overflow-hidden border-0 shadow-md opacity-75">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-500">{title}</p>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200 text-xs">
                    Próximamente
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-gray-500">-</p>
                <p className="text-xs text-gray-400">Disponible pronto</p>
              </div>
              <div className={`p-3 rounded-xl ${gradient} opacity-60`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const CardWrapper = linkTo ? Link : "div";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <CardWrapper to={linkTo || ""} className={linkTo ? "block" : ""}>
        <Card className={`overflow-hidden border-0 shadow-md ${linkTo ? "hover:shadow-xl transition-shadow duration-300 cursor-pointer" : ""}`}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <p className="text-sm font-medium text-gray-600">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                {subtitle && (
                  <p className="text-xs text-gray-500">{subtitle}</p>
                )}
              </div>
              <div className={`p-3 rounded-xl ${gradient}`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </CardWrapper>
    </motion.div>
  );
};

interface StatsCardsProps {
  patientSlug: string;
  stats: {
    totalStudies: number;
    lastStudy?: Study | null;
    nextAppointment?: string | Date | null;
    lastVisit?: string | Date | null;
  };
  isLoading?: boolean;
}

export const StatsCards = ({ patientSlug, stats, isLoading = false }: StatsCardsProps) => {
  const { isDoctor } = useUserRole();

  const getLastVisitText = () => {
    if (!stats.lastVisit) return "Sin visitas";
    const date = new Date(stats.lastVisit);
    return formatDistanceToNow(date, { addSuffix: true, locale: es });
  };

  const getNextAppointmentText = () => {
    if (!stats.nextAppointment) return "Sin citas";
    const date = new Date(stats.nextAppointment);
    return new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getLastStudyText = () => {
    if (!stats.lastStudy) return undefined;

    // Intentar primero con 'date', luego con 'created'
    const dateValue = stats.lastStudy.date || (stats.lastStudy.created ? new Date(stats.lastStudy.created).toISOString() : undefined);
    if (!dateValue) return undefined;

    try {
      const date = new Date(dateValue);
      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) return undefined;

      return `Último: ${date.toLocaleDateString("es-ES")}`;
    } catch {
      return undefined;
    }
  };

  const statsData = [
    {
      title: "Total de Estudios",
      value: stats.totalStudies,
      icon: FileText,
      gradient: "bg-gradient-to-br from-blue-500 to-blue-600",
      linkTo: `/pacientes/${patientSlug}/estudios`,
      subtitle: getLastStudyText(),
    },
    {
      title: "Próxima Cita",
      value: getNextAppointmentText(),
      icon: Calendar,
      gradient: "bg-gradient-to-br from-greenPrimary to-teal-600",
      subtitle: stats.nextAppointment ? "Cita programada" : "Sin citas programadas",
      comingSoon: true,
    },
    {
      title: "Última Visita",
      value: getLastVisitText(),
      icon: Clock,
      gradient: "bg-gradient-to-br from-purple-500 to-purple-600",
      comingSoon: true,
    },
    {
      title: "Historia Clínica",
      value: "Actualizada",
      icon: Stethoscope,
      gradient: "bg-gradient-to-br from-orange-500 to-orange-600",
      linkTo: `/pacientes/${patientSlug}/historia-clinica`,
      subtitle: "Ver completa",
      visible: isDoctor,
    },
  ];

  const visibleStats = statsData.filter((stat) => stat.visible !== false);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {visibleStats.map((stat, index) => (
        <StatCard
          key={index}
          {...stat}
          index={index}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
};
