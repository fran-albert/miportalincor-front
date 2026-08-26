// @vitest-environment jsdom
// ============================================================
// El patrón de pestañas del portal, en un solo lugar.
//
// Vivía suelto en "Estudios recibidos" como una cadena de 400 caracteres de
// clases. Cuando se construyó "Sin asignar" se copió a medias: quedó el badge
// pero sin la inversión de colores, así que el contador sobre la pestaña
// activa era gris claro sobre verde. Copiar clases a mano ya produjo el bug;
// el patrón vive acá.
// ============================================================

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Tabs } from "@/components/ui/tabs";
import { PillTabsList, PillTabsTrigger } from "@/components/ui/pill-tabs";

const renderTabs = (count: number) =>
  render(
    <Tabs value="a">
      <PillTabsList>
        <PillTabsTrigger value="a" count={count}>
          Para confirmar
        </PillTabsTrigger>
        <PillTabsTrigger value="b">Cargados</PillTabsTrigger>
      </PillTabsList>
    </Tabs>,
  );

describe("PillTabs", () => {
  it("muestra el contador sólo cuando hay algo que contar", () => {
    renderTabs(7);

    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Cargados" })).toBeInTheDocument();
  });

  it("no muestra un cero que no le dice nada a nadie", () => {
    renderTabs(0);

    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("es una pastilla blanca con borde y se pinta de verde al activarse", () => {
    renderTabs(7);

    const activa = screen.getByRole("tab", { name: /Para confirmar/i });
    expect(activa).toHaveAttribute("data-state", "active");
    expect(activa.className).toContain("rounded-lg");
    expect(activa.className).toContain("border-gray-200");
    expect(activa.className).toContain("bg-white");
    expect(activa.className).toContain("shadow-sm");
    expect(activa.className).toContain("px-4");
    expect(activa.className).toContain("py-2");
    expect(activa.className).toContain("text-gray-600");
    expect(activa.className).toContain("hover:border-greenPrimary/40");
    expect(activa.className).toContain("hover:text-greenPrimary");
    expect(activa.className).toContain("data-[state=active]:border-greenPrimary");
    expect(activa.className).toContain("data-[state=active]:bg-greenPrimary");
    expect(activa.className).toContain("data-[state=active]:text-white");
  });

  it("invierte los colores del contador sobre la pestaña activa", () => {
    renderTabs(7);

    const contador = screen.getByText("7");
    // Sin esto el badge queda gris claro sobre el verde: ilegible.
    expect(contador.className).toContain("group-data-[state=active]:bg-white");
    expect(contador.className).toContain(
      "group-data-[state=active]:text-greenPrimary",
    );
    // La inversión sólo dispara si el trigger es el `group`.
    expect(contador.closest('[role="tab"]')?.className).toContain("group");
  });

  it("alinea las pastillas a la izquierda, sin el fondo del segmented control", () => {
    renderTabs(7);

    const lista = screen.getByRole("tablist");
    expect(lista.className).toContain("h-auto");
    expect(lista.className).toContain("flex-wrap");
    expect(lista.className).toContain("justify-start");
    expect(lista.className).toContain("gap-2");
    expect(lista.className).toContain("bg-transparent");
  });

  it("deja sumar clases propias sin perder el patrón", () => {
    render(
      <Tabs value="a">
        <PillTabsList className="mb-4">
          <PillTabsTrigger value="a" className="w-40">
            Para confirmar
          </PillTabsTrigger>
        </PillTabsList>
      </Tabs>,
    );

    const activa = screen.getByRole("tab", { name: /Para confirmar/i });
    expect(activa.className).toContain("w-40");
    expect(activa.className).toContain("data-[state=active]:bg-greenPrimary");
    expect(screen.getByRole("tablist").className).toContain("mb-4");
  });
});
