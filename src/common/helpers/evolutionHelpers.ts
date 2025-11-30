/**
 * Helpers para validaciones y operaciones relacionadas con evoluciones
 */

/**
 * Valida si una evolución puede ser eliminada (dentro de 24 horas)
 */
export const canDeleteEvolution = (createdAt: string): boolean => {
  const created = new Date(createdAt);
  const now = new Date();
  // Corregir zona horaria sumando 3 horas al tiempo actual
  const nowCorrected = now.getTime() + (3 * 60 * 60 * 1000);
  const hoursDiff = (nowCorrected - created.getTime()) / (1000 * 60 * 60);
  return hoursDiff <= 24 && hoursDiff >= 0;
};

/**
 * Obtiene el tiempo restante para poder eliminar una evolución
 */
export const getDeleteTimeRemaining = (createdAt: string): string => {
  const created = new Date(createdAt);
  const now = new Date();

  // Corregir zona horaria: el navegador reporta hora local como UTC
  // Necesitamos sumar 3 horas al tiempo actual para convertir a UTC real
  const createdTime = created.getTime();
  const nowTime = now.getTime() + (3 * 60 * 60 * 1000); // Sumar 3 horas

  // Calcular la diferencia correcta
  const timeDiff = nowTime - createdTime;
  const hoursDiff = timeDiff / (1000 * 60 * 60);

  if (hoursDiff >= 24) {
    const daysAgo = Math.floor(hoursDiff / 24);
    return `No se puede eliminar (creada hace ${daysAgo} día${daysAgo !== 1 ? 's' : ''})`;
  }

  // Tiempo restante en milisegundos
  const timeLeft = (24 * 60 * 60 * 1000) - timeDiff;
  const hoursLeft = timeLeft / (1000 * 60 * 60);
  const minutesLeft = (timeLeft % (1000 * 60 * 60)) / (1000 * 60);

  const hours = Math.floor(hoursLeft);
  const minutes = Math.floor(minutesLeft);

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m restantes`;
  } else if (hours > 0) {
    return `${hours}h restantes`;
  } else if (minutes > 0) {
    return `${minutes}m restantes`;
  } else {
    return "Menos de 1 minuto restante";
  }
};

/**
 * Formatea la fecha y hora de una evolución para mostrar en la tabla
 */
export const formatEvolutionDateTime = (dateTimeString: string) => {
  const date = new Date(dateTimeString);

  const formattedDate = date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const formattedTime = date.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return {
    date: formattedDate,
    time: formattedTime,
    full: `${formattedDate} - ${formattedTime}`
  };
};

/**
 * Trunca texto para mostrar en la tabla
 */
export const truncateEvolutionText = (text: string | null, maxLength: number = 80): string => {
  if (!text) return 'Sin información';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};