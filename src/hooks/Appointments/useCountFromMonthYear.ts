// src/hooks/Appointments/useCountsFromMonthlyAppointments.ts
import { useMemo } from "react"
import { useGetByMonthYear } from "./useGetByMonthYear"
import { AppointmentStatus, AppointmentDetailedDto } from "@/types/Appointment/Appointment"

export interface Counts {
  pending: number
  waiting: number
  attending: number
  completed: number
  cancelled: number
}

export interface CountByDay {
  date: string        // "YYYY-MM-DD"
  counts: Counts
}

export function useCountFromMonthYear(year: string, month: string) {
  const { data: monthTurns = [], isLoading, isError } =
    useGetByMonthYear({ year, month })

  const countsByDay = useMemo<CountByDay[]>(() => {
    const map: Record<string, Counts> = {}

    monthTurns.forEach((t: AppointmentDetailedDto) => {
      const d = t.date // ya en "YYYY-MM-DD"
      if (!map[d]) {
        map[d] = { pending: 0, waiting: 0, attending: 0, completed: 0, cancelled: 0 }
      }
      switch (t.status) {
        case AppointmentStatus.PENDING:
        case AppointmentStatus.REQUESTED_BY_PATIENT:
        case AppointmentStatus.ASSIGNED_BY_SECRETARY:
          map[d].pending++; break
        case AppointmentStatus.WAITING:
          map[d].waiting++; break
        case AppointmentStatus.ATTENDING:
          map[d].attending++; break
        case AppointmentStatus.COMPLETED:
          map[d].completed++; break
        case AppointmentStatus.CANCELLED_BY_PATIENT:
        case AppointmentStatus.CANCELLED_BY_SECRETARY:
          map[d].cancelled++; break
      }
    })

    return Object.entries(map).map(([date, counts]) => ({ date, counts }))
  }, [monthTurns])

  return { countsByDay, isLoading, isError }
}

// Legacy export for backwards compatibility
export const useCountsFromMonthlyAppointments = useCountFromMonthYear;
