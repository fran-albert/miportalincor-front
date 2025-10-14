import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, ClipboardList, Clock, LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

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
      <Card className="overflow-hidden border-0 shadow-md">
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

interface StatsCardsProps {
  stats: {
    totalCollaborators: number;
    activeCollaborators: number;
    pendingExams: number;
    lastUpdate: Date | string | null;
  };
  isLoading?: boolean;
}

export const StatsCards = ({ stats, isLoading = false }: StatsCardsProps) => {
  const getLastUpdateText = () => {
    if (!stats.lastUpdate) return "Sin actualizaciones";
    const date = new Date(stats.lastUpdate);
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const statsData = [
    {
      title: "Total de Colaboradores",
      value: stats.totalCollaborators,
      icon: Users,
      gradient: "bg-gradient-to-br from-blue-500 to-blue-600",
      subtitle: `${stats.activeCollaborators} activos`,
    },
    {
      title: "Colaboradores Activos",
      value: stats.activeCollaborators,
      icon: UserCheck,
      gradient: "bg-gradient-to-br from-greenPrimary to-teal-600",
      subtitle: "Con exámenes al día",
    },
    {
      title: "Exámenes Pendientes",
      value: stats.pendingExams,
      icon: ClipboardList,
      gradient: "bg-gradient-to-br from-orange-500 to-orange-600",
      subtitle: stats.pendingExams > 0 ? "Requieren atención" : "Todo al día",
    },
    {
      title: "Última Actualización",
      value: getLastUpdateText(),
      icon: Clock,
      gradient: "bg-gradient-to-br from-purple-500 to-purple-600",
      subtitle: "Registro de colaboradores",
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
