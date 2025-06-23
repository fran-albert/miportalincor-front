// src/hooks/Appointments/useCountsFromMonthlyAppointments.ts
import { useMemo } from "react"
import { useGetByMonthYear } from "./useGetByMonthYear"
import { AppointmentStatus } from "@/types/Appointment/Appointment"

export interface Counts {
  confirmado: number
  pendiente: number
  completado: number
  cancelado: number
}

export interface CountByDay {
  date: string        // "YYYY-MM-DD"
  counts: Counts
}

export function useCountsFromMonthlyAppointments(year: string, month: string) {
  const { data: monthTurns = [], isLoading, isError } =
    useGetByMonthYear({ year, month })

  const countsByDay = useMemo<CountByDay[]>(() => {
    const map: Record<string, Counts> = {}

    monthTurns.forEach((t) => {
      const d = t.date // ya en "YYYY-MM-DD"
      if (!map[d]) {
        map[d] = { confirmado: 0, pendiente: 0, completado: 0, cancelado: 0 }
      }
      switch (t.status) {
        case AppointmentStatus.CONFIRMADO: map[d].confirmado++; break
        case AppointmentStatus.PENDIENTE:   map[d].pendiente++; break
        case AppointmentStatus.COMPLETADO: map[d].completado++; break
        case AppointmentStatus.CANCELADO:  map[d].cancelado++; break
      }
    })

    return Object.entries(map).map(([date, counts]) => ({ date, counts }))
  }, [monthTurns])

  return { countsByDay, isLoading, isError }
}
