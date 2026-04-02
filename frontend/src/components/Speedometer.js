import React from "react";
import { Text, View, StyleSheet } from "react-native";
import colors from "../constants/colors";

export default function Speedometer({ speed }) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.value}>{Math.round(speed)}</Text>
      <Text style={styles.unit}>km/h</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: "#0f1730",
    alignSelf: "center"
  },
  value: { color: colors.text, fontSize: 42, fontWeight: "800" },
  unit: { color: colors.subtext, fontSize: 16 }
});
