// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

// --- Mocks ---

const mockBatchMutateAsync = vi.fn().mockResolvedValue({
  message: "ok",
  batches: [
    {
      batchId: "b1",
      doctorName: "Dr. Test",
      itemCount: 2,
      requestIds: ["r1", "r2"],
    },
  ],
  skippedItems: [],
});
const mockShowSuccess = vi.fn();
const mockShowError = vi.fn();

vi.mock("@/hooks/Green-Card/useGreenCardMutation", () => ({
  useGreenCardMutations: () => ({
    requestPrescriptionMutation: {
      mutateAsync: vi.fn(),
      isPending: false,
    },
    batchRequestPrescriptionMutation: {
      mutateAsync: mockBatchMutateAsync,
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
    specialities: [],
  },
];

vi.mock("@/hooks/Doctor-Settings/useDoctorSettings", () => ({
  useAvailableDoctorsForPrescriptions: vi.fn(() => ({
    data: mockAvailableDoctors,
    isLoading: false,
  })),
}));

// Mock Radix Select to use native HTML select for testability in jsdom
vi.mock("@/components/ui/select", () => ({
  Select: ({
    value,
    onValueChange,
    children,
  }: {
    value?: string;
    onValueChange?: (v: string) => void;
    children: React.ReactNode;
  }) => (
    <div data-testid="select-root">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<{ onValueChange?: (v: string) => void; value?: string }>, {
            onValueChange,
            value,
          });
        }
        return child;
      })}
    </div>
  ),
  SelectTrigger: ({
    children,
    value,
    onValueChange,
    ...props
  }: {
    children?: React.ReactNode;
    value?: string;
    onValueChange?: (v: string) => void;
    [key: string]: unknown;
  }) => {
    void value;
    void onValueChange;
    return (
      <div role="combobox" {...props}>
        {children}
      </div>
    );
  },
  SelectValue: ({ placeholder }: { placeholder?: string }) => (
    <span>{placeholder}</span>
  ),
  SelectContent: ({
    children,
    onValueChange,
  }: {
    children: React.ReactNode;
    onValueChange?: (v: string) => void;
  }) => (
    <div data-testid="select-content">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<{ onValueChange?: (v: string) => void }>, {
            onValueChange,
          });
        }
        return child;
      })}
    </div>
  ),
  SelectItem: ({
    value,
    children,
    onValueChange,
  }: {
    value: string;
    children: React.ReactNode;
    onValueChange?: (v: string) => void;
  }) => (
    <button
      role="option"
      data-value={value}
      onClick={() => onValueChange?.(value)}
    >
      {children}
    </button>
  ),
}));

import { BatchRequestPrescriptionModal } from "../BatchRequestPrescriptionModal";
import type { GreenCard, GreenCardItem } from "@/types/Green-Card/GreenCard";
import { useAvailableDoctorsForPrescriptions } from "@/hooks/Doctor-Settings/useDoctorSettings";

// --- Helpers ---

function makeItem(
  overrides: Partial<GreenCardItem> & { id: string }
): GreenCardItem {
  return {
    doctorUserId: "user-doc-1",
    medicationName: "Medicamento Test",
    dosage: "1 comp",
    schedule: "08:00",
    isActive: true,
    canEdit: false,
    hasPendingPrescription: false,
    displayOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

const mockGreenCard: GreenCard = {
  id: "card-123",
  patientUserId: "patient-1",
  items: [
    makeItem({
      id: "item-1",
      medicationName: "Losartan 50mg",
      doctorUserId: "user-doc-1",
    }),
    makeItem({
      id: "item-2",
      medicationName: "Metformina 850mg",
      doctorUserId: "user-doc-2",
    }),
    makeItem({
      id: "item-3",
      medicationName: "Atorvastatina 20mg",
      isActive: false,
      doctorUserId: "user-doc-1",
    }),
    makeItem({
      id: "item-4",
      medicationName: "Amlodipina 5mg",
      hasPendingPrescription: true,
      doctorUserId: "user-doc-1",
    }),
  ],
  activeItemsCount: 2,
  totalItemsCount: 4,
  canAddItems: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function renderBatchModal(
  props: Partial<{
    isOpen: boolean;
    onClose: () => void;
    greenCard: GreenCard;
    selectedItemIds: string[];
    onSuccess: () => void;
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
    greenCard: mockGreenCard,
    selectedItemIds: ["item-1", "item-2"],
    onSuccess: vi.fn(),
    ...props,
  };

  return {
    ...render(
      <QueryClientProvider client={queryClient}>
        <BatchRequestPrescriptionModal {...defaultProps} />
      </QueryClientProvider>
    ),
    onClose: defaultProps.onClose,
    onSuccess: defaultProps.onSuccess,
  };
}

/** Helper to get the submit button by its role */
function getSubmitButton() {
  // The submit button contains text "Solicitar Recetas" and is a button
  const buttons = screen.getAllByRole("button");
  return buttons.find((btn) => btn.textContent?.includes("Solicitar Recetas ("));
}

// --- Tests ---

describe("BatchRequestPrescriptionModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (
      useAvailableDoctorsForPrescriptions as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      data: mockAvailableDoctors,
      isLoading: false,
    });
  });

  describe("Renderizado básico", () => {
    it("debe mostrar el título del modal", () => {
      renderBatchModal();
      expect(
        screen.getByText("Solicitar Recetas en Lote")
      ).toBeInTheDocument();
    });

    it("debe mostrar el selector de médico", () => {
      renderBatchModal();
      expect(
        screen.getByText("Médico que recibe las solicitudes")
      ).toBeInTheDocument();
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("debe mostrar la lista de medicamentos enviables", () => {
      renderBatchModal();
      expect(screen.getByText("Losartan 50mg")).toBeInTheDocument();
      expect(screen.getByText("Metformina 850mg")).toBeInTheDocument();
    });

    it("debe mostrar el aviso del viernes", () => {
      renderBatchModal();
      expect(
        screen.getByText(/proximo viernes a partir de las 14:00 hs/)
      ).toBeInTheDocument();
    });

    it("debe mostrar el botón de submit con la cantidad de items", () => {
      renderBatchModal();
      const submitBtn = getSubmitButton();
      expect(submitBtn).toBeDefined();
      expect(submitBtn?.textContent).toContain("Solicitar Recetas (2)");
    });
  });

  describe("Selector único de médico (sin agrupamiento por doctor)", () => {
    it("debe mostrar un único selector de médico para todos los items", () => {
      renderBatchModal({ selectedItemIds: ["item-1", "item-2"] });
      // Solo debe haber un combobox (no uno por doctor)
      const combos = screen.getAllByRole("combobox");
      expect(combos).toHaveLength(1);
    });

    it("debe mostrar spinner cuando los médicos están cargando", () => {
      (
        useAvailableDoctorsForPrescriptions as ReturnType<typeof vi.fn>
      ).mockReturnValue({
        data: undefined,
        isLoading: true,
      });

      renderBatchModal();
      expect(screen.getByText("Cargando médicos...")).toBeInTheDocument();
    });

    it("debe mostrar mensaje cuando no hay médicos disponibles", () => {
      (
        useAvailableDoctorsForPrescriptions as ReturnType<typeof vi.fn>
      ).mockReturnValue({
        data: [],
        isLoading: false,
      });

      renderBatchModal();
      expect(
        screen.getByText(
          "No hay médicos disponibles para recetas"
        )
      ).toBeInTheDocument();
    });
  });

  describe("Separación de items: enviables vs omitidos", () => {
    it("debe separar items activos sin solicitud pendiente como enviables", () => {
      renderBatchModal({ selectedItemIds: ["item-1", "item-2"] });
      expect(screen.getByText("Losartan 50mg")).toBeInTheDocument();
      expect(screen.getByText("Metformina 850mg")).toBeInTheDocument();
    });

    it("debe marcar items inactivos como omitidos", () => {
      renderBatchModal({ selectedItemIds: ["item-1", "item-3"] });
      expect(screen.getByText("Medicamento suspendido")).toBeInTheDocument();
      expect(screen.getByText("No se solicitaran (1)")).toBeInTheDocument();
    });

    it("debe marcar items con solicitud pendiente como omitidos", () => {
      renderBatchModal({ selectedItemIds: ["item-1", "item-4"] });
      expect(
        screen.getByText("Ya tiene una solicitud pendiente")
      ).toBeInTheDocument();
    });

    it("debe mostrar la cantidad correcta de medicamentos enviables en la descripción", () => {
      renderBatchModal({ selectedItemIds: ["item-1", "item-2"] });
      expect(
        screen.getByText("Se enviarán 2 solicitud(es) al médico seleccionado")
      ).toBeInTheDocument();
    });
  });

  describe("Botón de confirmar", () => {
    it("debe estar deshabilitado cuando no hay médico seleccionado", () => {
      renderBatchModal();
      const submitBtn = getSubmitButton();
      expect(submitBtn).toBeDefined();
      expect(submitBtn).toBeDisabled();
    });

    it("debe estar deshabilitado cuando todos los items son omitidos", () => {
      renderBatchModal({ selectedItemIds: ["item-3", "item-4"] });
      // item-3 inactivo, item-4 con pendiente -> no hay sendableItems
      // El botón muestra "(0)" items
      const buttons = screen.getAllByRole("button");
      const submitBtn = buttons.find((btn) =>
        btn.textContent?.includes("Solicitar Recetas (0)")
      );
      expect(submitBtn).toBeDefined();
      expect(submitBtn).toBeDisabled();
    });

    it("debe estar deshabilitado mientras los médicos cargan", () => {
      (
        useAvailableDoctorsForPrescriptions as ReturnType<typeof vi.fn>
      ).mockReturnValue({
        data: undefined,
        isLoading: true,
      });

      renderBatchModal();
      const submitBtn = getSubmitButton();
      expect(submitBtn).toBeDefined();
      expect(submitBtn).toBeDisabled();
    });
  });

  describe("Envío del lote", () => {
    /**
     * The Select is mocked as native HTML buttons (role="option").
     * We can click them directly to simulate selection.
     */
    async function selectDoctor(doctorText: string) {
      const user = userEvent.setup();
      const option = screen.getByRole("option", { name: doctorText });
      await user.click(option);
    }

    it("debe llamar a batchRequestPrescriptionMutation con doctorUserId seleccionado", async () => {
      renderBatchModal({ selectedItemIds: ["item-1", "item-2"] });

      await selectDoctor("Dr. Carlos Gomez");

      await waitFor(() => {
        const submitBtn = getSubmitButton();
        expect(submitBtn).not.toBeDisabled();
      });

      const user = userEvent.setup();
      await user.click(getSubmitButton()!);

      expect(mockBatchMutateAsync).toHaveBeenCalledWith({
        cardId: "card-123",
        itemIds: ["item-1", "item-2"],
        doctorUserId: "user-doc-1",
      });
    });

    it("debe pasar solo los itemIds enviables (no los omitidos)", async () => {
      // item-1 enviable, item-3 inactivo (omitido)
      renderBatchModal({ selectedItemIds: ["item-1", "item-3"] });

      await selectDoctor("Dr. Carlos Gomez");

      await waitFor(() => {
        const submitBtn = getSubmitButton();
        expect(submitBtn).not.toBeDisabled();
      });

      const user = userEvent.setup();
      await user.click(getSubmitButton()!);

      expect(mockBatchMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          itemIds: ["item-1"], // solo el enviable
        })
      );
    });

    it("debe mostrar toast de éxito al confirmar", async () => {
      renderBatchModal({ selectedItemIds: ["item-1", "item-2"] });

      await selectDoctor("Dr. Carlos Gomez");

      await waitFor(() => {
        expect(getSubmitButton()).not.toBeDisabled();
      });

      const user = userEvent.setup();
      await user.click(getSubmitButton()!);

      await waitFor(() => {
        expect(mockShowSuccess).toHaveBeenCalledWith(
          "Solicitudes enviadas correctamente",
          expect.stringContaining("2 solicitud(es)")
        );
      });
    });

    it("debe mostrar toast de error cuando el lote falla", async () => {
      mockBatchMutateAsync.mockRejectedValueOnce(new Error("Server error"));

      renderBatchModal({ selectedItemIds: ["item-1"] });

      await selectDoctor("Dr. Carlos Gomez");

      await waitFor(() => {
        expect(getSubmitButton()).not.toBeDisabled();
      });

      const user = userEvent.setup();
      await user.click(getSubmitButton()!);

      await waitFor(() => {
        expect(mockShowError).toHaveBeenCalledWith(
          "Error al solicitar recetas",
          "Por favor, intenta nuevamente mas tarde."
        );
      });
    });

    it("debe cerrar el modal y llamar onSuccess después de confirmar", async () => {
      const { onClose, onSuccess } = renderBatchModal({
        selectedItemIds: ["item-1"],
      });

      await selectDoctor("Dr. Carlos Gomez");

      await waitFor(() => {
        expect(getSubmitButton()).not.toBeDisabled();
      });

      const user = userEvent.setup();
      await user.click(getSubmitButton()!);

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
        expect(onSuccess).toHaveBeenCalled();
      });
    });
  });

  describe("Reset al cerrar modal", () => {
    it("debe resetear la selección del médico cuando se cierra", async () => {
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });

      const { rerender } = render(
        <QueryClientProvider client={queryClient}>
          <BatchRequestPrescriptionModal
            isOpen={true}
            onClose={vi.fn()}
            greenCard={mockGreenCard}
            selectedItemIds={["item-1"]}
          />
        </QueryClientProvider>
      );

      // Cerrar
      rerender(
        <QueryClientProvider client={queryClient}>
          <BatchRequestPrescriptionModal
            isOpen={false}
            onClose={vi.fn()}
            greenCard={mockGreenCard}
            selectedItemIds={["item-1"]}
          />
        </QueryClientProvider>
      );

      // Volver a abrir
      rerender(
        <QueryClientProvider client={queryClient}>
          <BatchRequestPrescriptionModal
            isOpen={true}
            onClose={vi.fn()}
            greenCard={mockGreenCard}
            selectedItemIds={["item-1"]}
          />
        </QueryClientProvider>
      );

      // El botón debe estar deshabilitado (selección reseteada)
      const submitBtn = getSubmitButton();
      expect(submitBtn).toBeDefined();
      expect(submitBtn).toBeDisabled();
    });
  });
});
