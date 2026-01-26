import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { FileText, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { NotificationBell } from "./NotificationBell";
import {
  usePrescriptionNotifications,
  useLatestPendingRequests,
} from "@/hooks/Prescription-Request/usePrescriptionNotifications";
import { cn } from "@/lib/utils";

export function PrescriptionNotificationDropdown() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const { pendingCount, isLoading: isCountLoading } =
    usePrescriptionNotifications({
      enabled: true,
      showToasts: true,
    });

  const { requests, isLoading: isRequestsLoading } = useLatestPendingRequests(
    open, // Only fetch when dropdown is open
    5
  );

  const handleViewAll = () => {
    setOpen(false);
    navigate("/solicitudes-recetas");
  };

  const handleRequestClick = (requestId: string) => {
    setOpen(false);
    navigate(`/solicitudes-recetas?request=${requestId}`);
  };

  const formatRelativeTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: es,
      });
    } catch {
      return "";
    }
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full hover:bg-gray-100"
          aria-label={`Notificaciones${pendingCount > 0 ? ` (${pendingCount} pendientes)` : ""}`}
        >
          {isCountLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          ) : (
            <NotificationBell count={pendingCount} />
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-80 p-0"
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="bg-greenPrimary text-white px-4 py-3 rounded-t-md">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <span className="font-semibold">Solicitudes de Recetas</span>
          </div>
          {pendingCount > 0 && (
            <p className="text-sm text-white/80 mt-1">
              {pendingCount} solicitud{pendingCount !== 1 ? "es" : ""} pendiente
              {pendingCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="max-h-[300px] overflow-y-auto">
          {isRequestsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-greenPrimary" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 px-4">
              <FileText className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">
                No tenés solicitudes pendientes
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {requests.map((request) => (
                <li key={request.id}>
                  <button
                    onClick={() => handleRequestClick(String(request.id))}
                    className={cn(
                      "w-full text-left px-4 py-3 hover:bg-gray-50",
                      "transition-colors duration-150",
                      "focus:outline-none focus:bg-gray-50"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">
                          {request.patient?.firstName}{" "}
                          {request.patient?.lastName}
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {truncateText(request.description)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {request.createdAt &&
                            formatRelativeTime(request.createdAt)}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 p-2">
          <Button
            variant="ghost"
            className="w-full justify-center text-greenPrimary hover:text-greenPrimary hover:bg-green-50"
            onClick={handleViewAll}
          >
            Ver todas las solicitudes
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
