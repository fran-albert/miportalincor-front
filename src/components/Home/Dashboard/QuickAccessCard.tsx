import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface QuickAccessCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  index: number;
}

export const QuickAccessCard = ({
  title,
  description,
  icon: Icon,
  href,
  index,
}: QuickAccessCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Link to={href}>
        <Card className="group relative overflow-hidden border-2 border-transparent hover:border-greenPrimary/20 transition-all duration-300 h-full hover:shadow-xl hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-greenPrimary/5 to-teal-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <CardHeader className="relative">
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-greenPrimary to-teal-600 group-hover:scale-110 transition-transform duration-300">
                <Icon className="h-6 w-6 text-white" />
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-greenPrimary group-hover:translate-x-1 transition-all duration-300" />
            </div>
            <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-greenPrimary transition-colors">
              {title}
            </CardTitle>
          </CardHeader>

          <CardContent className="relative">
            <CardDescription className="text-sm text-gray-600">
              {description}
            </CardDescription>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};
