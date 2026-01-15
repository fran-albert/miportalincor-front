import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Stethoscope,
  CheckCircle,
  ArrowRight,
  X,
  ChevronUp,
} from "lucide-react";
import {
  useDoctorDayAgenda,
  isAttending,
} from "@/hooks/Doctor/useDoctorDayAgenda";
import { useAppointmentMutations } from "@/hooks/Appointments/useAppointmentMutations";
import { useOverturnMutations } from "@/hooks/Overturns/useOverturnMutations";
import { AppointmentStatus } from "@/types/Appointment/Appointment";
import { OverturnStatus } from "@/types/Overturn/Overturn";
import useUserRole from "@/hooks/useRoles";
import { FEATURE_FLAGS } from "@/common/constants/featureFlags";
import { useToastContext } from "@/hooks/Toast/toast-context";

export const AttendingPatientFAB = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDoctor } = useUserRole();
  const { showSuccess, showError } = useToastContext();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  const { agenda } = useDoctorDayAgenda({ refetchInterval: 15000 });
  const appointmentMutations = useAppointmentMutations();
  const overturnMutations = useOverturnMutations();

  // Encontrar paciente en atención
  const attendingItem = agenda.find((item) => isAttending(item.status));

  // No mostrar si:
  // - No es médico
  // - No hay paciente en atención
  // - Ya está en la sala de espera
  // - Feature flag desactivado
  if (
    !isDoctor ||
    !attendingItem ||
    location.pathname === "/mi-sala-de-espera" ||
    !FEATURE_FLAGS.APPOINTMENTS_ENABLED
  ) {
    return null;
  }

  const patientName = attendingItem.patient
    ? `${attendingItem.patient.firstName} ${attendingItem.patient.lastName}`
    : "Paciente";

  const isChangingStatus =
    (attendingItem.type === "appointment" && appointmentMutations.isChangingStatus) ||
    (attendingItem.type === "overturn" && overturnMutations.isChangingStatus);

  const handleComplete = () => {
    const onSuccess = () => {
      showSuccess(`Turno de ${patientName} completado correctamente`);
    };
    const onError = () => {
      showError("Error al completar el turno");
    };

    if (attendingItem.type === "appointment") {
      appointmentMutations.changeStatus.mutate(
        {
          id: attendingItem.id,
          status: AppointmentStatus.COMPLETED,
        },
        { onSuccess, onError }
      );
    } else {
      overturnMutations.changeStatus.mutate(
        {
          id: attendingItem.id,
          status: OverturnStatus.COMPLETED,
        },
        { onSuccess, onError }
      );
    }
  };

  const handleGoToWaitingRoom = () => {
    navigate("/mi-sala-de-espera");
  };

  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={() => setIsMinimized(false)}
          className="h-14 w-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all"
        >
          <Stethoscope className="h-6 w-6" />
        </Button>
        <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full animate-pulse" />
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-green-200 overflow-hidden min-w-[280px]">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <Stethoscope className="h-5 w-5" />
              <span className="font-semibold">Atendiendo</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-white hover:bg-white/20"
                onClick={() => setIsMinimized(true)}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-white hover:bg-white/20"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="p-4 space-y-3">
                  {/* Patient Info */}
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-green-700 font-bold text-lg">
                        {patientName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{patientName}</p>
                      <p className="text-sm text-gray-500">
                        {attendingItem.hour} - {attendingItem.type === "appointment" ? "Turno" : "Sobreturno"}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-green-300 text-green-700 hover:bg-green-50"
                      onClick={handleGoToWaitingRoom}
                    >
                      <ArrowRight className="h-4 w-4 mr-1" />
                      Ir a Sala
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                      onClick={handleComplete}
                      disabled={isChangingStatus}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {isChangingStatus ? "..." : "Completar"}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AttendingPatientFAB;
