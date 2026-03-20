import type { GreenCardItem } from "@/types/Green-Card/GreenCard";

const TEXT_SCHEDULE_MINUTES: Record<string, number> = {
  ayuno: 6 * 60,
  desayuno: 8 * 60,
  "media mañana": 10 * 60,
  almuerzo: 13 * 60,
  merienda: 17 * 60,
  cena: 21 * 60,
  "antes de dormir": 23 * 60,
};

const TIME_SCHEDULE_REGEX = /^\d{2}:\d{2}$/;

const normalizeSchedule = (schedule: string) => schedule.trim().toLowerCase();

const parseScheduleMinutes = (schedule: string) => {
  const normalizedSchedule = normalizeSchedule(schedule);

  if (TEXT_SCHEDULE_MINUTES[normalizedSchedule] !== undefined) {
    return TEXT_SCHEDULE_MINUTES[normalizedSchedule];
  }

  if (TIME_SCHEDULE_REGEX.test(schedule)) {
    const [hours, minutes] = schedule.split(":").map(Number);
    return hours * 60 + minutes;
  }

  return Number.POSITIVE_INFINITY;
};

const getScheduleTypeRank = (schedule: string) => {
  const normalizedSchedule = normalizeSchedule(schedule);

  if (TEXT_SCHEDULE_MINUTES[normalizedSchedule] !== undefined) {
    return 0;
  }

  if (TIME_SCHEDULE_REGEX.test(schedule)) {
    return 1;
  }

  return 2;
};

const parseComparableDate = (value: GreenCardItem["createdAt"] | GreenCardItem["updatedAt"]) => {
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? Number.POSITIVE_INFINITY : timestamp;
};

export const compareGreenCardSchedules = (left: string, right: string) => {
  const minuteDiff = parseScheduleMinutes(left) - parseScheduleMinutes(right);
  if (minuteDiff !== 0) {
    return minuteDiff;
  }

  const typeRankDiff = getScheduleTypeRank(left) - getScheduleTypeRank(right);
  if (typeRankDiff !== 0) {
    return typeRankDiff;
  }

  return left.localeCompare(right, "es", { sensitivity: "base" });
};

export const sortGreenCardSchedules = (schedules: string[]) =>
  [...schedules].sort(compareGreenCardSchedules);

export const compareGreenCardItems = (left: GreenCardItem, right: GreenCardItem) => {
  const scheduleDiff = compareGreenCardSchedules(left.schedule || "", right.schedule || "");
  if (scheduleDiff !== 0) {
    return scheduleDiff;
  }

  const displayOrderDiff = (left.displayOrder ?? Number.POSITIVE_INFINITY) - (right.displayOrder ?? Number.POSITIVE_INFINITY);
  if (displayOrderDiff !== 0) {
    return displayOrderDiff;
  }

  const createdAtDiff = parseComparableDate(left.createdAt) - parseComparableDate(right.createdAt);
  if (createdAtDiff !== 0) {
    return createdAtDiff;
  }

  const medicationNameDiff = left.medicationName.localeCompare(right.medicationName, "es", {
    sensitivity: "base",
  });
  if (medicationNameDiff !== 0) {
    return medicationNameDiff;
  }

  return left.id.localeCompare(right.id, "es", { sensitivity: "base" });
};
