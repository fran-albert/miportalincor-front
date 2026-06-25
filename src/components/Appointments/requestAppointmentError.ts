type AppointmentRequestErrorResponse = {
  error?: unknown;
  message?: unknown;
};

const normalizeErrorValue = (value: unknown): string | null => {
  if (Array.isArray(value)) {
    const message = value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean)
      .join(" ");

    return message || null;
  }

  if (typeof value === "string") {
    const message = value.trim();
    return message || null;
  }

  return null;
};

export const getAppointmentRequestErrorMessage = (error: unknown): string => {
  const responseData = (error as {
    response?: { data?: AppointmentRequestErrorResponse };
  })?.response?.data;

  return (
    normalizeErrorValue(responseData?.message) ||
    normalizeErrorValue(responseData?.error) ||
    "No pudimos reservar el turno."
  );
};
