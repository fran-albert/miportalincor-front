import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";

interface ConclusionPdfProps {
  conclusion: string;
  recomendaciones: string;
}

const ConclusionPdf: React.FC<ConclusionPdfProps> = ({
  conclusion,
  recomendaciones,
}) => {
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
        <Text style={styles.conclusionText}>{conclusion || "No definido"}</Text>
      </View>

      <View style={styles.headerContainer}>
        <View style={styles.headerBox}>
          <Text style={styles.headerText}>Recomendaciones</Text>
        </View>
      </View>

      {/* Contenido de la conclusión */}
      <View style={styles.contentContainer}>
        <Text style={styles.conclusionText}>{recomendaciones || "No definido"}</Text>
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
