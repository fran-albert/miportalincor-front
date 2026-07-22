// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGet = vi.hoisted(() => vi.fn());
const mockPost = vi.hoisted(() => vi.fn());

vi.mock("@/services/axiosConfig", () => ({
  apiIncorHC: {
    get: mockGet,
    post: mockPost,
  },
}));

import {
  addStudyReportAddendum,
  getMyStudyReports,
  getStudyReportAccess,
  getStudyReportInboxImagePreview,
  getStudyReportInboxImages,
  getStudyReportTemplates,
  getStudyReportViewer,
  previewStudyReport,
  saveStudyReportDraft,
  signStudyReport,
  splitStudyReport,
} from "./study-report.actions";

describe("study report actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads the doctor's report queue and templates", async () => {
    mockGet
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] });

    await expect(getMyStudyReports()).resolves.toEqual([]);
    await expect(getStudyReportTemplates()).resolves.toEqual([]);

    expect(mockGet).toHaveBeenNthCalledWith(1, "/study-reports/mine");
    expect(mockGet).toHaveBeenNthCalledWith(2, "/study-reports/templates");
  });

  it("loads the pilot access flag", async () => {
    mockGet.mockResolvedValue({ data: { enabled: false } });

    await expect(getStudyReportAccess()).resolves.toEqual({ enabled: false });
    expect(mockGet).toHaveBeenCalledWith("/study-reports/access");
  });

  it("creates the first draft only through the draft endpoint", async () => {
    const report = { id: "report-1", status: "BORRADOR" };
    mockPost.mockResolvedValue({ data: report });

    await expect(saveStudyReportDraft("inbox-1", "abdomen", { conclusion: "Normal" })).resolves.toEqual(report);

    expect(mockPost).toHaveBeenCalledWith("/study-reports/drafts/inbox-1", {
      templateKey: "abdomen",
      content: { conclusion: "Normal" },
    });
  });

  it("loads item images and posts an exact split payload", async () => {
    mockGet.mockResolvedValue({ data: ["instance-1", "instance-2"] });
    mockPost.mockResolvedValue({ data: [] });
    const blob = new Blob(["jpg"], { type: "image/jpeg" });

    await expect(getStudyReportInboxImages("item-1")).resolves.toEqual([
      "instance-1",
      "instance-2",
    ]);
    mockGet.mockResolvedValue({ data: blob });
    await expect(
      getStudyReportInboxImagePreview("item-1", "instance-2"),
    ).resolves.toBe(blob);
    await splitStudyReport("item-1", [
      {
        assignedInstanceIds: ["instance-1"],
        templateKey: "abdomen",
        label: "Abdominal",
      },
      {
        assignedInstanceIds: ["instance-2"],
        templateKey: "mamaria",
        label: "Mamaria",
      },
    ]);

    expect(mockGet).toHaveBeenNthCalledWith(
      1,
      "/study-reports/inbox/item-1/images",
    );
    expect(mockGet).toHaveBeenNthCalledWith(
      2,
      "/study-reports/inbox/item-1/images/instance-2",
      { responseType: "blob" },
    );
    expect(mockPost).toHaveBeenCalledWith("/study-reports/split/item-1", {
      groups: [
        {
          assignedInstanceIds: ["instance-1"],
          templateKey: "abdomen",
          label: "Abdominal",
        },
        {
          assignedInstanceIds: ["instance-2"],
          templateKey: "mamaria",
          label: "Mamaria",
        },
      ],
    });
  });

  it("includes the report id when saving a sibling draft", async () => {
    mockPost.mockResolvedValue({ data: { id: "report-2" } });

    await saveStudyReportDraft("item-1", "mamaria", {}, "report-2");

    expect(mockPost).toHaveBeenCalledWith("/study-reports/drafts/item-1", {
      reportId: "report-2",
      templateKey: "mamaria",
      content: {},
    });
  });

  it("requests the viewer session and inline PDF preview with their expected options", async () => {
    const viewer = { viewerPath: "/pacs-viewer/session", expiresInSeconds: 60 };
    const pdf = new Blob(["pdf"], { type: "application/pdf" });
    mockPost
      .mockResolvedValueOnce({ data: viewer })
      .mockResolvedValueOnce({ data: pdf });

    await expect(getStudyReportViewer("report-1")).resolves.toEqual(viewer);
    await expect(previewStudyReport("report-1")).resolves.toBe(pdf);

    expect(mockPost).toHaveBeenNthCalledWith(1, "/study-reports/report-1/viewer-session");
    expect(mockPost).toHaveBeenNthCalledWith(2, "/study-reports/report-1/preview", undefined, { responseType: "blob" });
  });

  it("signs the report and posts a signed addendum", async () => {
    const signedReport = { id: "report-1", status: "FIRMADO" };
    mockPost
      .mockResolvedValueOnce({ data: signedReport })
      .mockResolvedValueOnce({ data: undefined });

    await expect(signStudyReport("report-1")).resolves.toEqual(signedReport);
    await expect(addStudyReportAddendum("report-1", "Medida corregida")).resolves.toBeUndefined();

    expect(mockPost).toHaveBeenNthCalledWith(1, "/study-reports/report-1/sign");
    expect(mockPost).toHaveBeenNthCalledWith(2, "/study-reports/report-1/addendums", { text: "Medida corregida" });
  });
});
