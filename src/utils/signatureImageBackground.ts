const MIN_LIGHT_BORDER_RATIO = 0.35;
const MIN_LIGHT_BORDER_SAMPLES = 12;
const BACKGROUND_MIN_BRIGHTNESS = 160;
const MAX_NEUTRAL_SATURATION = 22;
const WHITE_BACKGROUND_BRIGHTNESS = 235;
const WHITE_FULL_TRANSPARENT_DISTANCE = 18;
const WHITE_MAX_TRANSPARENT_DISTANCE = 48;
const PAPER_MAX_TRANSPARENT_DISTANCE = 70;
const MIN_PAPER_PIXEL_BRIGHTNESS = 145;
const PAPER_PIXEL_BRIGHTNESS_OFFSET = 28;

interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export function removeLightBackgroundFromPixels(
  input: Uint8ClampedArray,
  width: number,
  height: number,
): Uint8ClampedArray {
  const output = new Uint8ClampedArray(input);

  if (width <= 0 || height <= 0 || input.length < width * height * 4) {
    return output;
  }

  const background = estimateLightBackground(input, width, height);

  if (!background) {
    return output;
  }

  const backgroundBrightness = brightness(background);
  const thresholds = transparencyThresholds(backgroundBrightness);

  for (let index = 0; index < width * height * 4; index += 4) {
    const alpha = input[index + 3];

    if (alpha === 0) {
      continue;
    }

    const pixel = {
      r: input[index],
      g: input[index + 1],
      b: input[index + 2],
    };

    if (!isNeutralLightPixel(pixel, thresholds.minPixelBrightness)) {
      continue;
    }

    const distance = colorDistance(pixel, background);

    if (distance > thresholds.maxDistance) {
      continue;
    }

    if (thresholds.mode === "paper") {
      output[index + 3] = 0;
      continue;
    }

    const remainingAlpha =
      distance <= thresholds.fullDistance
        ? 0
        : (distance - thresholds.fullDistance) /
          (thresholds.maxDistance - thresholds.fullDistance);

    output[index + 3] = Math.round(alpha * remainingAlpha);
  }

  return output;
}

export function applyLightBackgroundTransparency(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): boolean {
  try {
    const imageData = ctx.getImageData(0, 0, width, height);
    const processedData = removeLightBackgroundFromPixels(
      imageData.data,
      imageData.width,
      imageData.height,
    );

    imageData.data.set(processedData);
    ctx.putImageData(imageData, 0, 0);

    return true;
  } catch (error) {
    console.warn("No se pudo limpiar el fondo claro de la firma/sello", error);
    return false;
  }
}

function estimateLightBackground(
  input: Uint8ClampedArray,
  width: number,
  height: number,
): RgbColor | null {
  const samples: RgbColor[] = [];
  let borderPixels = 0;

  const addSample = (x: number, y: number) => {
    const index = (y * width + x) * 4;
    const alpha = input[index + 3];

    if (alpha === 0) {
      return;
    }

    borderPixels += 1;

    const pixel = {
      r: input[index],
      g: input[index + 1],
      b: input[index + 2],
    };

    if (isNeutralLightPixel(pixel, BACKGROUND_MIN_BRIGHTNESS)) {
      samples.push(pixel);
    }
  };

  for (let x = 0; x < width; x += 1) {
    addSample(x, 0);
    if (height > 1) {
      addSample(x, height - 1);
    }
  }

  for (let y = 1; y < height - 1; y += 1) {
    addSample(0, y);
    if (width > 1) {
      addSample(width - 1, y);
    }
  }

  if (
    samples.length < MIN_LIGHT_BORDER_SAMPLES ||
    samples.length / Math.max(borderPixels, 1) < MIN_LIGHT_BORDER_RATIO
  ) {
    return null;
  }

  return averageColor(samples);
}

function averageColor(samples: RgbColor[]): RgbColor {
  const totals = samples.reduce(
    (acc, pixel) => ({
      r: acc.r + pixel.r,
      g: acc.g + pixel.g,
      b: acc.b + pixel.b,
    }),
    { r: 0, g: 0, b: 0 },
  );

  return {
    r: Math.round(totals.r / samples.length),
    g: Math.round(totals.g / samples.length),
    b: Math.round(totals.b / samples.length),
  };
}

function isNeutralLightPixel(pixel: RgbColor, minBrightness: number): boolean {
  const max = Math.max(pixel.r, pixel.g, pixel.b);
  const min = Math.min(pixel.r, pixel.g, pixel.b);
  return brightness(pixel) >= minBrightness && max - min <= MAX_NEUTRAL_SATURATION;
}

function colorDistance(a: RgbColor, b: RgbColor): number {
  return Math.hypot(a.r - b.r, a.g - b.g, a.b - b.b);
}

function brightness(pixel: RgbColor): number {
  return (pixel.r + pixel.g + pixel.b) / 3;
}

function transparencyThresholds(backgroundBrightness: number) {
  if (backgroundBrightness >= WHITE_BACKGROUND_BRIGHTNESS) {
    return {
      mode: "white" as const,
      minPixelBrightness: 210,
      fullDistance: WHITE_FULL_TRANSPARENT_DISTANCE,
      maxDistance: WHITE_MAX_TRANSPARENT_DISTANCE,
    };
  }

  return {
    mode: "paper" as const,
    minPixelBrightness: Math.max(
      MIN_PAPER_PIXEL_BRIGHTNESS,
      backgroundBrightness - PAPER_PIXEL_BRIGHTNESS_OFFSET,
    ),
    fullDistance: 0,
    maxDistance: PAPER_MAX_TRANSPARENT_DISTANCE,
  };
}
