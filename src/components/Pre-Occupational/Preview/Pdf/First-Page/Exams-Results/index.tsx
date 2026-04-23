import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { ExamResults } from "@/common/helpers/examsResults.maps";
import { pdfColors } from "../../shared";

interface ExamResultsPdfProps {
  examResults: ExamResults;
}

const normalizeResultValue = (value?: string) => {
  const text = String(value ?? "").trim();

  if (!text) {
    return "Sin dato registrado";
  }

  if (!/\s/.test(text) && text.length > 72) {
    return `${text.slice(0, 69)}...`;
  }

  return text;
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: pdfColors.line,
    borderRadius: 8,
    overflow: "hidden",
  },
  header: {
    backgroundColor: pdfColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: pdfColors.line,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  headerText: {
    fontSize: 9.4,
    fontWeight: "bold",
    color: pdfColors.accentText,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  body: {
    paddingHorizontal: 9,
    paddingVertical: 7,
    gap: 4,
  },
  row: {
    flexDirection: "row",
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#eef2f7",
    paddingBottom: 3,
  },
  rowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  label: {
    width: 122,
    fontSize: 6.9,
    color: pdfColors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  value: {
    flex: 1,
    fontSize: 8,
    color: pdfColors.ink,
    lineHeight: 1.22,
    flexShrink: 1,
  },
});

const rows = [
  { label: "Clinico", valueKey: "clinico" },
  { label: "Audiometria", valueKey: "audiometria" },
  { label: "Psicotecnico", valueKey: "psicotecnico" },
  { label: "RX torax frente", valueKey: "rx-torax" },
  { label: "Electrocardiograma", valueKey: "electrocardiograma-result" },
  { label: "Laboratorio basico ley", valueKey: "laboratorio" },
  { label: "Electroencefalograma", valueKey: "electroencefalograma" },
] as const;

const ExamResultsPdf: React.FC<ExamResultsPdfProps> = ({ examResults }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Resultados del examen</Text>
      </View>
      <View style={styles.body}>
        {rows.map((row, index) => (
          <View
            key={row.valueKey}
            style={
              index === rows.length - 1
                ? [styles.row, styles.rowLast]
                : styles.row
            }
          >
            <Text style={styles.label}>{row.label}</Text>
            <Text style={styles.value}>
              {normalizeResultValue(examResults?.[row.valueKey])}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default ExamResultsPdf;
