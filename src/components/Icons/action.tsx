import { IActionIcon } from "@/common/interfaces/action.icon.interface";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React from "react";

const ActionIcon = ({ icon, tooltip, color, onClick }: IActionIcon) => {
  // Si icon es un componente (LucideIcon o ComponentType), lo renderizamos como JSX
  const IconElement = React.isValidElement(icon)
    ? icon
    : React.createElement(icon as React.ComponentType);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`text-lg cursor-pointer active:opacity-50 ${color}`}
            onClick={onClick}
          >
            {IconElement}
          </div>
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ActionIcon;
