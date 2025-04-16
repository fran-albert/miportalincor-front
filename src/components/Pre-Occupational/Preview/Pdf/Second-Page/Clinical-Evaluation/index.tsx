import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";

interface ClinicalEvaluationPdfProps {
  talla: string;
  peso: string;
  imc: string;
  perimetroAbdominal: string;
  aspectoGeneral: string;
  tiempoLibre: string;
  frecuenciaCardiaca: string;
  frecuenciaRespiratoria: string;
  presionSistolica: string;
  presionDiastolica: string;
  examenFisico: any;
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
    marginBottom: 8,
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
  perimetroAbdominal,
  aspectoGeneral,
  tiempoLibre,
  frecuenciaCardiaca,
  frecuenciaRespiratoria,
  presionSistolica,
  presionDiastolica,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerBox}>
          <Text style={styles.headerText}>Resultados del Examen</Text>
        </View>
      </View>

      {/* Primera fila - 5 datos */}
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
        <View style={styles.item}>
          <Text style={styles.label}>Perímetro Abdominal</Text>
          <Text style={styles.value}>{perimetroAbdominal}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>Aspecto General</Text>
          <Text style={styles.value}>{aspectoGeneral}</Text>
        </View>
      </View>

      {/* Segunda fila - 5 datos */}
      <View style={styles.grid}>
        <View style={styles.item}>
          <Text style={styles.label}>Tiempo Libre</Text>
          <Text style={styles.value}>{tiempoLibre}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>Frec. Cardíaca</Text>
          <Text style={styles.value}>{frecuenciaCardiaca}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>Frec. Respiratoria</Text>
          <Text style={styles.value}>{frecuenciaRespiratoria}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>Presión Sistólica</Text>
          <Text style={styles.value}>{presionSistolica}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>Presión Diastólica</Text>
          <Text style={styles.value}>{presionDiastolica}</Text>
        </View>
      </View>
    </View>
  );
};

export default ClinicalEvaluationPdf;
