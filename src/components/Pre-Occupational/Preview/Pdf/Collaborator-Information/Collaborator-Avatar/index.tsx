import React from "react";
import { View, Image, Text, StyleSheet } from "@react-pdf/renderer";

interface CollaboratorAvatarPdfProps {
  src?: string | null;
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
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eee",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  fallbackText: {
    fontSize: 12,
    color: "#888",
  },
});

const CollaboratorAvatarPdf: React.FC<CollaboratorAvatarPdfProps> = ({
  src,
}) => {
  const hasValidImage = src && src.trim() !== "";
  return hasValidImage ? (
    <View style={styles.avatarContainer}>
      <Image style={styles.avatarImage} src={src!} />
    </View>
  ) : (
    <View style={styles.fallbackContainer}>
      <Text style={styles.fallbackText}>User</Text>
    </View>
  );
};

export default CollaboratorAvatarPdf;
