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
  container: { padding: 8 },
  header: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },

  // sección casillas
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  row: { flexDirection: "row", alignItems: "center" },
  checkboxWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  box: {
    width: 10,
    height: 10,
    borderWidth: 1,
    borderColor: "#000",
    marginRight: 4,
  },
  tick: {
    position: "absolute",
    top: 2,
    left: 2,
    width: 6,
    height: 6,
    backgroundColor: "#000",
  },
  checkboxLabel: { fontSize: 12 },

  // Peso/Talla/IMC
  valueRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    marginTop: 8,
  },
  infoField: { alignItems: "center" },
  infoLabel: { fontSize: 10, fontWeight: "bold" },
  infoValue: { fontSize: 10, marginTop: 2 },
});

const OPTIONS = ["Bueno", "Regular", "Malo"] as const;

const PDFCheckboxes = ({
  selected,
}: {
  selected: (typeof OPTIONS)[number];
}) => (
  <View style={styles.row}>
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
      <Text style={styles.infoLabel}>Aspecto General:</Text>
      <PDFCheckboxes selected={aspectoGeneral} />
    </View>

    {/* Peso / Talla / IMC */}
    <View style={{ marginBottom: 12 }}>
      <View style={styles.valueRow}>
        <InfoField label="Peso:" value={peso} />
        <InfoField label="Talla:" value={talla} />
        <InfoField label="IMC:" value={imc} />
      </View>
    </View>
  </View>
);

export default ClinicalEvaluationPdf;
