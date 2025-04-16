import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { ExamResults } from "@/common/helpers/examsResults.maps";

interface ExamItem {
  id: string;
  label: string;
  defaultValue?: string;
}

interface PhysicalEvaluationData {
  [key: string]: {
    selected: string;
    observaciones: string;
  };
}

interface PhysicalEvaluationPdfProps {
  examenFisico: PhysicalEvaluationData;
  section?: number;
  examResults: ExamResults;
}

const section1: ExamItem[] = [
  { id: "piel", label: "Piel y faneras", defaultValue: "" },
  { id: "ojos", label: "Ojos", defaultValue: "" },
  { id: "oidos", label: "Oídos", defaultValue: "" },
  { id: "nariz", label: "Nariz", defaultValue: "" },
];

const section2: ExamItem[] = [
  { id: "boca", label: "Boca", defaultValue: "" },
  { id: "faringe", label: "Faringe", defaultValue: "" },
  { id: "cuello", label: "Cuello", defaultValue: "" },
  {
    id: "respiratorio",
    label: "Aparato Respiratorio",
    defaultValue: "Sin observaciones",
  },
  { id: "cardiovascular", label: "Aparato Cardiovascular", defaultValue: "" },
  { id: "digestivo", label: "Aparato Digestivo", defaultValue: "" },
  { id: "genitourinario", label: "Aparato Genitourinario", defaultValue: "" },
  { id: "locomotor", label: "Aparato Locomotor", defaultValue: "" },
  { id: "columna", label: "Columna", defaultValue: "" },
  { id: "miembros-sup", label: "Miembros Superiores", defaultValue: "" },
  { id: "miembros-inf", label: "Miembros Inferiores", defaultValue: "" },
  { id: "varices", label: "Várices", defaultValue: "" },
  { id: "sistema-nervioso", label: "Sistema Nervioso", defaultValue: "" },
  { id: "hernias", label: "Hernias", defaultValue: "" },
];

const styles = StyleSheet.create({
  container: {
    padding: 8,
    marginBottom: 8,
  },
  sectionContainer: {
    marginBottom: 8,
  },
  examRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  label: {
    width: 120,
    fontSize: 10,
    marginTop: 10,
  },
  siNoContainer: {
    flexDirection: "row",
    marginRight: 8,
  },
  singleOption: {
    flexDirection: "column",
    alignItems: "center",
    marginRight: 4,
  },
  optionLabel: {
    fontSize: 8,
    marginBottom: 2,
  },
  box: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  cross: {
    fontSize: 12,
    fontWeight: "bold",
  },
  observationContainer: {
    flex: 1,
    flexDirection: "column",
  },
  observationLabel: {
    fontSize: 8,
    marginBottom: 2,
  },
  observationBox: {
    borderWidth: 1,
    borderColor: "#000",
    paddingHorizontal: 4,
    paddingVertical: 2,
    flex: 1,
    height: 20,
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  observationText: {
    fontSize: 12,
  },
  informeText: {
    fontSize: 11,
    textAlign: "center",
    marginBottom: 5,
  },
});

const PhysicalEvaluationPdf: React.FC<PhysicalEvaluationPdfProps> = ({
  examenFisico,
  section,
  examResults,
}) => {
  let selectedSections: ExamItem[][] = [];
  if (section === 1) {
    selectedSections = [section1];
  } else if (section === 2) {
    selectedSections = [section2];
  } else {
    selectedSections = [section1, section2];
  }

  return (
    <View style={styles.container}>
      {selectedSections.map((items, index) => (
        <View key={index} style={styles.sectionContainer}>
          {items.map((item) => {
            const current = examenFisico[item.id] || {
              selected: "",
              observaciones: item.defaultValue,
            };

            return (
              <View key={item.id} style={styles.examRow}>
                <Text style={styles.label}>{item.label}</Text>
                <View style={styles.siNoContainer}>
                  <View style={styles.singleOption}>
                    <Text style={styles.optionLabel}>Sí</Text>
                    <View style={styles.box}>
                      {current.selected.toLowerCase() === "si" && (
                        <Text style={styles.cross}>X</Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.singleOption}>
                    <Text style={styles.optionLabel}>No</Text>
                    <View style={styles.box}>
                      {current.selected.toLowerCase() === "no" && (
                        <Text style={styles.cross}>X</Text>
                      )}
                    </View>
                  </View>
                </View>
                <View style={styles.observationContainer}>
                  <Text style={styles.observationLabel}>Observaciones</Text>
                  <View>
                    {current.observaciones ? (
                      <Text style={styles.observationText}>
                        {current.observaciones || "Sin observaciones"}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      ))}
      <Text style={styles.informeText}>
        INFORME: {examResults["clinico"] || "Resultado no disponible"}
      </Text>
    </View>
  );
};

export default PhysicalEvaluationPdf;
