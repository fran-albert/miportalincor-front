import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import VariousTab from "..";
import type { Collaborator } from "@/types/Collaborator/Collaborator";
import type { DataType } from "@/types/Data-Type/Data-Type";

const mutate = vi.fn();

vi.mock("@/hooks/Study/useUploadStudyFileCollaborator", () => ({
  useUploadStudyFileMutation: () => ({ mutate }),
}));

vi.mock("@/hooks/Data-Values/useDataValuesMutations", () => ({
  useDataValuesMutations: () => ({
    deleteDataValuesMutation: { mutate: vi.fn() },
  }),
}));

const collaborator = {
  id: 9,
  userName: "32274947",
  firstName: "Nicolas",
  lastName: "Labombarda",
} as unknown as Collaborator;

const studiesCategory = [
  { id: 78, name: "Electrocardiograma", category: "ESTUDIOS", dataType: "STRING" },
  { id: 79, name: "Ergometría", category: "ESTUDIOS", dataType: "STRING" },
  { id: 80, name: "Laboratorios", category: "ESTUDIOS", dataType: "STRING" },
] as unknown as DataType[];

const renderTab = () =>
  render(
    <VariousTab
      isEditing
      setIsEditing={vi.fn()}
      collaborator={collaborator}
      studiesCategory={studiesCategory}
      medicalEvaluationId={116}
      urls={[]}
      standalone
    />
  );

const sectionByTitle = (title: string) => {
  const heading = screen.getByRole("heading", { level: 5, name: title });
  const section = heading.closest("section");
  if (!section) throw new Error(`No se encontró la sección ${title}`);
  return within(section);
};

const lastFormData = (): FormData => {
  const call = mutate.mock.calls.at(-1);
  if (!call) throw new Error("No se llamó a mutate");
  return (call[0] as { formData: FormData }).formData;
};

describe("VariousTab - firma opcional al subir el electro", () => {
  beforeEach(() => {
    mutate.mockReset();
  });

  it("muestra el checkbox marcado solo en Electrocardiograma y Ergometría", () => {
    renderTab();

    const electro = sectionByTitle("Electrocardiograma").getByRole("checkbox", {
      name: /inyectar firma/i,
    });
    const ergo = sectionByTitle("Ergometría").getByRole("checkbox", {
      name: /inyectar firma/i,
    });

    expect(electro).toBeChecked();
    expect(ergo).toBeChecked();
    expect(
      sectionByTitle("Laboratorios").queryByRole("checkbox", {
        name: /inyectar firma/i,
      })
    ).toBeNull();
  });

  it("por defecto sube sin skipSignature", async () => {
    const user = userEvent.setup();
    renderTab();

    const input = document.getElementById(
      "file-input-electrocardiograma"
    ) as HTMLInputElement;
    await user.upload(
      input,
      new File(["pdf"], "electro.pdf", { type: "application/pdf" })
    );

    expect(mutate).toHaveBeenCalledTimes(1);
    expect(lastFormData().get("skipSignature")).toBeNull();
    expect(lastFormData().get("studyType")).toBe("Electrocardiograma");
  });

  it("desmarcado manda skipSignature=true y vuelve a marcarse después de subir", async () => {
    const user = userEvent.setup();
    mutate.mockImplementation(
      (_vars: unknown, options?: { onSettled?: () => void }) => {
        options?.onSettled?.();
      }
    );
    renderTab();

    const checkbox = sectionByTitle("Electrocardiograma").getByRole("checkbox", {
      name: /inyectar firma/i,
    });
    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();

    const input = document.getElementById(
      "file-input-electrocardiograma"
    ) as HTMLInputElement;
    await user.upload(
      input,
      new File(["pdf"], "electro-papel.pdf", { type: "application/pdf" })
    );

    expect(lastFormData().get("skipSignature")).toBe("true");
    expect(
      sectionByTitle("Electrocardiograma").getByRole("checkbox", {
        name: /inyectar firma/i,
      })
    ).toBeChecked();
  });

  it("desmarcar el electro no afecta a la ergometría", async () => {
    const user = userEvent.setup();
    renderTab();

    await user.click(
      sectionByTitle("Electrocardiograma").getByRole("checkbox", {
        name: /inyectar firma/i,
      })
    );

    const input = document.getElementById(
      "file-input-ergometria"
    ) as HTMLInputElement;
    await user.upload(
      input,
      new File(["pdf"], "ergo.pdf", { type: "application/pdf" })
    );

    expect(lastFormData().get("skipSignature")).toBeNull();
  });
});
