import { Card, CardContent } from "@/components/ui/card";
import { FileText, Briefcase, Activity, LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Collaborator } from "@/types/Collaborator/Collaborator";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  gradient: string;
  index: number;
  linkTo?: string;
  subtitle?: string;
  isLoading?: boolean;
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

  const CardWrapper = linkTo ? Link : "div";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <CardWrapper to={linkTo || ""} className={linkTo ? "block" : ""}>
        <Card
          className={`overflow-hidden border-0 shadow-md ${
            linkTo
              ? "hover:shadow-xl transition-shadow duration-300 cursor-pointer"
              : ""
          }`}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <p className="text-sm font-medium text-gray-600">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
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
  collaborator: Collaborator;
  stats: {
    totalExamenes: number;
    lastExamDate?: string;
    lastExamType?: string;
    totalEvoluciones?: number;
  };
  isLoading?: boolean;
}

export const StatsCards = ({
  collaborator,
  stats,
  isLoading = false,
}: StatsCardsProps) => {
  const collaboratorSlug = `${collaborator.firstName.toLowerCase()}-${collaborator.lastName.toLowerCase()}-${collaborator.id}`;

  const statsData = [
    {
      title: "Total de Exámenes",
      value: stats.totalExamenes,
      icon: FileText,
      gradient: "bg-gradient-to-br from-blue-500 to-blue-600",
      linkTo: `/incor-laboral/colaboradores/${collaboratorSlug}/examenes`,
      subtitle: stats.lastExamDate ? `Último: ${stats.lastExamDate}` : "Sin exámenes",
    },
    {
      title: "Puesto Actual",
      value: collaborator.positionJob || "Sin asignar",
      icon: Briefcase,
      gradient: "bg-gradient-to-br from-greenPrimary to-teal-600",
      subtitle: collaborator.company?.name || "Sin empresa",
    },
    {
      title: "Total Evoluciones",
      value: stats.totalEvoluciones || 0,
      icon: Activity,
      gradient: "bg-gradient-to-br from-purple-500 to-purple-600",
      subtitle: stats.totalEvoluciones ? `${stats.totalEvoluciones} registros` : "Sin evoluciones",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
