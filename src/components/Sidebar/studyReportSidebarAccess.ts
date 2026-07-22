interface SidebarItemWithUrl {
  url: string;
}

export const filterStudyReportSidebarItems = <T extends SidebarItemWithUrl>(
  items: T[],
  enabled: boolean,
): T[] =>
  enabled
    ? items
    : items.filter((item) => item.url !== "/mis-estudios-por-informar");
