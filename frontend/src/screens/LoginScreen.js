import React, { useState } from "react";
import { Text, TextInput, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import GlassCard from "../components/GlassCard";
import GlassButton from "../components/GlassButton";
import { useAuth } from "../context/AuthContext";
import colors from "../constants/colors";

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    try {
      setLoading(true);
      await login(email.trim(), password);
    } catch (error) {
      Alert.alert("Login failed", error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#060915", "#101a31", "#121f39"]} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.inner}>
        <GlassCard style={styles.card}>
          <Text style={styles.title}>Welcome Back</Text>
          <TextInput
            placeholder="Email"
            placeholderTextColor={colors.subtext}
            value={email}
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={setEmail}
            style={styles.input}
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor={colors.subtext}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />
          <GlassButton title={loading ? "Signing in..." : "Login"} onPress={onLogin} />
          <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
            <Text style={styles.link}>New user? Create account</Text>
          </TouchableOpacity>
        </GlassCard>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 18 },
  inner: { flex: 1, justifyContent: "center" },
  card: { marginTop: 30 },
  title: { color: colors.text, fontSize: 26, fontWeight: "800", marginBottom: 18 },
  input: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    color: colors.text,
    padding: 12,
    marginBottom: 12
  },
  link: { color: "#9cc3ff", textAlign: "center", marginTop: 14, fontWeight: "600" }
});
