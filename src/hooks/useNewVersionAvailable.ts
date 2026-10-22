import { useEffect, useState } from "react";

// Cada build publica /version.json con su id (ver vite.config.ts). Una pestaña
// abierta antes de un deploy sigue con el código viejo hasta que se recarga.
const CHECK_INTERVAL_MS = 5 * 60_000;

interface VersionFile {
  version?: string;
}

export const useNewVersionAvailable = (): boolean => {
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    const currentVersion = import.meta.env.VITE_APP_VERSION;
    if (!import.meta.env.PROD || !currentVersion || isAvailable) return;

    let active = true;
    const check = async (): Promise<void> => {
      try {
        const response = await fetch(`/version.json?t=${Date.now()}`, {
          cache: "no-store",
        });
        if (!response.ok) return;
        const { version } = (await response.json()) as VersionFile;
        if (active && version && version !== currentVersion) {
          setIsAvailable(true);
        }
      } catch {
        // Sin conexión o respuesta rara: se vuelve a intentar en el próximo control.
      }
    };
    const checkWhenVisible = (): void => {
      if (document.visibilityState === "visible") void check();
    };

    const interval = window.setInterval(checkWhenVisible, CHECK_INTERVAL_MS);
    document.addEventListener("visibilitychange", checkWhenVisible);
    window.addEventListener("focus", checkWhenVisible);
    return () => {
      active = false;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", checkWhenVisible);
      window.removeEventListener("focus", checkWhenVisible);
    };
  }, [isAvailable]);

  return isAvailable;
};
