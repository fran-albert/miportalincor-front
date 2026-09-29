/** Para buscar sin importar tildes ni mayúsculas ("cordoba" = "Córdoba"). */
export const normalizeForSearch = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

/**
 * Lee el token del fragmento (#t=...) y lo borra de la barra de direcciones:
 * el fragmento no llega al servidor, y así tampoco queda en el historial ni
 * en una captura de pantalla.
 */
export const readSignupTokenFromHash = (): string | null => {
  const hash = window.location.hash.replace(/^#/, "");
  const token = new URLSearchParams(hash).get("t");
  if (hash) {
    window.history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search
    );
  }
  return token && token.trim() ? token.trim() : null;
};
