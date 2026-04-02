import React, { useRef } from "react";
import { Animated, Pressable, Text, StyleSheet } from "react-native";

export default function GlassButton({ title, onPress, style }) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (value) =>
    Animated.timing(scale, { toValue: value, duration: 120, useNativeDriver: true }).start();

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => animateTo(0.97)}
        onPressOut={() => animateTo(1)}
        style={styles.btn}
      >
        <Text style={styles.text}>{title}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "rgba(68,217,230,0.25)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)"
  },
  text: { color: "#f6f8ff", fontWeight: "700", fontSize: 16 }
});
