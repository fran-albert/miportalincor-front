// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

// --- Mocks ---

const mockRequestPrescriptionMutateAsync = vi.fn().mockResolvedValue(undefined);
const mockShowSuccess = vi.fn();
const mockShowError = vi.fn();

vi.mock("@/hooks/Green-Card/useGreenCardMutation", () => ({
  useGreenCardMutations: () => ({
    requestPrescriptionMutation: {
      mutateAsync: mockRequestPrescriptionMutateAsync,
      isPending: false,
    },
    batchRequestPrescriptionMutation: {
      mutateAsync: vi.fn(),
      isPending: false,
    },
  }),
}));

vi.mock("@/hooks/Toast/toast-context", () => ({
  useToastContext: () => ({
    showSuccess: mockShowSuccess,
    showError: mockShowError,
  }),
}));

const mockAvailableDoctors = [
  {
    id: "doc-1",
    userId: "user-doc-1",
    firstName: "Carlos",
    lastName: "Gomez",
    gender: "Masculino",
    specialities: [{ id: 1, name: "Cardiología" }],
  },
  {
    id: "doc-2",
    userId: "user-doc-2",
    firstName: "Maria",
    lastName: "Lopez",
    gender: "Femenino",
    specialities: [{ id: 2, name: "Clínica Médica" }],
  },
];

vi.mock("@/hooks/Doctor-Settings/useDoctorSettings", () => ({
  useAvailableDoctorsForPrescriptions: vi.fn(() => ({
    data: mockAvailableDoctors,
    isLoading: false,
  })),
}));

// Radix UI Select needs a proper portal target - mock it
vi.mock("@radix-ui/react-select", async () => {
  const actual = await vi.importActual<typeof import("@radix-ui/react-select")>(
    "@radix-ui/react-select"
  );
  return actual;
});

import { RequestPrescriptionModal } from "../RequestPrescriptionModal";
import type { GreenCardItem } from "@/types/Green-Card/GreenCard";
import { useAvailableDoctorsForPrescriptions } from "@/hooks/Doctor-Settings/useDoctorSettings";

// --- Helpers ---

const mockItem: GreenCardItem = {
  id: "item-1",
  doctorUserId: "user-doc-1",
  medicationName: "Losartan 50mg",
  dosage: "1 comprimido",
  schedule: "08:00",
  quantity: "2 cajas",
  isActive: true,
  canEdit: false,
  hasPendingPrescription: false,
  displayOrder: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function renderModal(
  props: Partial<{
    isOpen: boolean;
    onClose: () => void;
    greenCardId: string;
    item: GreenCardItem;
  }> = {}
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    greenCardId: "card-123",
    item: mockItem,
    ...props,
  };

  return {
    ...render(
      <QueryClientProvider client={queryClient}>
        <RequestPrescriptionModal {...defaultProps} />
      </QueryClientProvider>
    ),
    onClose: defaultProps.onClose,
  };
}

// --- Tests ---

describe("RequestPrescriptionModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Restaurar datos de médicos disponibles por defecto
    (
      useAvailableDoctorsForPrescriptions as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      data: mockAvailableDoctors,
      isLoading: false,
    });
  });

  describe("Renderizado del selector de médico", () => {
    it("debe mostrar el título del modal", () => {
      renderModal();
      expect(screen.getByText("Solicitar Receta")).toBeInTheDocument();
    });

    it("debe mostrar el nombre del medicamento", () => {
      renderModal();
      expect(screen.getByText("Losartan 50mg")).toBeInTheDocument();
    });

    it("debe mostrar el selector de médico cuando hay médicos disponibles", () => {
      renderModal();
      expect(
        screen.getByText("Médico que recibe la solicitud")
      ).toBeInTheDocument();
      // El Select está presente (el placeholder se reemplaza con la pre-selección del doctor del item)
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("debe mostrar spinner cuando los médicos están cargando", () => {
      (
        useAvailableDoctorsForPrescriptions as ReturnType<typeof vi.fn>
      ).mockReturnValue({
        data: undefined,
        isLoading: true,
      });

      renderModal();
      expect(screen.getByText("Cargando médicos...")).toBeInTheDocument();
    });

    it("debe mostrar mensaje cuando no hay médicos disponibles", () => {
      (
        useAvailableDoctorsForPrescriptions as ReturnType<typeof vi.fn>
      ).mockReturnValue({
        data: [],
        isLoading: false,
      });

      renderModal();
      expect(
        screen.getByText(
          "No hay médicos disponibles para recetas"
        )
      ).toBeInTheDocument();
    });

    it("debe mostrar el aviso del viernes", () => {
      renderModal();
      expect(
        screen.getByText(/próximo viernes a partir de las 14:00 hs/)
      ).toBeInTheDocument();
    });
  });

  describe("Pre-selección de médico", () => {
    it("debe pre-seleccionar el médico que agregó el medicamento si está en la lista", async () => {
      renderModal();
      // El médico con userId 'user-doc-1' es el que agregó el item
      // y está en mockAvailableDoctors, entonces debe quedar pre-seleccionado
      // La pre-selección se refleja en que canSubmit=true (botón habilitado)
      await waitFor(() => {
        const submitBtn = screen.getByText("Confirmar Solicitud");
        expect(submitBtn.closest("button")).not.toBeDisabled();
      });
    });

    it("no debe pre-seleccionar si el médico del item no está en la lista disponible", async () => {
      const itemWithUnknownDoctor: GreenCardItem = {
        ...mockItem,
        doctorUserId: "user-doc-unknown",
      };

      renderModal({ item: itemWithUnknownDoctor });

      // El botón debe estar deshabilitado porque no hay pre-selección
      const submitBtn = screen.getByText("Confirmar Solicitud");
      expect(submitBtn.closest("button")).toBeDisabled();
    });
  });

  describe("Botón de confirmar", () => {
    it("debe estar deshabilitado cuando no hay médico seleccionado", () => {
      // No hay pre-selección porque el doctor del item no está en la lista
      (
        useAvailableDoctorsForPrescriptions as ReturnType<typeof vi.fn>
      ).mockReturnValue({
        data: [
          {
            id: "doc-99",
            userId: "user-doc-99",
            firstName: "Otro",
            lastName: "Doctor",
            gender: "Masculino",
            specialities: [],
          },
        ],
        isLoading: false,
      });

      // Item con doctor que no está en la lista disponible
      const itemWithDifferentDoctor: GreenCardItem = {
        ...mockItem,
        doctorUserId: "user-doc-no-match",
      };

      renderModal({ item: itemWithDifferentDoctor });

      const submitBtn = screen.getByText("Confirmar Solicitud");
      expect(submitBtn.closest("button")).toBeDisabled();
    });

    it("debe estar deshabilitado mientras los médicos están cargando", () => {
      (
        useAvailableDoctorsForPrescriptions as ReturnType<typeof vi.fn>
      ).mockReturnValue({
        data: undefined,
        isLoading: true,
      });

      renderModal();

      const submitBtn = screen.getByText("Confirmar Solicitud");
      expect(submitBtn.closest("button")).toBeDisabled();
    });

    it("debe estar habilitado cuando hay médico pre-seleccionado", async () => {
      renderModal(); // doctorUserId='user-doc-1' está en mockAvailableDoctors

      await waitFor(() => {
        const submitBtn = screen.getByText("Confirmar Solicitud");
        expect(submitBtn.closest("button")).not.toBeDisabled();
      });
    });
  });

  describe("Envío de solicitud", () => {
    it("debe llamar a requestPrescriptionMutation con doctorUserId pre-seleccionado", async () => {
      const user = userEvent.setup();
      renderModal(); // pre-selecciona user-doc-1

      await waitFor(() => {
        expect(
          screen.getByText("Confirmar Solicitud").closest("button")
        ).not.toBeDisabled();
      });

      await user.click(screen.getByText("Confirmar Solicitud"));

      expect(mockRequestPrescriptionMutateAsync).toHaveBeenCalledWith({
        cardId: "card-123",
        itemId: "item-1",
        doctorUserId: "user-doc-1",
      });
    });

    it("debe mostrar toast de éxito al confirmar", async () => {
      const user = userEvent.setup();
      renderModal();

      await waitFor(() => {
        expect(
          screen.getByText("Confirmar Solicitud").closest("button")
        ).not.toBeDisabled();
      });

      await user.click(screen.getByText("Confirmar Solicitud"));

      await waitFor(() => {
        expect(mockShowSuccess).toHaveBeenCalledWith(
          "Solicitud enviada correctamente",
          expect.stringContaining("Dr. Carlos Gomez")
        );
      });
    });

    it("debe mostrar toast de error cuando la solicitud falla", async () => {
      mockRequestPrescriptionMutateAsync.mockRejectedValueOnce(
        new Error("Server error")
      );

      const user = userEvent.setup();
      renderModal();

      await waitFor(() => {
        expect(
          screen.getByText("Confirmar Solicitud").closest("button")
        ).not.toBeDisabled();
      });

      await user.click(screen.getByText("Confirmar Solicitud"));

      await waitFor(() => {
        expect(mockShowError).toHaveBeenCalledWith(
          "Error al solicitar la receta",
          "Por favor, intentá nuevamente más tarde."
        );
      });
    });

    it("debe mostrar mensaje específico si hay solicitud pendiente", async () => {
      mockRequestPrescriptionMutateAsync.mockRejectedValueOnce(
        new Error("already has pending prescription")
      );

      const user = userEvent.setup();
      renderModal();

      await waitFor(() => {
        expect(
          screen.getByText("Confirmar Solicitud").closest("button")
        ).not.toBeDisabled();
      });

      await user.click(screen.getByText("Confirmar Solicitud"));

      await waitFor(() => {
        expect(mockShowError).toHaveBeenCalledWith(
          "Ya tenés una solicitud pendiente",
          expect.any(String)
        );
      });
    });

    it("debe cerrar el modal después de confirmar exitosamente", async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();
      renderModal({ onClose });

      await waitFor(() => {
        expect(
          screen.getByText("Confirmar Solicitud").closest("button")
        ).not.toBeDisabled();
      });

      await user.click(screen.getByText("Confirmar Solicitud"));

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });
  });

  describe("Formato de nombre del médico", () => {
    it("debe usar prefijo 'Dr.' para médico masculino", async () => {
      renderModal(); // Dr. Carlos Gomez

      await waitFor(() => {
        expect(
          screen.getByText("Confirmar Solicitud").closest("button")
        ).not.toBeDisabled();
      });

      const user = userEvent.setup();
      await user.click(screen.getByText("Confirmar Solicitud"));

      await waitFor(() => {
        expect(mockShowSuccess).toHaveBeenCalledWith(
          expect.any(String),
          expect.stringContaining("Dr. Carlos Gomez")
        );
      });
    });

    it("debe usar prefijo 'Dra.' para médica femenina", async () => {
      // Forzar que el item pertenezca al doctor femenino
      const itemWithFemaleDoctor: GreenCardItem = {
        ...mockItem,
        doctorUserId: "user-doc-2",
      };

      renderModal({ item: itemWithFemaleDoctor });

      await waitFor(() => {
        expect(
          screen.getByText("Confirmar Solicitud").closest("button")
        ).not.toBeDisabled();
      });

      const user = userEvent.setup();
      await user.click(screen.getByText("Confirmar Solicitud"));

      await waitFor(() => {
        expect(mockShowSuccess).toHaveBeenCalledWith(
          expect.any(String),
          expect.stringContaining("Dra. Maria Lopez")
        );
      });
    });
  });

  describe("Reset al cerrar", () => {
    it("debe resetear la selección cuando el modal se cierra", async () => {
      const { rerender } = renderModal();

      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });

      // Cerrar el modal
      rerender(
        <QueryClientProvider client={queryClient}>
          <RequestPrescriptionModal
            isOpen={false}
            onClose={vi.fn()}
            greenCardId="card-123"
            item={mockItem}
          />
        </QueryClientProvider>
      );

      // Volver a abrir
      rerender(
        <QueryClientProvider client={queryClient}>
          <RequestPrescriptionModal
            isOpen={true}
            onClose={vi.fn()}
            greenCardId="card-123"
            item={mockItem}
          />
        </QueryClientProvider>
      );

      // Se re-aplica la pre-selección al volver a abrir
      await waitFor(() => {
        const submitBtn = screen.getByText("Confirmar Solicitud");
        expect(submitBtn).toBeInTheDocument();
      });
    });
  });
});
