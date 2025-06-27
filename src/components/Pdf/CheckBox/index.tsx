import { Svg, Rect, Path, StyleSheet } from "@react-pdf/renderer";

interface CheckboxPdfProps {
  checked: boolean;
}

const styles = StyleSheet.create({
  box: {
    position: "relative",
    width: 12,
    height: 12,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 4,
  },
});

export default function CheckboxPdf({ checked }: CheckboxPdfProps) {
  return (
    <Svg width={12} height={12} style={styles.box}>
      <Rect
        x={0}
        y={0}
        width={12}
        height={12}
        rx={2}
        stroke="#000"
        strokeWidth={1}
        fill="none"
      />
      {checked && <Path d="M3 6 L5 8 L9 2" stroke="#000" strokeWidth={1.2} />}
    </Svg>
  );
}
