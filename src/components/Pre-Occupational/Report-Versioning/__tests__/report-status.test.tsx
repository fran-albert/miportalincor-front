import { describe, expect, it } from "vitest";
import { getReportStatus } from "../report-status";

describe("getReportStatus", () => {
  it("uses a specific status when a final report became outdated", () => {
    const status = getReportStatus({
      id: 23,
      medicalEvaluationId: 11,
      version: 2,
      fileName: "informe.pdf",
      storageKey: "studies/1/informe.pdf",
      generatedAt: "2026-05-08T21:21:17.843Z",
      generatedByUserId: "80",
      generatedByEmail: "secretaria@example.com",
      isCurrent: true,
      isFinal: true,
      outdatedByExamChanges: true,
      source: "file.upload-study",
      metadata: null,
      createdAt: "2026-05-08T18:21:17-03:00",
    });

    expect(status).toEqual({
      label: "Final desactualizada",
      variant: "warning",
    });
  });
});
