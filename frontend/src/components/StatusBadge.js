import React from "react";
import { Text, View, StyleSheet } from "react-native";
import colors from "../constants/colors";

const palette = {
  MOVING: colors.success,
  STOPPED: colors.warning,
  DELAYED: colors.danger
};

export default function StatusBadge({ status }) {
  const tone = palette[status] || colors.subtext;
  return (
    <View style={[styles.badge, { borderColor: tone }]}>
      <View style={[styles.dot, { backgroundColor: tone }]} />
      <Text style={styles.text}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 50,
    backgroundColor: "#0f1729"
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  text: { color: colors.text, fontWeight: "700" }
});
