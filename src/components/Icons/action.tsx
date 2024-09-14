import { IActionIcon } from "@/common/interfaces/action.icon.interface";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ActionIcon = ({ icon, tooltip, color, onClick }: IActionIcon) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`text-lg cursor-pointer active:opacity-50 ${color}`}
            onClick={onClick}
          >
            {icon}
          </div>
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ActionIcon;
