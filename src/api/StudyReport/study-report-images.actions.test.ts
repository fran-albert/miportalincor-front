import { afterEach, describe, expect, it, vi } from "vitest";
import { apiIncorHC } from "@/services/axiosConfig";
import { authStorage } from "@/utils/authStorage";
import {
  getStudyReportImages,
  getStudyReportImagePreview,
} from "./study-report-images.actions";

vi.mock("@/services/axiosConfig", () => ({
  apiIncorHC: { get: vi.fn() },
}));
vi.mock("@/utils/authStorage", () => ({
  authStorage: { getToken: vi.fn() },
}));
vi.mock("@/config/environment", () => ({
  environment: { API_INCOR_HC_URL: "https://api.test" },
}));

describe("study report image actions", () => {
  afterEach(() => vi.clearAllMocks());

  it("lista las instancias del informe en el orden del backend", async () => {
    vi.mocked(apiIncorHC.get).mockResolvedValue({
      data: { instanceIds: ["instance-2", "instance-1"] },
    });

    await expect(getStudyReportImages("report-1")).resolves.toEqual([
      "instance-2",
      "instance-1",
    ]);
    expect(apiIncorHC.get).toHaveBeenCalledWith("/study-reports/report-1/images");
  });

  it("descarga el preview con el Bearer y devuelve el blob", async () => {
    vi.mocked(authStorage.getToken).mockReturnValue("token-123");
    const blob = new Blob(["jpg"], { type: "image/jpeg" });
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      blob: vi.fn().mockResolvedValue(blob),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      getStudyReportImagePreview("report-1", "instance-2"),
    ).resolves.toBe(blob);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.test/study-reports/report-1/images/instance-2",
      { headers: { Authorization: "Bearer token-123" } },
    );
  });
});
