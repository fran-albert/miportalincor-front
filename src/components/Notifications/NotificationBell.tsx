import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationBellProps {
  count: number;
  className?: string;
}

export function NotificationBell({ count, className }: NotificationBellProps) {
  const displayCount = count > 9 ? "9+" : count.toString();
  const hasNotifications = count > 0;

  return (
    <div className={cn("relative", className)}>
      <Bell className="h-5 w-5" />
      {hasNotifications && (
        <span
          className={cn(
            "absolute -top-1.5 -right-1.5 flex items-center justify-center",
            "min-w-[18px] h-[18px] px-1 rounded-full",
            "bg-red-500 text-white text-[10px] font-bold",
            "animate-in zoom-in-50 duration-200"
          )}
        >
          {displayCount}
        </span>
      )}
    </div>
  );
}
