// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  isAcceptedEcoImage,
  isBmp,
  toUploadableEcoImage,
} from "./ecoImageFiles";

const file = (name: string, type: string) =>
  new File([new Uint8Array([1, 2, 3])], name, { type });

afterEach(() => vi.unstubAllGlobals());

describe("archivos del ecógrafo", () => {
  it("acepta JPG, PNG y BMP y rechaza el resto", () => {
    expect(isAcceptedEcoImage(file("a.jpg", "image/jpeg"))).toBe(true);
    expect(isAcceptedEcoImage(file("a.JPEG", ""))).toBe(true);
    expect(isAcceptedEcoImage(file("a.png", "image/png"))).toBe(true);
    expect(isAcceptedEcoImage(file("IMG0001.BMP", ""))).toBe(true);
    expect(isAcceptedEcoImage(file("informe.pdf", "application/pdf"))).toBe(
      false,
    );
    expect(isAcceptedEcoImage(file("estudio.dcm", ""))).toBe(false);
  });

  it("reconoce el BMP por extensión o por tipo", () => {
    expect(isBmp(file("IMG0001.BMP", ""))).toBe(true);
    expect(isBmp(file("sin-extension", "image/bmp"))).toBe(true);
    expect(isBmp(file("a.jpg", "image/jpeg"))).toBe(false);
  });

  it("un JPG se sube tal cual", async () => {
    const jpg = file("a.jpg", "image/jpeg");
    await expect(toUploadableEcoImage(jpg)).resolves.toBe(jpg);
  });

  it("un BMP se pasa a JPG con el mismo nombre", async () => {
    const close = vi.fn();
    vi.stubGlobal(
      "createImageBitmap",
      vi.fn().mockResolvedValue({ width: 640, height: 480, close }),
    );
    const drawImage = vi.fn();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      drawImage,
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(
      function (callback: BlobCallback, type?: string) {
        callback(new Blob(["jpeg"], { type }));
      },
    );

    const result = await toUploadableEcoImage(file("IMG0001.BMP", ""));

    expect(result.name).toBe("IMG0001.jpg");
    expect(result.type).toBe("image/jpeg");
    expect(drawImage).toHaveBeenCalled();
    expect(close).toHaveBeenCalled();
  });
});
