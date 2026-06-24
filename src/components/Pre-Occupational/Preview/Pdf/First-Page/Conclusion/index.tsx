import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { pdfColors } from "../../shared";

interface ConclusionPdfProps {
  conclusion: string;
  recomendaciones: string;
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  panel: {
    borderWidth: 1,
    borderColor: pdfColors.line,
    borderRadius: 8,
    overflow: "hidden",
  },
  panelHeader: {
    backgroundColor: pdfColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: pdfColors.line,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  panelTitle: {
    fontSize: 9.4,
    fontWeight: "bold",
    color: pdfColors.accentText,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  panelBody: {
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  bodyText: {
    fontSize: 7.8,
    color: pdfColors.ink,
    lineHeight: 1.16,
  },
  legalText: {
    marginTop: 0,
    fontSize: 5.8,
    color: pdfColors.muted,
    textAlign: "center",
  },
});

const ConclusionPdf: React.FC<ConclusionPdfProps> = ({
  conclusion,
  recomendaciones,
}) => {
  return (
    <View style={styles.container} wrap={false}>
      <View style={styles.panel} wrap={false}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>Conclusion</Text>
        </View>
        <View style={styles.panelBody}>
          <Text style={styles.bodyText}>
            {conclusion || "Sin conclusion registrada."}
          </Text>
        </View>
      </View>

      {recomendaciones ? (
        <View style={styles.panel} wrap={false}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Recomendaciones</Text>
          </View>
          <View style={styles.panelBody}>
            <Text style={styles.bodyText}>{recomendaciones}</Text>
          </View>
        </View>
      ) : null}

      <Text style={styles.legalText}>
        Ley Nacional 19.587, Dto. 1338/96, Ley Nacional 24.557 y Res. 37/10
      </Text>
    </View>
  );
};

export default ConclusionPdf;
