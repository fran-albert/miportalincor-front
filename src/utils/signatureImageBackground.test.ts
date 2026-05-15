import { describe, expect, it } from "vitest";
import { removeLightBackgroundFromPixels } from "./signatureImageBackground";

const pixelIndex = (width: number, x: number, y: number) => (y * width + x) * 4;

function createImage(
  width: number,
  height: number,
  color: [number, number, number, number],
) {
  const data = new Uint8ClampedArray(width * height * 4);

  for (let index = 0; index < data.length; index += 4) {
    data[index] = color[0];
    data[index + 1] = color[1];
    data[index + 2] = color[2];
    data[index + 3] = color[3];
  }

  return data;
}

function setPixel(
  data: Uint8ClampedArray,
  width: number,
  x: number,
  y: number,
  color: [number, number, number, number],
) {
  const index = pixelIndex(width, x, y);
  data[index] = color[0];
  data[index + 1] = color[1];
  data[index + 2] = color[2];
  data[index + 3] = color[3];
}

describe("removeLightBackgroundFromPixels", () => {
  it("turns a white paper background transparent and keeps dark signature strokes", () => {
    const width = 8;
    const data = createImage(width, 8, [255, 255, 255, 255]);
    setPixel(data, width, 4, 4, [20, 20, 20, 255]);

    const result = removeLightBackgroundFromPixels(data, width, 8);

    expect(result[pixelIndex(width, 0, 0) + 3]).toBe(0);
    expect(result[pixelIndex(width, 4, 4) + 3]).toBe(255);
  });

  it("preserves gray stamp strokes on a clear background", () => {
    const width = 8;
    const data = createImage(width, 8, [246, 246, 246, 255]);
    setPixel(data, width, 3, 3, [185, 185, 185, 255]);

    const result = removeLightBackgroundFromPixels(data, width, 8);

    expect(result[pixelIndex(width, 3, 3) + 3]).toBe(255);
  });

  it("preserves colored seal strokes", () => {
    const width = 8;
    const data = createImage(width, 8, [250, 250, 250, 255]);
    setPixel(data, width, 2, 2, [45, 82, 170, 255]);

    const result = removeLightBackgroundFromPixels(data, width, 8);

    expect(result[pixelIndex(width, 2, 2) + 3]).toBe(255);
  });

  it("does not clean images without a light border background", () => {
    const width = 8;
    const data = createImage(width, 8, [175, 166, 150, 255]);
    setPixel(data, width, 4, 4, [20, 20, 20, 255]);

    const result = removeLightBackgroundFromPixels(data, width, 8);

    expect(result[pixelIndex(width, 0, 0) + 3]).toBe(255);
    expect(result[pixelIndex(width, 4, 4) + 3]).toBe(255);
  });

  it("softens near-background pixels instead of cutting a hard edge", () => {
    const width = 8;
    const data = createImage(width, 8, [255, 255, 255, 255]);
    setPixel(data, width, 4, 4, [232, 232, 232, 255]);

    const result = removeLightBackgroundFromPixels(data, width, 8);
    const alpha = result[pixelIndex(width, 4, 4) + 3];

    expect(alpha).toBeGreaterThan(0);
    expect(alpha).toBeLessThan(255);
  });
});
