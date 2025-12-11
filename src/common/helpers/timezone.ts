import moment from 'moment-timezone';

const ARGENTINA_TZ = 'America/Argentina/Buenos_Aires';

/**
 * Convierte una fecha a la zona horaria de Argentina
 */
export const toArgentinaTime = (date: string | Date): moment.Moment => {
  return moment(date).tz(ARGENTINA_TZ);
};

/**
 * Obtiene la fecha actual en Argentina (formato YYYY-MM-DD)
 */
export const getTodayDateAR = (): string => {
  return moment().tz(ARGENTINA_TZ).format('YYYY-MM-DD');
};

/**
 * Obtiene la hora actual en Argentina (formato HH:mm)
 */
export const getCurrentTimeAR = (): string => {
  return moment().tz(ARGENTINA_TZ).format('HH:mm');
};

/**
 * Formatea una fecha al formato argentino (DD/MM/YYYY)
 */
export const formatDateAR = (date: string | Date): string => {
  if (!date) return '-';
  return toArgentinaTime(date).format('DD/MM/YYYY');
};

/**
 * Formatea una hora (HH:mm:ss -> HH:mm)
 */
export const formatTimeAR = (time: string): string => {
  if (!time) return '-';
  return moment(time, 'HH:mm:ss').format('HH:mm');
};

/**
 * Formatea fecha y hora juntas (DD/MM/YYYY HH:mm)
 */
export const formatDateTimeAR = (date: string | Date, time?: string): string => {
  if (!date) return '-';
  const datePart = formatDateAR(date);
  if (time) {
    return `${datePart} ${formatTimeAR(time)}`;
  }
  return datePart;
};

/**
 * Formatea una fecha con el día de la semana (ej: "Lunes, 15 de enero de 2025")
 */
export const formatDateWithWeekdayAR = (date: string | Date): string => {
  if (!date) return '-';
  return toArgentinaTime(date).locale('es').format('dddd, D [de] MMMM [de] YYYY');
};

/**
 * Formatea una fecha corta con día de semana (ej: "Lun 15/01")
 */
export const formatShortDateWithWeekdayAR = (date: string | Date): string => {
  if (!date) return '-';
  return toArgentinaTime(date).locale('es').format('ddd DD/MM');
};

/**
 * Obtiene el inicio del día en Argentina
 */
export const getStartOfDayAR = (date: string | Date): moment.Moment => {
  return toArgentinaTime(date).startOf('day');
};

/**
 * Obtiene el fin del día en Argentina
 */
export const getEndOfDayAR = (date: string | Date): moment.Moment => {
  return toArgentinaTime(date).endOf('day');
};

/**
 * Verifica si una fecha es hoy en Argentina
 */
export const isTodayAR = (date: string | Date): boolean => {
  return toArgentinaTime(date).isSame(moment().tz(ARGENTINA_TZ), 'day');
};

/**
 * Verifica si una fecha ya pasó
 */
export const isPastDateAR = (date: string | Date): boolean => {
  return toArgentinaTime(date).isBefore(moment().tz(ARGENTINA_TZ), 'day');
};

/**
 * Verifica si una hora ya pasó (para el día de hoy)
 */
export const isPastTimeAR = (date: string | Date, time: string): boolean => {
  const appointmentDateTime = moment.tz(
    `${moment(date).format('YYYY-MM-DD')} ${time}`,
    'YYYY-MM-DD HH:mm',
    ARGENTINA_TZ
  );
  return appointmentDateTime.isBefore(moment().tz(ARGENTINA_TZ));
};

/**
 * Obtiene la diferencia en minutos hasta una cita
 */
export const getMinutesUntilAppointment = (date: string | Date, time: string): number => {
  const appointmentDateTime = moment.tz(
    `${moment(date).format('YYYY-MM-DD')} ${time}`,
    'YYYY-MM-DD HH:mm',
    ARGENTINA_TZ
  );
  return appointmentDateTime.diff(moment().tz(ARGENTINA_TZ), 'minutes');
};

/**
 * Formatea la fecha para mostrar en el calendario (YYYY-MM-DD)
 */
export const formatDateForCalendar = (date: string | Date): string => {
  return moment(date).format('YYYY-MM-DD');
};

/**
 * Parsea una fecha del formato DD/MM/YYYY a YYYY-MM-DD
 */
export const parseDateARToISO = (dateAR: string): string => {
  return moment(dateAR, 'DD/MM/YYYY').format('YYYY-MM-DD');
};

/**
 * Obtiene el mes y año formateado (ej: "Enero 2025")
 */
export const getMonthYearAR = (date: string | Date): string => {
  return toArgentinaTime(date).locale('es').format('MMMM YYYY');
};

/**
 * Agregar días a una fecha
 */
export const addDaysAR = (date: string | Date, days: number): string => {
  return toArgentinaTime(date).add(days, 'days').format('YYYY-MM-DD');
};

/**
 * Restar días a una fecha
 */
export const subtractDaysAR = (date: string | Date, days: number): string => {
  return toArgentinaTime(date).subtract(days, 'days').format('YYYY-MM-DD');
};
