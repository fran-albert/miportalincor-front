import { WeekDays } from "@/types/DoctorAvailability";

const argentinaWeekDays: WeekDays[] = [
  WeekDays.SUNDAY,
  WeekDays.MONDAY,
  WeekDays.TUESDAY,
  WeekDays.WEDNESDAY,
  WeekDays.THURSDAY,
  WeekDays.FRIDAY,
  WeekDays.SATURDAY,
];

export const getArgentinaTodayDate = (date = new Date()): string =>
  date.toLocaleDateString("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
  });

export const getArgentinaWeekDay = (date = new Date()): WeekDays => {
  const argentinaDate = new Date(
    date.toLocaleString("en-US", {
      timeZone: "America/Argentina/Buenos_Aires",
    })
  );

  return argentinaWeekDays[argentinaDate.getDay()];
};
