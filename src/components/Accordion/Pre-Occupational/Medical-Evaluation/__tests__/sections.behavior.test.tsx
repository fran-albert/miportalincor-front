// @vitest-environment jsdom
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PielSection } from "../PielSection";
import { CabezaCuelloSection } from "../CabellaCuelloSection";
import { BucodentalSection } from "../BucodentalSection";
import { RespiratorioSection } from "../RespiratorioSection";
import { CirculatorioSection } from "../CirculatorioSection";
import { GastrointestinalSection } from "../GastrointestinalSection";
import { NeurologicoSection } from "../NeurologicoSection";
import { GenitourinarioSection } from "../GenitourinarioSection";
import { ToraxSection } from "../ToraxSection";
import { OsteoarticularSection } from "../OsteoArticularSection";

describe("MedicalEvaluation clinical sections", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const getSection = (title: string) => {
    const heading = screen.getByRole("heading", { name: title });
    const section = heading.closest("section");

    if (!section) {
      throw new Error(`No section container found for ${title}`);
    }

    return within(section);
  };

  const expectCall = (
    mock: ReturnType<typeof vi.fn>,
    ...call: [string, unknown]
  ) => {
    expect(mock.mock.calls).toContainEqual(call);
  };

  const getTypedFieldValue = (
    mock: { mock: { calls: Array<[string, unknown]> } },
    field: string
  ) =>
    mock.mock.calls
      .filter(([name]) => name === field)
      .map(([, value]) => String(value ?? ""))
      .join("");

  describe("PielSection", () => {
    it("no renderiza nada cuando no está editando y no tiene datos", () => {
      const { container } = render(
        <PielSection
          isEditing={false}
          data={{ observaciones: "" }}
        />
      );

      expect(container).toBeEmptyDOMElement();
    });

    it("emite cambios de campos simples y observaciones", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <PielSection
          isEditing
          data={{ observaciones: "", normocoloreada: undefined, tatuajes: undefined }}
          onChange={onChange}
        />
      );

      const radios = screen.getAllByRole("radio", { name: "Si" });
      await user.click(radios[0]);
      await user.click(radios[1]);
      await user.type(screen.getByLabelText("Observaciones"), "Nevo");

      expectCall(onChange, "normocoloreada", "si");
      expectCall(onChange, "tatuajes", "si");
      expect(getTypedFieldValue(onChange, "observaciones")).toBe("Nevo");
    });
  });

  describe("CabezaCuelloSection", () => {
    it("limpia observaciones al marcar sin alteraciones", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onBatchChange = vi.fn();

      render(
        <CabezaCuelloSection
          isEditing
          data={{ sinAlteraciones: false, observaciones: "Rigidez" }}
          onChange={onChange}
          onBatchChange={onBatchChange}
        />
      );

      await user.click(
        screen.getByRole("radio", { name: "Sin alteraciones" })
      );

      expect(onBatchChange).toHaveBeenCalledWith({
        sinAlteraciones: true,
        observaciones: "",
      });
      expect(onChange).not.toHaveBeenCalled();
    });

    it("deshabilita observaciones cuando el examen quedó sin alteraciones", () => {
      render(
        <CabezaCuelloSection
          isEditing
          data={{ sinAlteraciones: true, observaciones: "" }}
          onChange={vi.fn()}
        />
      );

      expect(screen.getByLabelText("Observaciones")).toBeDisabled();
    });

    it("desmarca sin alteraciones al escribir observaciones desde un estado ya normalizado", () => {
      const onChange = vi.fn();
      const onBatchChange = vi.fn();

      render(
        <CabezaCuelloSection
          isEditing
          data={{ sinAlteraciones: true, observaciones: "" }}
          onChange={onChange}
          onBatchChange={onBatchChange}
        />
      );

      fireEvent.change(screen.getByLabelText("Observaciones"), {
        target: { value: "Rigidez" },
      });

      expect(onBatchChange).toHaveBeenCalledWith({
        sinAlteraciones: false,
        observaciones: "Rigidez",
      });
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("BucodentalSection", () => {
    it("limpia caries, faltan piezas y observaciones al marcar sin alteraciones", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onBatchChange = vi.fn();

      render(
        <BucodentalSection
          isEditing
          data={{
            sinAlteraciones: false,
            caries: true,
            faltanPiezas: true,
            observaciones: "Hallazgos",
          }}
          onChange={onChange}
          onBatchChange={onBatchChange}
        />
      );

      await user.click(
        screen.getByRole("radio", { name: "Sin alteraciones" })
      );

      expect(onBatchChange).toHaveBeenCalledWith({
        sinAlteraciones: true,
        caries: false,
        faltanPiezas: false,
        observaciones: "",
      });
      expect(onChange).not.toHaveBeenCalled();
    });

    it("convierte un hallazgo en desmarque de sin alteraciones cuando estaba activo", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onBatchChange = vi.fn();

      render(
        <BucodentalSection
          isEditing
          data={{
            sinAlteraciones: true,
            caries: false,
            faltanPiezas: false,
            observaciones: "",
          }}
          onChange={onChange}
          onBatchChange={onBatchChange}
        />
      );

      const cariesRadio = document.getElementById("buc-caries-si");

      if (!(cariesRadio instanceof HTMLElement)) {
        throw new Error("No se encontró el radio de caries");
      }

      await user.click(cariesRadio);

      expect(onBatchChange).toHaveBeenCalledWith({
        sinAlteraciones: false,
        caries: true,
      });
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("RespiratorioSection", () => {
    it("limpia observaciones al marcar sin alteraciones y permite editar mediciones", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onBatchChange = vi.fn();

      render(
        <RespiratorioSection
          isEditing
          data={{
            frecuenciaRespiratoria: "",
            oximetria: "",
            sinAlteraciones: false,
            observaciones: "Sibilancias",
          }}
          onChange={onChange}
          onBatchChange={onBatchChange}
        />
      );

      await user.type(screen.getByLabelText("Frecuencia respiratoria"), "18");
      await user.type(screen.getByLabelText("Oximetría"), "97");
      await user.click(
        screen.getByRole("radio", { name: "Sin alteraciones" })
      );

      expect(getTypedFieldValue(onChange, "frecuenciaRespiratoria")).toBe("18");
      expect(getTypedFieldValue(onChange, "oximetria")).toBe("97");
      expect(onBatchChange).toHaveBeenCalledWith({
        sinAlteraciones: true,
        observaciones: "",
      });
    });
  });

  describe("CirculatorioSection", () => {
    it("limpia observaciones y várices al marcar sin alteraciones", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onBatchChange = vi.fn();

      render(
        <CirculatorioSection
          isEditing
          data={{
            frecuenciaCardiaca: "",
            presion: "",
            sinAlteraciones: false,
            observaciones: "Soplo",
            varices: true,
            varicesObs: "Visibles",
          }}
          onChange={onChange}
          onBatchChange={onBatchChange}
        />
      );

      await user.click(
        screen.getByRole("radio", { name: "Sin alteraciones" })
      );

      expect(onBatchChange).toHaveBeenCalledWith({
        sinAlteraciones: true,
        observaciones: "",
        varices: false,
        varicesObs: "",
      });
      expect(onChange).not.toHaveBeenCalled();
    });

    it("desmarca sin alteraciones cuando se informa várices", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onBatchChange = vi.fn();

      render(
        <CirculatorioSection
          isEditing
          data={{
            frecuenciaCardiaca: "",
            presion: "",
            sinAlteraciones: true,
            observaciones: "",
            varices: false,
            varicesObs: "",
          }}
          onChange={onChange}
          onBatchChange={onBatchChange}
        />
      );

      await user.click(getSection("Varices").getByRole("radio", { name: "Si" }));

      expect(onBatchChange).toHaveBeenCalledWith({
        sinAlteraciones: false,
        varices: true,
      });
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("GastrointestinalSection", () => {
    it("limpia todos los hallazgos al marcar sin alteraciones", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onBatchChange = vi.fn();

      render(
        <GastrointestinalSection
          isEditing
          data={{
            sinAlteraciones: false,
            observaciones: "Dolor",
            cicatrices: true,
            cicatricesObs: "Postquirúrgicas",
            hernias: true,
            herniasObs: "Umbilical",
            eventraciones: true,
            eventracionesObs: "Leve",
            hemorroides: true,
            hemorroidesObs: "Internas",
          }}
          onChange={onChange}
          onBatchChange={onBatchChange}
        />
      );

      await user.click(
        screen.getByRole("radio", { name: "Sin alteraciones" })
      );

      expect(onBatchChange).toHaveBeenCalledWith({
        sinAlteraciones: true,
        observaciones: "",
        cicatrices: false,
        cicatricesObs: "",
        hernias: false,
        herniasObs: "",
        eventraciones: false,
        eventracionesObs: "",
        hemorroides: false,
        hemorroidesObs: "",
      });
      expect(onChange).not.toHaveBeenCalled();
    });

    it("desmarca sin alteraciones al cargar un hallazgo específico", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onBatchChange = vi.fn();

      render(
        <GastrointestinalSection
          isEditing
          data={{
            sinAlteraciones: true,
            observaciones: "",
            cicatrices: false,
            cicatricesObs: "",
            hernias: false,
            herniasObs: "",
            eventraciones: false,
            eventracionesObs: "",
            hemorroides: false,
            hemorroidesObs: "",
          }}
          onChange={onChange}
          onBatchChange={onBatchChange}
        />
      );

      await user.click(
        getSection("Hernias").getByRole("radio", { name: "Si" })
      );

      expect(onBatchChange).toHaveBeenCalledWith({
        sinAlteraciones: false,
        hernias: true,
      });
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("GenitourinarioSection", () => {
    it("limpia observaciones y varicocele al marcar sin alteraciones", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onBatchChange = vi.fn();
      const onPdfVisibilityModeChange = vi.fn();

      render(
        <GenitourinarioSection
          isEditing
          data={{
            sinAlteraciones: false,
            observaciones: "Hallazgos",
            varicocele: true,
            varicoceleObs: "Visible",
            fum: "2026-01-10",
            embarazos: "1",
            partos: "1",
            cesarea: "0",
          }}
          onChange={onChange}
          onBatchChange={onBatchChange}
          onPdfVisibilityModeChange={onPdfVisibilityModeChange}
        />
      );

      await user.click(
        screen.getByRole("radio", { name: "Sin alteraciones" })
      );

      expect(onBatchChange).toHaveBeenCalledWith({
        sinAlteraciones: true,
        observaciones: "",
        varicocele: false,
        varicoceleObs: "",
      });
      expect(onChange).not.toHaveBeenCalled();
    });

    it("emite cambios para FUM y desmarca sin alteraciones al marcar varicocele", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onBatchChange = vi.fn();

      render(
        <GenitourinarioSection
          isEditing
          data={{
            sinAlteraciones: true,
            observaciones: "",
            varicocele: false,
            varicoceleObs: "",
            fum: "",
            embarazos: "",
            partos: "",
            cesarea: "",
          }}
          onChange={onChange}
          onBatchChange={onBatchChange}
        />
      );

      await user.type(screen.getByLabelText("F.U.M"), "2026-01-10");
      await user.click(getSection("Varicocele").getByRole("radio", { name: "Si" }));

      expectCall(onChange, "fum", "2026-01-10");
      expect(onBatchChange).toHaveBeenCalledWith({
        sinAlteraciones: false,
        varicocele: true,
      });
    });
  });

  describe("NeurologicoSection", () => {
    it("limpia observaciones al marcar sin alteraciones", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onBatchChange = vi.fn();

      render(
        <NeurologicoSection
          isEditing
          data={{ sinAlteraciones: false, observaciones: "Reflejos disminuidos" }}
          onChange={onChange}
          onBatchChange={onBatchChange}
        />
      );

      await user.click(
        screen.getByRole("radio", { name: "Sin alteraciones" })
      );

      expect(onBatchChange).toHaveBeenCalledWith({
        sinAlteraciones: true,
        observaciones: "",
      });
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("ToraxSection", () => {
    it("emite cambios de deformaciones, cicatrices y observaciones", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <ToraxSection
          isEditing
          data={{
            deformaciones: undefined,
            deformacionesObs: "",
            cicatrices: undefined,
            cicatricesObs: "",
          }}
          onChange={onChange}
        />
      );

      await user.click(
        getSection("Deformaciones").getByRole("radio", { name: "Si" })
      );
      await user.click(
        getSection("Cicatrices").getByRole("radio", { name: "No" })
      );
      await user.type(
        getSection("Deformaciones").getByLabelText("Observaciones"),
        "Asimetría"
      );

      expectCall(onChange, "deformaciones", "si");
      expectCall(onChange, "cicatrices", "no");
      expect(getTypedFieldValue(onChange, "deformacionesObs")).toBe("Asimetría");
    });
  });

  describe("OsteoarticularSection", () => {
    it("emite cambios de radios y observaciones por bloque", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <OsteoarticularSection
          isEditing
          data={{
            mmssSin: undefined,
            mmssObs: "",
            mmiiSin: undefined,
            mmiiObs: "",
            columnaSin: undefined,
            columnaObs: "",
            amputaciones: undefined,
            amputacionesObs: "",
          }}
          onChange={onChange}
        />
      );

      await user.click(
        getSection("MMSS").getByRole("radio", { name: "Sin alteraciones" })
      );
      await user.type(
        getSection("MMSS").getByLabelText("Observaciones"),
        "Dolor"
      );

      expectCall(onChange, "mmssSin", true);
      expect(getTypedFieldValue(onChange, "mmssObs")).toBe("Dolor");
    });
  });
});
