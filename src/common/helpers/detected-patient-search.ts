/**
 * Los separadores con los que un nombre llega desde el ecógrafo: la coma de
 * `APELLIDO,NOMBRE`, el circunflejo que DICOM usa para separar los
 * componentes del nombre, y el punto. Son los mismos por los que parte el
 * buscador del padrón en el backend.
 */
const DETECTED_NAME_SEPARATORS = /[\s,^.]+/;

/**
 * El buscador del padrón sale a consultar recién con 3 letras. Precargar algo
 * más corto ("MP", vacío) no busca nada y encima deja basura en la caja que
 * la ecografista tiene que borrar antes de escribir.
 */
const MIN_SEARCH_LENGTH = 3;

/**
 * Convierte el nombre que quedó cargado en el equipo en el texto con el que
 * abre el buscador del padrón.
 *
 * Existe porque el diálogo MOSTRABA el nombre detectado y al lado un buscador
 * vacío: la ecografista tenía que re-tipear a mano lo que ya estaba en
 * pantalla.
 */
export const detectedNameToSearch = (
  detectedPatientName: string | null | undefined,
): string => {
  const search = (detectedPatientName ?? "")
    .split(DETECTED_NAME_SEPARATORS)
    .filter((term) => term.length > 0)
    .join(" ");

  return search.length >= MIN_SEARCH_LENGTH ? search : "";
};
