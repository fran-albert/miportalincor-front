export const normalizeDoctorUserId = (userId: unknown) => {
  const normalized = Number(userId);
  return Number.isInteger(normalized) && normalized > 0 ? normalized : null;
};
