import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsCardProps {
  title: string;
  value: number;
  lastMonthValue?: number;
  icon: LucideIcon;
  gradient: string;
  isLoading?: boolean;
}

export const StatsCard = ({
  title,
  value,
  lastMonthValue,
  icon: Icon,
  gradient,
  isLoading = false,
}: StatsCardProps) => {
  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="space-y-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <motion.p
                className="text-3xl font-bold text-gray-900"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
              >
                {value.toLocaleString()}
              </motion.p>
              {lastMonthValue !== undefined && lastMonthValue > 0 && (
                <div className="flex items-center gap-1 text-sm">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-green-600 font-medium">
                    +{lastMonthValue}
                  </span>
                  <span className="text-gray-500">últimos 30 días</span>
                </div>
              )}
            </div>
            <div className={`p-3 rounded-xl ${gradient}`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
