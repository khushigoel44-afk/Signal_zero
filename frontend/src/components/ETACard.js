import React from "react";
import { Text, View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import colors from "../constants/colors";

export default function ETACard({ etaMinutes, distanceKm }) {
  return (
    <LinearGradient colors={["#1c2542", "#263969"]} style={styles.card}>
      <Text style={styles.title}>ETA Projection</Text>
      <Text style={styles.value}>{Number.isFinite(etaMinutes) ? `${etaMinutes} min` : "--"}</Text>
      <Text style={styles.sub}>Distance to next stop: {distanceKm.toFixed(2)} km</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 18, padding: 16, marginBottom: 12 },
  title: { color: colors.subtext, fontSize: 13 },
  value: { color: colors.text, fontSize: 30, fontWeight: "800", marginVertical: 8 },
  sub: { color: colors.primary, fontSize: 14, fontWeight: "600" }
});
