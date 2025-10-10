import { Card, CardContent } from "@/components/ui/card";
import { FileText, ClipboardList, Pill, UserCheck, LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  gradient: string;
  index: number;
  subtitle?: string;
  isLoading?: boolean;
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  gradient,
  index,
  subtitle,
  isLoading = false,
}: StatCardProps) => {
  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="space-y-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-16" />
            {subtitle && <Skeleton className="h-3 w-32" />}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
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
    </motion.div>
  );
};

interface SummaryCardsProps {
  stats: {
    totalEvoluciones: number;
    lastEvolucion?: { createdAt: string | Date };
    totalAntecedentes: number;
    antecedentesPorCategoria: Record<string, number>;
    totalMedicacionActiva: number;
    lastDoctor?: { firstName: string; lastName: string; specialities?: { name: string }[] };
  };
  isLoading?: boolean;
}

export const SummaryCards = ({ stats, isLoading = false }: SummaryCardsProps) => {
  const getLastEvolucionText = () => {
    if (!stats.lastEvolucion) return "Sin registro";
    const date = new Date(stats.lastEvolucion.createdAt);
    return formatDistanceToNow(date, { addSuffix: true, locale: es });
  };

  const getAntecedentesText = () => {
    const categorias = Object.keys(stats.antecedentesPorCategoria).length;
    if (categorias === 0) return "Sin antecedentes";
    return `${categorias} categoría${categorias > 1 ? "s" : ""}`;
  };

  const getLastDoctorText = () => {
    if (!stats.lastDoctor) return "Sin registro";
    return `Dr. ${stats.lastDoctor.firstName} ${stats.lastDoctor.lastName}`;
  };

  const getLastDoctorSpeciality = () => {
    if (!stats.lastDoctor || !stats.lastDoctor.specialities || stats.lastDoctor.specialities.length === 0) {
      return undefined;
    }
    return stats.lastDoctor.specialities[0]?.name;
  };

  const statsData = [
    {
      title: "Total de Evoluciones",
      value: stats.totalEvoluciones,
      icon: FileText,
      gradient: "bg-gradient-to-br from-greenPrimary to-teal-600",
      subtitle: stats.lastEvolucion ? `Última: ${getLastEvolucionText()}` : undefined,
    },
    {
      title: "Antecedentes Registrados",
      value: stats.totalAntecedentes,
      icon: ClipboardList,
      gradient: "bg-gradient-to-br from-blue-500 to-blue-600",
      subtitle: getAntecedentesText(),
    },
    {
      title: "Medicación Activa",
      value: stats.totalMedicacionActiva,
      icon: Pill,
      gradient: "bg-gradient-to-br from-purple-500 to-purple-600",
      subtitle: stats.totalMedicacionActiva > 0 ? `${stats.totalMedicacionActiva} medicamento${stats.totalMedicacionActiva > 1 ? "s" : ""} activo${stats.totalMedicacionActiva > 1 ? "s" : ""}` : "Sin medicación",
    },
    {
      title: "Último Médico",
      value: getLastDoctorText(),
      icon: UserCheck,
      gradient: "bg-gradient-to-br from-orange-500 to-orange-600",
      subtitle: getLastDoctorSpeciality(),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsData.map((stat, index) => (
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
