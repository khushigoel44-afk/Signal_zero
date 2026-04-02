import React from "react";
import { View, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";

export default function GlassCard({ children, style }) {
  return (
    <BlurView intensity={35} tint="dark" style={[styles.card, style]}>
      <View style={styles.inner}>{children}</View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)"
  },
  inner: {
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 14
  }
});
