import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { pdfColors } from "../../shared";

interface ClinicalEvaluationPdfProps {
  aspectoGeneral?: "Bueno" | "Regular" | "Malo" | string;
  peso: string;
  talla: string;
  imc: string;
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: pdfColors.line,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 10,
  },
  headerWrap: {
    backgroundColor: pdfColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: pdfColors.line,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  header: {
    fontSize: 10,
    fontWeight: "bold",
    color: pdfColors.accentText,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  body: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  sectionRow: {
    gap: 5,
  },
  sectionLabel: {
    fontSize: 8,
    color: pdfColors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  rowInline: {
    flexDirection: "row",
    alignItems: "center",
    fontSize: 10,
    color: pdfColors.ink,
    fontWeight: "bold",
  },
  valueRow: {
    flexDirection: "row",
    gap: 10,
  },
  infoField: {
    flex: 1,
    borderWidth: 1,
    borderColor: pdfColors.line,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#ffffff",
  },
  infoLabel: {
    fontSize: 8,
    color: pdfColors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 10,
    color: pdfColors.ink,
    fontWeight: "bold",
  },
});

const AspectoGeneralValue = ({ value }: { value?: string }) => {
  if (!value?.trim()) return null;
  return (
    <View style={styles.rowInline}>
      <Text>{value}</Text>
    </View>
  );
};

const InfoField = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoField}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value || "—"}</Text>
  </View>
);

const ClinicalEvaluationPdf: React.FC<ClinicalEvaluationPdfProps> = ({
  aspectoGeneral,
  peso,
  talla,
  imc,
}) => (
  <View style={styles.container}>
    <View style={styles.headerWrap}>
      <Text style={styles.header}>Examen clinico</Text>
    </View>
    <View style={styles.body}>
      {aspectoGeneral?.trim() && (
        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel}>Aspecto general</Text>
          <AspectoGeneralValue value={aspectoGeneral} />
        </View>
      )}

      <View style={styles.sectionRow}>
        <Text style={styles.sectionLabel}>Mediciones</Text>
        <View style={styles.valueRow}>
          <InfoField label="Peso (kg)" value={peso} />
          <InfoField label="Talla (cm)" value={talla} />
          <InfoField label="IMC" value={imc} />
        </View>
      </View>
    </View>
  </View>
);

export default ClinicalEvaluationPdf;
