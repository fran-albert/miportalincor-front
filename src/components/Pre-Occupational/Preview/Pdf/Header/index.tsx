import React from "react";
import { Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { pdfColors } from "../shared";
import { LaborReportBrandingConfig } from "@/types/Labor-Report-Branding-Config/LaborReportBrandingConfig";
import { resolveLaborReportBrandingConfig } from "../../signature-policy";

interface HeaderPreviewPdfProps {
  evaluationType: string;
  examType: string;
  brandingConfig?: LaborReportBrandingConfig;
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 14,
    borderWidth: 1,
    borderColor: pdfColors.line,
    borderRadius: 8,
    overflow: "hidden",
  },
  topBand: {
    height: 8,
    backgroundColor: pdfColors.accent,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#ffffff",
  },
  brandBlock: {
    width: 110,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  logo: {
    width: 78,
    height: 42,
    objectFit: "contain",
  },
  divider: {
    width: 1,
    alignSelf: "stretch",
    marginHorizontal: 14,
    backgroundColor: pdfColors.line,
  },
  titleBlock: {
    flex: 1,
    gap: 4,
  },
  metaBlock: {
    alignItems: "flex-end",
    justifyContent: "center",
    minWidth: 72,
    gap: 3,
  },
  eyebrow: {
    fontSize: 8,
    color: pdfColors.muted,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: pdfColors.accentText,
  },
  subtitle: {
    fontSize: 10,
    color: pdfColors.muted,
  },
  metaLabel: {
    fontSize: 7.2,
    color: pdfColors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.9,
  },
  metaValue: {
    fontSize: 9,
    fontWeight: "bold",
    color: pdfColors.ink,
  },
});

const HeaderPreviewPdf: React.FC<HeaderPreviewPdfProps> = ({
  evaluationType,
  examType,
  brandingConfig,
}) => {
  const currentDate = format(new Date(), "dd/MM/yyyy", { locale: es });
  const resolvedBranding = resolveLaborReportBrandingConfig(brandingConfig);

  return (
    <View style={styles.wrapper}>
      <View style={styles.topBand} />
      <View style={styles.content}>
        <View style={styles.brandBlock}>
          {resolvedBranding.logoUrl ? (
            <Image style={styles.logo} src={resolvedBranding.logoUrl} />
          ) : null}
        </View>
        <View style={styles.divider} />
        <View style={styles.titleBlock}>
          <Text style={styles.eyebrow}>{resolvedBranding.institutionName}</Text>
          <Text style={styles.title}>{examType}</Text>
          <Text style={styles.subtitle}>{evaluationType}</Text>
        </View>
        <View style={styles.metaBlock}>
          <Text style={styles.metaLabel}>Fecha</Text>
          <Text style={styles.metaValue}>{currentDate}</Text>
        </View>
      </View>
    </View>
  );
};

export default HeaderPreviewPdf;
