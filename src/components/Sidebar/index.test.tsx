import { describe, expect, it } from "vitest";
import { filterStudyReportSidebarItems } from "./studyReportSidebarAccess";

const studyReportItem = {
  title: "Mis estudios por informar",
  url: "/mis-estudios-por-informar",
  icon: (() => null) as never,
  allowedRoles: ["Medico"],
  strictRoles: true,
};

describe("study report sidebar access", () => {
  it("oculta el item cuando el médico no está habilitado", () => {
    expect(filterStudyReportSidebarItems([studyReportItem], false)).toEqual([]);
  });

  it("mantiene el item cuando el médico está habilitado", () => {
    expect(filterStudyReportSidebarItems([studyReportItem], true)).toEqual([
      studyReportItem,
    ]);
  });
});
