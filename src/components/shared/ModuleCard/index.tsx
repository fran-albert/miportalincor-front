import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface ModuleCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  onClick: () => void;
  index: number;
  badge?: string | number;
  disabled?: boolean;
  comingSoon?: boolean;
}

export const ModuleCard = ({
  title,
  description,
  icon: Icon,
  gradient,
  onClick,
  index,
  badge,
  disabled = false,
  comingSoon = false,
}: ModuleCardProps) => {
  const isDisabled = disabled || comingSoon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card
        onClick={!isDisabled ? onClick : undefined}
        className={`group relative overflow-hidden h-full transition-all duration-300 ${
          isDisabled
            ? "opacity-60 cursor-not-allowed"
            : "cursor-pointer hover:shadow-xl hover:-translate-y-1"
        }`}
      >
        {/* Gradient overlay on hover */}
        <div className={`absolute inset-0 ${gradient} opacity-0 ${!isDisabled && "group-hover:opacity-5"} transition-opacity duration-300`} />

        <CardHeader className="relative">
          <div className="flex items-start justify-between mb-3">
            <div className={`p-4 rounded-xl ${gradient} ${isDisabled ? "opacity-60" : "group-hover:scale-110"} transition-transform duration-300`}>
              <Icon className="h-8 w-8 text-white" />
            </div>
            {!isDisabled && (
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-greenPrimary group-hover:translate-x-1 transition-all duration-300" />
            )}
            {comingSoon && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">
                Próximamente
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <CardTitle className={`text-xl font-bold ${isDisabled ? "text-gray-500" : "group-hover:text-greenPrimary"} transition-colors`}>
              {title}
            </CardTitle>
            {badge !== undefined && !comingSoon && (
              <Badge className="bg-greenPrimary/10 text-greenPrimary hover:bg-greenPrimary/20">
                {badge}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="relative">
          <CardDescription className={`text-sm ${isDisabled ? "text-gray-400" : "text-gray-600"}`}>
            {description}
          </CardDescription>
        </CardContent>
      </Card>
    </motion.div>
  );
};
