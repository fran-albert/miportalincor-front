import React from "react";
import { View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Props {
  pageNumber: number;
  doctorName: string;
  doctorLicense: string;
  signatureUrl: string;
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingTop: 8,
    marginTop: 16,
    fontSize: 8,
    color: "#000000",
  },
  leftColumn: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  signature: {
    height: 40,
    objectFit: "contain",
    marginBottom: 4,
  },
  doctorName: {
    fontWeight: "bold",
  },
  centerColumn: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },
  rightColumn: {
    textAlign: "right",
  },
});

const PdfFooter: React.FC<Props> = ({
  pageNumber,
  doctorName,
  doctorLicense,
  signatureUrl,
}) => {
  const currentDate = format(new Date(), "dd/MM/yyyy", { locale: es });

  return (
    <View style={styles.container} wrap={false}>
      <View style={styles.leftColumn}>
        <Image src={signatureUrl} style={styles.signature} />
        <Text style={styles.doctorName}>{doctorName}</Text>
        <Text>M.P. {doctorLicense}</Text>
      </View>
      <View style={styles.centerColumn}>
        <Text>Fecha {currentDate}</Text>
      </View>
      <View style={styles.rightColumn}>
        <Text>Página {pageNumber}</Text>
      </View>
    </View>
  );
};

export default PdfFooter;
