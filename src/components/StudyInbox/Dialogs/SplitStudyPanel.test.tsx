// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getStudyInboxPacsImages } from "@/api/StudyInbox/get-study-inbox-pacs-images.action";
import { getStudyInboxPacsImagePreview } from "@/api/StudyInbox/get-study-inbox-pacs-image-preview.action";
import { getStudyInbox } from "@/api/StudyInbox/get-study-inbox.action";
import type { PaginatedStudyInboxResponse } from "@/types/StudyInbox/StudyInbox.types";
import { SplitStudyPanel } from "./SplitStudyPanel";

vi.mock("@/api/StudyInbox/get-study-inbox-pacs-images.action", () => ({
  getStudyInboxPacsImages: vi.fn(),
}));
vi.mock("@/api/StudyInbox/get-study-inbox-pacs-image-preview.action", () => ({
  getStudyInboxPacsImagePreview: vi.fn(),
}));
vi.mock("@/api/StudyInbox/get-study-inbox.action", () => ({
  getStudyInbox: vi.fn(),
}));
vi.mock("./EcoTypeNoteField", () => ({
  EcoTypeNoteField: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (v: string) => void;
  }) => (
    <input
      aria-label="nota"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

const reviewResponse = {
  data: [
    { id: "rep-a", attachmentId: "att-a", attachmentFileName: "spacessi-mamaria.pdf" },
    { id: "rep-b", attachmentId: "att-b", attachmentFileName: "spacessi-tiroides.pdf" },
  ],
  total: 2,
  page: 1,
  limit: 100,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
} as unknown as PaginatedStudyInboxResponse;

describe("SplitStudyPanel (bandeja) — adjuntar informes por grupo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:x"),
      revokeObjectURL: vi.fn(),
    });
    vi.mocked(getStudyInboxPacsImages).mockResolvedValue([
      "inst-1",
      "inst-2",
      "inst-3",
    ]);
    vi.mocked(getStudyInboxPacsImagePreview).mockResolvedValue(
      new Blob(["jpg"], { type: "image/jpeg" }),
    );
    vi.mocked(getStudyInbox).mockResolvedValue(reviewResponse);
  });

  it("reparte en 2 estudios y adjunta un informe distinto a cada uno", async () => {
    const onConfirm = vi.fn();
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={client}>
        <SplitStudyPanel
          itemId="item-1"
          hasReport={false}
          detectedSubtype={null}
          isPending={false}
          onConfirm={onConfirm}
          onCancel={vi.fn()}
        />
      </QueryClientProvider>,
    );

    await waitFor(() => expect(screen.getAllByRole("img")).toHaveLength(3));
    // imagen 3 -> estudio B (un click)
    await userEvent.click(screen.getByRole("button", { name: /imagen 3/i }));

    const notes = screen.getAllByLabelText("nota");
    await userEvent.type(notes[0], "Mamaria");
    await userEvent.type(notes[1], "Tiroides");

    const reportSelects = screen.getAllByRole("combobox");
    await userEvent.selectOptions(reportSelects[0], "rep-a");
    await userEvent.selectOptions(reportSelects[1], "rep-b");

    await userEvent.click(
      screen.getByRole("button", { name: /confirmar 2 estudios/i }),
    );

    expect(onConfirm).toHaveBeenCalledWith([
      {
        instanceIds: ["inst-1", "inst-2"],
        note: "Mamaria",
        includeReport: undefined,
        reportAttachmentItemId: "rep-a",
      },
      {
        instanceIds: ["inst-3"],
        note: "Tiroides",
        includeReport: undefined,
        reportAttachmentItemId: "rep-b",
      },
    ]);
  });
});
