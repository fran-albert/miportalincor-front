import { describe, expect, it } from "vitest";
import {
  CreateActivitySchema,
  UpdateActivitySchema,
} from "./activity.schema";
import { ProgramTariffType } from "@/types/Program/ProgramActivity";

const pricing = {
  tariffType: ProgramTariffType.PER_SESSION,
  unitPricePesos: "30000",
};

describe("activity schemas", () => {
  it.each([CreateActivitySchema, UpdateActivitySchema])(
    "normaliza un profesional nulo a undefined",
    (schema) => {
      const result = schema.parse({
        name: "Nutrición",
        assignedProfessionalUserId: null,
        ...pricing,
      });

      expect(result.assignedProfessionalUserId).toBeUndefined();
    }
  );
});
