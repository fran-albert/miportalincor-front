// components/FooterPdfConditional.tsx
import React from "react";
import { View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Props {
  pageNumber: number;
  useCustom?: boolean;
  doctorName?: string;
  doctorLicense?: string;
  doctorSpeciality?: string;
  signatureUrl?: string;
  sealUrl?: string;
}

const DEFAULT_DOCTOR = {
  name: "BONIFACIO Ma. CECILIA",
  license: "M.P. 96533 - M.L. 7299",
  signatureUrl:
    "https://res.cloudinary.com/dfoqki8kt/image/upload/v1743624646/aw6shqkcieys3flbrn0c.png",
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    paddingTop: 8,
    marginTop: 16,
    minHeight: 80,
    position: "relative",
  },
  leftBlock: {
    flex: 2,
    flexDirection: "column",
  },
  imagesBlock: {
    marginBottom: 4,
  },
  signature: {
    width: 120,
    height: 50,
    objectFit: "contain",
    marginBottom: 4,
  },
  seal: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 80,
    height: 80,
    objectFit: "contain",
  },
  name: {
    fontSize: 10,
    fontWeight: "bold",
  },
  speciality: {
    fontSize: 8,
    fontStyle: "italic",
    marginBottom: 2,
  },
  license: {
    fontSize: 8,
  },
  dateContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  pageContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },
});

const FooterPdfConditional: React.FC<Props> = ({
  pageNumber,
  useCustom = false,
  doctorName,
  doctorLicense,
  doctorSpeciality,
  signatureUrl,
}) => {
  const currentDate = format(new Date(), "dd/MM/yyyy", { locale: es });
  const name = useCustom && doctorName ? doctorName : DEFAULT_DOCTOR.name;
  const licence =
    useCustom && doctorLicense ? doctorLicense : DEFAULT_DOCTOR.license;
  const speciality = useCustom && doctorSpeciality;
  const sigUrl =
    useCustom && signatureUrl ? signatureUrl : DEFAULT_DOCTOR.signatureUrl;

  return (
    <View style={styles.container}>
      <View style={styles.leftBlock}>
        {/* Firma */}
        <View style={styles.imagesBlock}>
          <Image src={sigUrl} style={styles.signature} />
        </View>

        {/* Datos del doctor */}
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.speciality}>{speciality}</Text>
        <Text style={styles.license}>{licence}</Text>
      </View>

      {/* Fecha */}
      <View style={styles.dateContainer}>
        <Text>Fecha {currentDate}</Text>
      </View>

      {/* Página */}
      <View style={styles.pageContainer}>
        <Text>Página {pageNumber}</Text>
      </View>
    </View>
  );
};

export default FooterPdfConditional;
