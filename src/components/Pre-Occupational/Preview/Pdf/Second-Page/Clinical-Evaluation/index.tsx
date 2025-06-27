// src/components/pdf/ClinicalEvaluationPdf.tsx
import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import CheckboxPdf from "@/components/Pdf/CheckBox";

interface ClinicalEvaluationPdfProps {
  aspectoGeneral: "Bueno" | "Regular" | "Malo";
  peso: string;
  talla: string;
  imc: string;
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    backgroundColor: "#FFF",
  },
  header: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#187B80",
    paddingVertical: 4,
    backgroundColor: "#F0F0F0",
    borderRadius: 4,
  },
  sectionRow: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "500",
    marginBottom: 4,
  },
  rowInline: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkboxWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  checkboxLabel: {
    fontSize: 10,
    fontStyle: "italic",
  },
  valueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoField: {
    alignItems: "center",
    width: "30%",
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: "500",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 10,
    borderWidth: 1,
    borderColor: "#EEE",
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 4,
    width: "100%",
    textAlign: "center",
    backgroundColor: "#F9F9F9",
  },
});

const OPTIONS = ["Bueno", "Regular", "Malo"] as const;

const PDFCheckboxes = ({
  selected,
}: {
  selected: (typeof OPTIONS)[number];
}) => (
  <View style={styles.rowInline}>
    {OPTIONS.map((opt) => (
      <View key={opt} style={styles.checkboxWrapper}>
        <CheckboxPdf checked={selected === opt} />
        <Text style={styles.checkboxLabel}>{opt}</Text>
      </View>
    ))}
  </View>
);

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
    <Text style={styles.header}>Resultados del Examen</Text>

    {/* Aspecto General */}
    <View style={styles.sectionRow}>
      <Text style={styles.sectionLabel}>Aspecto General:</Text>
      <PDFCheckboxes selected={aspectoGeneral} />
    </View>

    {/* Peso / Talla / IMC */}
    <View style={styles.sectionRow}>
      <View style={styles.valueRow}>
        <InfoField label="Peso (kg)" value={peso} />
        <InfoField label="Talla (cm)" value={talla} />
        <InfoField label="IMC" value={imc} />
      </View>
    </View>
  </View>
);

export default ClinicalEvaluationPdf;
