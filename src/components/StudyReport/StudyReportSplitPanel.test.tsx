// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getStudyReportInboxImagePreview,
  getStudyReportInboxImages,
} from "@/api/StudyReport/study-report.actions";
import type { StudyReportTemplate } from "@/types/StudyReport/StudyReport.types";
import { StudyReportSplitPanel } from "./StudyReportSplitPanel";

vi.mock("@/api/StudyReport/study-report.actions", () => ({
  getStudyReportInboxImages: vi.fn(),
  getStudyReportInboxImagePreview: vi.fn(),
}));

const templates: StudyReportTemplate[] = [
  { key: "gineco", label: "Ginecológica", subtypeAliases: [], fields: [] },
  { key: "mamaria", label: "Mamaria", subtypeAliases: [], fields: [] },
];

describe("StudyReportSplitPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn((blob: Blob) => `blob:${blob.size}`),
      revokeObjectURL: vi.fn(),
    });
    vi.mocked(getStudyReportInboxImages).mockResolvedValue([
      "instance-1",
      "instance-2",
      "instance-3",
      "instance-4",
      "instance-5",
    ]);
    vi.mocked(getStudyReportInboxImagePreview).mockResolvedValue(
      new Blob(["jpg"], { type: "image/jpeg" }),
    );
  });

  it("reparte las imágenes en orden, exige etiquetas y limita previews paralelos", async () => {
    let activeRequests = 0;
    let maxConcurrentRequests = 0;
    vi.mocked(getStudyReportInboxImagePreview).mockImplementation(async () => {
      activeRequests += 1;
      maxConcurrentRequests = Math.max(maxConcurrentRequests, activeRequests);
      await new Promise((resolve) => window.setTimeout(resolve, 5));
      activeRequests -= 1;
      return new Blob(["jpg"], { type: "image/jpeg" });
    });
    const onConfirm = vi.fn();
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <StudyReportSplitPanel
          itemId="item-1"
          templates={templates}
          isPending={false}
          onConfirm={onConfirm}
          onCancel={vi.fn()}
        />
      </QueryClientProvider>,
    );

    await waitFor(() => expect(screen.getAllByRole("img")).toHaveLength(5));
    expect(maxConcurrentRequests).toBeLessThanOrEqual(4);
    await userEvent.click(screen.getByRole("button", { name: /imagen 2 para dividir/i }));
    const labels = screen.getAllByRole("textbox");
    await userEvent.type(labels[0], "Ginecológica");
    await userEvent.type(labels[1], "Mamaria");
    await userEvent.selectOptions(screen.getAllByRole("combobox")[1], "mamaria");
    await userEvent.click(screen.getByRole("button", { name: /confirmar división/i }));

    expect(onConfirm).toHaveBeenCalledWith([
      {
        assignedInstanceIds: ["instance-1", "instance-3", "instance-4", "instance-5"],
        templateKey: "gineco",
        label: "Ginecológica",
      },
      {
        assignedInstanceIds: ["instance-2"],
        templateKey: "mamaria",
        label: "Mamaria",
      },
    ]);
  });

  it("permite dividir en tres informes agregando un grupo", async () => {
    const onConfirm = vi.fn();
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <StudyReportSplitPanel
          itemId="item-1"
          templates={templates}
          isPending={false}
          onConfirm={onConfirm}
          onCancel={vi.fn()}
        />
      </QueryClientProvider>,
    );

    await waitFor(() => expect(screen.getAllByRole("img")).toHaveLength(5));
    await userEvent.click(screen.getByRole("button", { name: /agregar informe/i }));
    // imagen 3 → C (dos clicks: A→B→C); imagen 2 → B (un click)
    await userEvent.click(screen.getByRole("button", { name: /imagen 3 para dividir/i }));
    await userEvent.click(screen.getByRole("button", { name: /imagen 3 para dividir/i }));
    await userEvent.click(screen.getByRole("button", { name: /imagen 2 para dividir/i }));
    const labels = screen.getAllByRole("textbox");
    await userEvent.type(labels[0], "Abdominal");
    await userEvent.type(labels[1], "Mamaria");
    await userEvent.type(labels[2], "Tiroides");
    await userEvent.click(screen.getByRole("button", { name: /confirmar división/i }));

    expect(onConfirm).toHaveBeenCalledWith([
      {
        assignedInstanceIds: ["instance-1", "instance-4", "instance-5"],
        templateKey: "gineco",
        label: "Abdominal",
      },
      {
        assignedInstanceIds: ["instance-2"],
        templateKey: "gineco",
        label: "Mamaria",
      },
      {
        assignedInstanceIds: ["instance-3"],
        templateKey: "gineco",
        label: "Tiroides",
      },
    ]);
  });
});
