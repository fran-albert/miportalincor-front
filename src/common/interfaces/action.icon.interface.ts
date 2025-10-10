import { LucideIcon } from "lucide-react";

export interface IActionIcon {
  icon: LucideIcon | React.ComponentType<{ className?: string }> | React.ReactElement;
  tooltip: string;
  color?: string;
  onClick?: () => void;
  tooltipColor?: string;
}
