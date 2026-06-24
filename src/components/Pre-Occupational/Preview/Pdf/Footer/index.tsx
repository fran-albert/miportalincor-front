import React from "react";
import { View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { pdfColors } from "../shared";
import {
  LaborReportSignaturePresentationMode,
  LaborReportSignerDisplay,
} from "@/types/Labor-Report-Branding-Config/LaborReportBrandingConfig";
import {
  getInstitutionalSignerForSection,
  resolveStampTextLines,
} from "../../signature-policy";

interface Props {
  pageNumber: number;
  useCustom?: boolean;
  fixed?: boolean;
  containerStyle?: React.ComponentProps<typeof View>["style"];
  presentationMode?: LaborReportSignaturePresentationMode;
  institutionalSigner?: LaborReportSignerDisplay;
  doctorName?: string;
  doctorLicense?: string;
  doctorSpeciality?: string;
  doctorStampText?: string;
  signatureUrl?: string;
  sealUrl?: string;
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: pdfColors.line,
    paddingTop: 5,
    marginTop: 4,
    position: "relative",
  },
  doctorBlock: {
    flex: 1.8,
    minHeight: 46,
    paddingRight: 24,
  },
  imagesBlock: {
    position: "relative",
    height: 32,
    marginBottom: 0.5,
  },
  signature: {
    width: 100,
    height: 30,
    objectFit: "contain",
  },
  seal: {
    position: "absolute",
    left: 58,
    bottom: -1,
    width: 40,
    height: 40,
    objectFit: "contain",
    opacity: 0.88,
  },
  stampPrimaryLine: {
    fontSize: 8.2,
    fontWeight: 500,
    lineHeight: 1.15,
    color: pdfColors.ink,
  },
  stampSecondaryLine: {
    fontSize: 6.8,
    lineHeight: 1.15,
    color: pdfColors.muted,
    marginTop: 0.25,
  },
  stampSpacer: {
    height: 8,
  },
  pageNumberBlock: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 18,
    alignItems: "flex-end",
  },
  metaValue: {
    fontSize: 8.6,
    fontWeight: "bold",
    color: pdfColors.ink,
  },
});

const FooterPdfConditional: React.FC<Props> = ({
  pageNumber,
  useCustom = false,
  fixed = false,
  containerStyle,
  presentationMode = "signature_and_text",
  institutionalSigner,
  doctorName,
  doctorLicense,
  doctorSpeciality,
  doctorStampText,
  signatureUrl,
  sealUrl,
}) => {
  const defaultSigner =
    institutionalSigner ?? getInstitutionalSignerForSection("cover");
  const name = useCustom && doctorName ? doctorName : defaultSigner.name;
  const licence =
    useCustom && doctorLicense ? doctorLicense : defaultSigner.license;
  const speciality =
    useCustom && doctorSpeciality
      ? doctorSpeciality
      : defaultSigner.specialty;
  const resolvedStampText = useCustom ? doctorStampText : defaultSigner.stampText;
  const sigUrl = useCustom ? signatureUrl : defaultSigner.signatureUrl;
  const resolvedSealUrl = useCustom ? sealUrl : defaultSigner.sealUrl;
  const stampLines = resolveStampTextLines({
    stampText: resolvedStampText,
    name,
    specialty: speciality,
    license: licence,
  });
  const shouldShowSignature =
    presentationMode !== "text_only" && Boolean(sigUrl);
  const shouldShowSeal =
    presentationMode === "signature_seal_and_text" && Boolean(resolvedSealUrl);
  const resolvedContainerStyle = (
    containerStyle ? [styles.container, containerStyle] : styles.container
  ) as React.ComponentProps<typeof View>["style"];

  return (
    <View style={resolvedContainerStyle} wrap={false} fixed={fixed}>
      <View style={styles.doctorBlock}>
        {shouldShowSignature ? (
          <View style={styles.imagesBlock}>
            <Image src={sigUrl} style={styles.signature} />
            {shouldShowSeal ? (
              <Image src={resolvedSealUrl!} style={styles.seal} />
            ) : null}
          </View>
        ) : (
          <View style={styles.stampSpacer} />
        )}
        {stampLines.map((line, index) => (
          <Text
            key={`${line}-${index}`}
            style={index === 0 ? styles.stampPrimaryLine : styles.stampSecondaryLine}
          >
            {line}
          </Text>
        ))}
      </View>
      <View style={styles.pageNumberBlock}>
        <Text style={styles.metaValue}>{pageNumber}</Text>
      </View>
    </View>
  );
};

export default FooterPdfConditional;
