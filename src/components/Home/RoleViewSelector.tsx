import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Stethoscope, User } from "lucide-react";
import { motion } from "framer-motion";
import { ActiveHomeView, RoleViewConfig } from "@/types/Home/Home";

interface RoleViewSelectorProps {
  activeView: ActiveHomeView;
  onViewChange: (view: ActiveHomeView) => void;
  config: RoleViewConfig;
}

export const RoleViewSelector = ({
  activeView,
  onViewChange,
  config,
}: RoleViewSelectorProps) => {
  if (!config.hasDualRole) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-2"
    >
      <Tabs
        value={activeView}
        onValueChange={(value) => onViewChange(value as ActiveHomeView)}
        className="w-full"
      >
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-muted/60">
          <TabsTrigger
            value="professional"
            className="flex items-center gap-2 data-[state=active]:bg-greenPrimary data-[state=active]:text-white"
          >
            <Stethoscope className="h-4 w-4" />
            <span className="hidden sm:inline">Vista</span> {config.professionalRoleLabel}
          </TabsTrigger>
          <TabsTrigger
            value="patient"
            className="flex items-center gap-2 data-[state=active]:bg-greenPrimary data-[state=active]:text-white"
          >
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Vista</span> Paciente
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </motion.div>
  );
};
