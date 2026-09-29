import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { KeyRound, LogIn, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDni } from "@/common/helpers/helpers";
import {
  checkSignupDni,
  completeSignup,
  getSignupHealthInsurances,
  getSignupPrefill,
} from "@/api/Signup/signup.api";
import { getStates } from "@/api/State/get-state";
import { getCityByState } from "@/api/City/get-city-by-state.action";
import { loginSuccess } from "@/store/authSlice";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { ApiError } from "@/types/Error/ApiError";
import { SIGNUP_ERROR_CODES } from "@/types/Signup/Signup";
import { SignupShell } from "./SignupShell";
import { StepFrame } from "./StepFrame";
import { StepDni } from "./steps/StepDni";
import { StepPersonal } from "./steps/StepPersonal";
import { StepHealthInsurance } from "./steps/StepHealthInsurance";
import { StepAddress } from "./steps/StepAddress";
import { StepPassword } from "./steps/StepPassword";
import { StepSummary } from "./steps/StepSummary";
import {
  DATA_STEP_ORDER,
  DataStep,
  EMPTY_SIGNUP_FORM,
  SignupFormData,
  SignupScreen,
} from "./types";
import {
  normalizeAffiliationNumber,
  normalizeArgentineMobile,
  parseBirthDate,
} from "./signup.schemas";
import { readSignupTokenFromHash } from "./signup.utils";

const GENERIC_ERROR =
  "No pudimos crear tu cuenta. Probá de nuevo en un rato o acercate a recepción.";

const errorCodeOf = (error: unknown): string | undefined =>
  (error as ApiError).response?.data?.code;

const errorMessageOf = (error: unknown): string | undefined => {
  const message = (error as ApiError).response?.data?.message;
  return typeof message === "string" ? message : undefined;
};

export function SignupWizard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showSuccess } = useToastContext();

  const [token, setToken] = useState<string | null>(null);
  const [dniLocked, setDniLocked] = useState(false);
  const [tokenExpired, setTokenExpired] = useState(false);
  const [isPrefilling, setIsPrefilling] = useState(true);
  const [screen, setScreen] = useState<SignupScreen>("dni");
  const [returnToSummary, setReturnToSummary] = useState(false);
  const [data, setData] = useState<SignupFormData>(EMPTY_SIGNUP_FORM);
  const [isCheckingDni, setIsCheckingDni] = useState(false);
  const [dniError, setDniError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>();
  const didReadToken = useRef(false);

  const patch = (changes: Partial<SignupFormData>) =>
    setData((current) => ({ ...current, ...changes }));

  useEffect(() => {
    if (didReadToken.current) return;
    didReadToken.current = true;
    const fromHash = readSignupTokenFromHash();
    if (!fromHash) {
      setIsPrefilling(false);
      return;
    }
    getSignupPrefill(fromHash)
      .then((prefill) => {
        setToken(fromHash);
        setDniLocked(true);
        setData((current) => ({
          ...current,
          dni: prefill.dni,
          firstName: prefill.firstName ?? "",
          lastName: prefill.lastName ?? "",
          phone: prefill.phone ?? "",
          email: prefill.email ?? "",
        }));
      })
      .catch(() => setTokenExpired(true))
      .finally(() => setIsPrefilling(false));
  }, []);

  const insurancesQuery = useQuery({
    queryKey: ["signup-health-insurances"],
    queryFn: getSignupHealthInsurances,
    staleTime: 1000 * 60 * 10,
  });
  const statesQuery = useQuery({
    queryKey: ["signup-states"],
    queryFn: getStates,
    staleTime: 1000 * 60 * 60,
  });
  const citiesQuery = useQuery({
    queryKey: ["signup-cities", data.stateId],
    queryFn: () => getCityByState(data.stateId as number),
    enabled: data.stateId !== null,
    staleTime: 1000 * 60 * 60,
  });

  const goTo = (next: SignupScreen) => {
    setScreen(next);
    window.scrollTo({ top: 0 });
  };

  /** Siguiente: al paso que sigue o, si vino a editar, de vuelta al resumen. */
  const advanceFrom = (step: DataStep) => {
    if (returnToSummary) {
      setReturnToSummary(false);
      goTo("summary");
      return;
    }
    const index = DATA_STEP_ORDER.indexOf(step);
    goTo(DATA_STEP_ORDER[index + 1] ?? "summary");
  };

  const backFrom = (step: DataStep) => {
    if (returnToSummary) {
      setReturnToSummary(false);
      goTo("summary");
      return;
    }
    const index = DATA_STEP_ORDER.indexOf(step);
    if (index > 0) goTo(DATA_STEP_ORDER[index - 1]);
  };

  const nextLabel = returnToSummary ? "Volver al resumen" : "Siguiente";

  const handleDniNext = async () => {
    setDniError(undefined);
    setIsCheckingDni(true);
    try {
      const { hasAccount } = await checkSignupDni(data.dni);
      if (hasAccount) {
        goTo("has-account");
      } else {
        advanceFrom("dni");
      }
    } catch {
      setDniError(
        "No pudimos verificar tu DNI. Probá de nuevo en un rato."
      );
    } finally {
      setIsCheckingDni(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitError(undefined);
    setIsSubmitting(true);
    const birthDate = parseBirthDate(data.birthDate);
    const phone = normalizeArgentineMobile(data.phone);
    if (!birthDate || !phone || data.healthPlanId === null || data.cityId === null) {
      setIsSubmitting(false);
      setSubmitError("Revisá los datos marcados antes de crear la cuenta.");
      return;
    }
    try {
      const session = await completeSignup({
        ...(token ? { token } : {}),
        dni: data.dni,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        phone,
        ...(data.email.trim() ? { email: data.email.trim() } : {}),
        birthDate,
        healthPlanId: data.healthPlanId,
        ...(data.requiresAffiliationNumber
          ? { affiliationNumber: normalizeAffiliationNumber(data.affiliationNumber) }
          : {}),
        address: {
          cityId: data.cityId,
          street: data.street.trim(),
          number: data.number.trim(),
          ...(data.description.trim()
            ? { description: data.description.trim() }
            : {}),
        },
        password: data.password,
      });
      dispatch(loginSuccess({ token: session.token }));
      showSuccess("¡Listo! Tu cuenta quedó creada", "Ya podés ver tus turnos.");
      navigate("/mis-turnos", { replace: true });
    } catch (error) {
      const code = errorCodeOf(error);
      if (code === SIGNUP_ERROR_CODES.DNI_HAS_ACCOUNT) {
        goTo("has-account");
      } else if (code === SIGNUP_ERROR_CODES.TOKEN_INVALID) {
        // El link venció mientras completaba: se sigue sin token.
        setToken(null);
        setSubmitError(
          "El link para crear la cuenta venció. Tus datos siguen cargados: tocá Crear mi cuenta de nuevo."
        );
      } else {
        setSubmitError(errorMessageOf(error) ?? GENERIC_ERROR);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isPrefilling) {
    return (
      <SignupShell>
        <div className="py-16 text-center text-gray-500" role="status">
          Cargando tus datos…
        </div>
      </SignupShell>
    );
  }

  return (
    <SignupShell>
      {screen === "dni" && (
        <StepDni
          data={data}
          onChange={patch}
          onNext={handleDniNext}
          locked={dniLocked}
          tokenExpired={tokenExpired}
          isChecking={isCheckingDni}
          error={dniError}
        />
      )}
      {screen === "personal" && (
        <StepPersonal
          data={data}
          onChange={patch}
          onBack={() => backFrom("personal")}
          onNext={() => advanceFrom("personal")}
          nextLabel={nextLabel}
        />
      )}
      {screen === "health" && (
        <StepHealthInsurance
          data={data}
          onChange={patch}
          onBack={() => backFrom("health")}
          onNext={() => advanceFrom("health")}
          nextLabel={nextLabel}
          insurances={insurancesQuery.data ?? []}
          isLoading={insurancesQuery.isLoading}
          loadError={insurancesQuery.isError}
        />
      )}
      {screen === "address" && (
        <StepAddress
          data={data}
          onChange={patch}
          onBack={() => backFrom("address")}
          onNext={() => advanceFrom("address")}
          nextLabel={nextLabel}
          states={statesQuery.data ?? []}
          cities={citiesQuery.data ?? []}
          isLoadingCities={citiesQuery.isLoading && data.stateId !== null}
        />
      )}
      {screen === "password" && (
        <StepPassword
          data={data}
          onChange={patch}
          onBack={() => backFrom("password")}
          onNext={() => advanceFrom("password")}
          nextLabel={nextLabel}
        />
      )}
      {screen === "summary" && (
        <StepSummary
          data={data}
          dniLocked={dniLocked}
          onEdit={(step) => {
            setReturnToSummary(true);
            goTo(step);
          }}
          onBack={() => goTo("password")}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          error={submitError}
        />
      )}
      {screen === "has-account" && (
        <HasAccount
          dni={data.dni}
          canUseAnotherDni={!dniLocked}
          onUseAnotherDni={() => {
            patch({ dni: "" });
            goTo("dni");
          }}
        />
      )}
    </SignupShell>
  );
}

function HasAccount({
  dni,
  canUseAnotherDni,
  onUseAnotherDni,
}: {
  dni: string;
  canUseAnotherDni: boolean;
  onUseAnotherDni: () => void;
}) {
  return (
    <StepFrame title="Ya tenés cuenta en Mi Portal">
      <div className="space-y-5" data-testid="signup-has-account">
        <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4">
          <UserCheck className="h-5 w-5 mt-0.5 shrink-0 text-greenPrimary" />
          <p className="text-gray-700">
            El DNI <strong>{formatDni(dni)}</strong> ya tiene una cuenta. Entrá
            con tu DNI y tu contraseña.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Button asChild variant="incor" className="h-12 text-base font-medium">
            <Link to="/iniciar-sesion">
              <LogIn className="h-4 w-4 mr-2" />
              Iniciar sesión
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-12 text-base border-gray-300">
            <Link to="/restablecer-contrase%C3%B1a">
              <KeyRound className="h-4 w-4 mr-2" />
              Olvidé mi contraseña
            </Link>
          </Button>
        </div>
        <p className="text-sm text-gray-500">
          Para recuperar la contraseña te mandamos un email. Si no tenés email
          cargado, acercate a recepción.
        </p>
        {canUseAnotherDni && (
          <button
            type="button"
            className="text-sm font-medium text-greenPrimary hover:text-teal-700"
            onClick={onUseAnotherDni}
          >
            Me equivoqué de DNI
          </button>
        )}
      </div>
    </StepFrame>
  );
}
