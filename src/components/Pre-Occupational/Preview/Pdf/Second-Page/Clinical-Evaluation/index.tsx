import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";

interface ClinicalEvaluationPdfProps {
  talla?: string;
  peso?: string;
  imc?: string;
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  headerBox: {
    position: "relative",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  headerText: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  grid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  item: {
    flex: 1,
    paddingHorizontal: 8,
  },
  label: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 4,
  },
  value: {
    fontSize: 10,
  },
});

const ClinicalEvaluationPdf: React.FC<ClinicalEvaluationPdfProps> = ({
  talla,
  peso,
  imc,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerBox}>
          <Text style={styles.headerText}>Resultados del Examen</Text>
        </View>
      </View>

      <View style={styles.grid}>
        <View style={styles.item}>
          <Text style={styles.label}>Talla</Text>
          <Text style={styles.value}>{talla}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>Peso</Text>
          <Text style={styles.value}>{peso}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>IMC</Text>
          <Text style={styles.value}>{imc}</Text>
        </View>
      </View>
    </View>
  );
};

export default ClinicalEvaluationPdf;
