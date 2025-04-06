import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";

interface ExamResults {
  clinico?: string;
  psicotecnico?: string;
  "rx-torax"?: string;
  "electrocardiograma-result"?: string;
  laboratorio?: string;
  electroencefalograma?: string;
}

interface ExamResultsPdfProps {
  examResults: ExamResults;
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
  examContainer: {
    marginBottom: 8,
  },
  examTitle: {
    fontSize: 10,
    fontWeight: "bold",
  },
  examResult: {
    fontSize: 10,
    marginLeft: 16,
  },
});

const ExamResultsPdf: React.FC<ExamResultsPdfProps> = ({ examResults }) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerBox}>
          <Text style={styles.headerText}>Resultados del Examen</Text>
        </View>
      </View>

      <View>
        <View style={styles.examContainer}>
          <Text style={styles.examTitle}>CLÍNICO</Text>
          <Text style={styles.examResult}>
            {examResults?.clinico || "No definido"}
          </Text>
        </View>
        <View style={styles.examContainer}>
          <Text style={styles.examTitle}>AUDIOMETRÍA</Text>
          <Text style={styles.examResult}>
            {examResults?.psicotecnico || "No definido"}
          </Text>
        </View>
        <View style={styles.examContainer}>
          <Text style={styles.examTitle}>RX TÓRAX FRENTE</Text>
          <Text style={styles.examResult}>
            {examResults?.["rx-torax"] || "No definido"}
          </Text>
        </View>
        <View style={styles.examContainer}>
          <Text style={styles.examTitle}>ELECTROCARDIOGRAMA</Text>
          <Text style={styles.examResult}>
            {examResults?.["electrocardiograma-result"] || "No definido"}
          </Text>
        </View>
        <View style={styles.examContainer}>
          <Text style={styles.examTitle}>LABORATORIO BÁSICO LEY (RUTINA)</Text>
          <Text style={styles.examResult}>
            {examResults?.laboratorio || "No definido"}
          </Text>
        </View>
        <View style={styles.examContainer}>
          <Text style={styles.examTitle}>ELECTROENCEFALOGRAMA</Text>
          <Text style={styles.examResult}>
            {examResults?.electroencefalograma || "No definido"}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default ExamResultsPdf;
