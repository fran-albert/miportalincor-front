// ============================================================
// El nombre que manda el ecógrafo, listo para pegar en el buscador.
//
// El equipo no manda "ALBINA BARRAZA": manda "BARRAZA,ALBINA", o
// "BARRAZA^ALBINA" (el separador estándar de DICOM). Ese texto se le muestra
// a la ecografista en la tarjeta, así que cuando abre el diálogo para
// reclamar el estudio tiene que poder buscarlo sin re-tipear a mano lo que ya
// está en pantalla.
//
// El backend parte por los mismos separadores; esto es la otra mitad.
// ============================================================

import { describe, expect, it } from "vitest";
import { detectedNameToSearch } from "./detected-patient-search";

describe("detectedNameToSearch", () => {
  it("cambia por espacios la coma con la que el ecógrafo separa apellido y nombre", () => {
    expect(detectedNameToSearch("BARRAZA,ALBINA")).toBe("BARRAZA ALBINA");
  });

  it("cambia por espacios el circunflejo de DICOM", () => {
    expect(detectedNameToSearch("SILVANI^MARIA XIMENA")).toBe(
      "SILVANI MARIA XIMENA",
    );
  });

  it("cambia por espacios los puntos", () => {
    expect(detectedNameToSearch("DOMINGUEZ.SOFIA")).toBe("DOMINGUEZ SOFIA");
  });

  it("no deja espacios de más ni en el medio ni en las puntas", () => {
    expect(detectedNameToSearch("  GARROFE, ,GUADALUPE  ")).toBe(
      "GARROFE GUADALUPE",
    );
  });

  it("deja intacto un nombre que ya viene separado por espacios", () => {
    expect(detectedNameToSearch("DELGREGO HERNAN")).toBe("DELGREGO HERNAN");
  });

  // ------------------------------------------------------------
  // Cuándo NO conviene precargar: el buscador pide 3 letras para salir a
  // consultar, así que un nombre inútil ("MP", vacío) sólo dejaría basura en
  // la caja que la ecografista tiene que borrar antes de escribir.
  // ------------------------------------------------------------
  it("no precarga nada cuando el equipo no mandó nombre", () => {
    expect(detectedNameToSearch(null)).toBe("");
  });

  it("no precarga nada cuando el nombre es demasiado corto para buscar", () => {
    expect(detectedNameToSearch("MP")).toBe("");
  });

  it("no precarga nada cuando el nombre son sólo separadores", () => {
    expect(detectedNameToSearch("^,.")).toBe("");
  });
});
