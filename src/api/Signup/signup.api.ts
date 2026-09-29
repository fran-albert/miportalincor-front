import { apiIncorHC } from "@/services/axiosConfig";
import {
  CompleteSignupPayload,
  SignupHealthInsurance,
  SignupPrefill,
  SignupSession,
} from "@/types/Signup/Signup";

/** Alta autogestionada en Mi Portal: endpoints públicos de historia clínica. */

export const getSignupPrefill = async (token: string): Promise<SignupPrefill> => {
  const { data } = await apiIncorHC.post<SignupPrefill>("public/signup/prefill", {
    token,
  });
  return data;
};

export const checkSignupDni = async (
  dni: string
): Promise<{ hasAccount: boolean }> => {
  const { data } = await apiIncorHC.post<{ hasAccount: boolean }>(
    "public/signup/check-dni",
    { dni }
  );
  return data;
};

export const getSignupHealthInsurances = async (): Promise<
  SignupHealthInsurance[]
> => {
  const { data } = await apiIncorHC.get<SignupHealthInsurance[]>(
    "public/signup/health-insurances"
  );
  return data;
};

export const completeSignup = async (
  payload: CompleteSignupPayload
): Promise<SignupSession> => {
  const { data } = await apiIncorHC.post<SignupSession>(
    "public/signup/complete",
    payload
  );
  return data;
};
