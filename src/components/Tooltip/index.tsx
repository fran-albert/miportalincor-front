import React from "react";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface TooltipWithInfoProps {
  infoMessage: string;
}

const TooltipInfo: React.FC<TooltipWithInfoProps> = ({ infoMessage }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-pointer">
            <Info className="text-gray-500" size={15}/>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{infoMessage}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TooltipInfo;
