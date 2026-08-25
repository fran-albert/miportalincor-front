// ============================================================
// El portero de pedidos.
//
// La lista de estudios sin dueño tenía 80 tarjetas el 25/08. Aunque sólo se
// piden las que están a la vista, un scroll rápido de arriba a abajo las hace
// entrar a todas en pantalla y volvería a mandar los 160 pedidos de una.
// Este portero acota cuántos salen a la vez, como ya hace la galería del
// editor de informes con PREVIEW_CONCURRENCY.
// ============================================================

import { describe, expect, it } from "vitest";
import { createRequestGate } from "./request-gate";

const diferido = () => {
  let resolver: (value: string) => void = () => {};
  const promesa = new Promise<string>((resolve) => {
    resolver = resolve;
  });
  return { promesa, resolver };
};

describe("createRequestGate", () => {
  it("deja arrancar sólo la cantidad configurada", async () => {
    const gate = createRequestGate(2);
    const pedidos = [diferido(), diferido(), diferido()];
    let arrancados = 0;

    pedidos.forEach((pedido) => {
      void gate(() => {
        arrancados += 1;
        return pedido.promesa;
      });
    });
    await Promise.resolve();

    expect(arrancados).toBe(2);
  });

  it("suelta el lugar cuando el pedido termina", async () => {
    const gate = createRequestGate(2);
    const pedidos = [diferido(), diferido(), diferido()];
    let arrancados = 0;

    const corriendo = pedidos.map((pedido) =>
      gate(() => {
        arrancados += 1;
        return pedido.promesa;
      }),
    );
    await Promise.resolve();

    pedidos[0].resolver("primera");
    await corriendo[0];

    expect(arrancados).toBe(3);
    pedidos[1].resolver("segunda");
    pedidos[2].resolver("tercera");
    await expect(corriendo[2]).resolves.toBe("tercera");
  });

  it("suelta el lugar aunque el pedido falle, para no trabar la lista", async () => {
    const gate = createRequestGate(1);
    const fallado = gate(() => Promise.reject(new Error("PACS caído")));

    await expect(fallado).rejects.toThrow("PACS caído");
    await expect(gate(() => Promise.resolve("sigue andando"))).resolves.toBe(
      "sigue andando",
    );
  });
});
