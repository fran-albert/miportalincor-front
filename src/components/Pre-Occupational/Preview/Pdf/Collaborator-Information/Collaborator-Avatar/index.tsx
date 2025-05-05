import React from "react";
import { View, Image, StyleSheet } from "@react-pdf/renderer";
import { Buffer } from "buffer";

interface CollaboratorAvatarPdfProps {
  photoBuffer?: { type: "Buffer"; data: number[] };
  alt: string;
}

const styles = StyleSheet.create({
  avatarContainer: {
    width: 80,
    height: 80,
    borderWidth: 2,
    borderColor: "#187B80",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  fallbackContainer: {
    width: 80,
    height: 80,
    borderWidth: 2,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eee",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  fallbackText: {
    fontSize: 12,
    color: "#888",
  },
});

const CollaboratorAvatarPdf: React.FC<CollaboratorAvatarPdfProps> = ({
  photoBuffer,
}) => {
  if (
    !photoBuffer ||
    !photoBuffer.data ||
    !Array.isArray(photoBuffer.data) ||
    photoBuffer.data.length === 0
  ) {
    return null;
  }

  const nodeBuffer = Buffer.from(photoBuffer.data);

  const imageSource: { data: Buffer; format: "jpg" } = {
    data: nodeBuffer,
    format: "jpg",
  };

  return (
    <View style={styles.avatarContainer}>
      <Image style={styles.avatarImage} src={imageSource} />
    </View>
  );
};

export default CollaboratorAvatarPdf;
