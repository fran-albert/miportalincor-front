import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { ConclusionOptions } from "@/store/Pre-Occupational/preOccupationalSlice";

interface ConclusionPdfProps {
  conclusion: string;
  conclusionOptions?: ConclusionOptions;
}

const ConclusionPdf: React.FC<ConclusionPdfProps> = ({
  conclusion,
  conclusionOptions,
}) => {
  const options = [
    {
      value: "apto-001",
      label: "Apto para desempeñar el cargo sin patología aparente",
    },
    {
      value: "apto-002",
      label:
        "Apto para desempeñar el cargo con patología que no limite lo laboral",
    },
    { value: "apto-003", label: "Apto con restricciones" },
    { value: "no-apto", label: "No apto" },
    { value: "aplazado", label: "Aplazado" },
  ];

  const selectedOptions = options.filter(
    (option) =>
      conclusionOptions &&
      conclusionOptions[option.value as keyof typeof conclusionOptions]
  );

  return (
    <View style={styles.container}>
      {/* Encabezado */}
      <View style={styles.headerContainer}>
        <View style={styles.headerBox}>
          <Text style={styles.headerText}>Conclusión</Text>
        </View>
      </View>

      {/* Contenido de la conclusión */}
      <View style={styles.contentContainer}>
        {selectedOptions.length > 0 && (
          <Text style={styles.optionText}>
            {selectedOptions.map((option) => option.label).join(", ")}
          </Text>
        )}
        <Text style={styles.conclusionText}>{conclusion || "No definido"}</Text>
      </View>

      {/* Línea divisoria */}
      <View style={styles.hr} />

      {/* Texto legal */}
      <Text style={styles.footerText}>
        Ley Nacional 19.587, Dto. 1338/96, Ley Nacional 24.557 y Res. 37/10
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  headerBox: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  headerText: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  contentContainer: {
    marginTop: 4,
    marginBottom: 4,
  },
  optionText: {
    fontSize: 10,
    marginBottom: 2,
  },
  conclusionText: {
    fontSize: 10,
  },
  hr: {
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    marginVertical: 8,
  },
  footerText: {
    fontSize: 8,
    textAlign: "center",
  },
});

export default ConclusionPdf;
