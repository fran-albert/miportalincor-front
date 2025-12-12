import { useQuery } from '@tanstack/react-query';
import { getMyDoctorProfile, type MyDoctorProfile } from '@/api/Doctor/get-my-doctor-profile.action';

export const myDoctorProfileKeys = {
  all: ['myDoctorProfile'] as const,
  profile: () => [...myDoctorProfileKeys.all, 'profile'] as const,
};

/**
 * Hook para obtener el perfil del médico logueado.
 * Usa el endpoint /doctors/me del backend de turnos.
 * Cacheado para evitar llamadas repetidas.
 */
export const useMyDoctorProfile = () => {
  return useQuery<MyDoctorProfile>({
    queryKey: myDoctorProfileKeys.profile(),
    queryFn: getMyDoctorProfile,
    staleTime: 1000 * 60 * 30, // 30 minutos - el perfil no cambia frecuentemente
    gcTime: 1000 * 60 * 60, // 1 hora de cache
    retry: 1,
  });
};
