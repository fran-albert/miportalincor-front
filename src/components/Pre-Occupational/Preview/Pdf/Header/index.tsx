import React from "react";
import { Text, View, StyleSheet, Image } from "@react-pdf/renderer";

interface HeaderPreviewPdfProps {
  evaluationType: string;
  examType: string;
}

const styles = StyleSheet.create({
  headerBox: {
    borderWidth: 1,
    borderColor: "#000",
    padding: 4,
    marginBottom: 8,
  },
  headerInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 70,
  },
  headerLeft: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    width: 1,
    backgroundColor: "#333",
    height: "100%",
  },
  headerRight: {
    flex: 1,
    paddingRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: "bold",
  },
  headerSubtitle: {
    fontSize: 10,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
  },
  gridTwoColumns: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  gridColumn: {
    flex: 1,
    paddingRight: 4,
  },
  gridColumnRight: {
    flex: 1,
    paddingLeft: 4,
  },
  gridThreeColumns: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  columnTwoThirds: {
    flex: 2,
    paddingRight: 4,
  },
  columnOneThird: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 10,
    marginBottom: 2,
  },
});

const HeaderPreviewPdf: React.FC<HeaderPreviewPdfProps> = ({
  evaluationType,
  examType,
}) => {
  return (
    <View>
      {/* Encabezado en recuadro */}
      <View style={styles.headerBox}>
        <View style={styles.headerInner}>
          {/* Izquierda: Logo */}
          <View style={styles.headerLeft}>
            <Image
              style={{ width: 70, height: 40 }}
              src="https://res.cloudinary.com/dfoqki8kt/image/upload/v1743117056/dpwo5yinodpy9ibpjtum.png"
            />
          </View>
          {/* Línea divisoria */}
          <View style={styles.divider} />
          {/* Derecha: Texto */}
          <View style={styles.headerRight}>
            <Text style={styles.headerTitle}>{examType}</Text>
            <Text style={styles.headerSubtitle}>{evaluationType}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default HeaderPreviewPdf;
