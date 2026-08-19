import { apiTurnos } from "@/services/axiosConfig";
import { ConsultationTypeResponseDto } from "@/types/ConsultationType/ConsultationType";

/**
 * Las ecografías que se pueden solicitar en el control ginecológico integral.
 *
 * Es un subconjunto del catálogo, declarado por el flag `isIntegralCheckupEco`
 * y editable por ABM: el catálogo tiene 15 subtipos de eco y la ginecóloga
 * pide un puñado. La lista va a cambiar y por eso vive en la base, no en el
 * código.
 */
export const getIntegralCheckupEcos = async (): Promise<
  ConsultationTypeResponseDto[]
> => {
  const { data } = await apiTurnos.get<ConsultationTypeResponseDto[]>(
    'consultation-types/integral-checkup-ecos',
  );
  return data;
};
