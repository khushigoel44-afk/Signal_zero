import React, { useEffect, useRef } from "react";
import { Animated, Text, View, StyleSheet } from "react-native";
import colors from "../constants/colors";

export default function SignalIndicator({ online }) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.15, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true })
      ])
    ).start();
  }, [pulse]);

  return (
    <View style={styles.row}>
      <Animated.View
        style={[
          styles.dot,
          { backgroundColor: online ? colors.success : colors.warning, transform: [{ scale: pulse }] }
        ]}
      />
      <Text style={styles.text}>{online ? "Online" : "Offline"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  text: { color: colors.text, fontWeight: "700" }
});
