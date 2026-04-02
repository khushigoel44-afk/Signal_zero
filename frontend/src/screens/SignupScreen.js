import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import GlassCard from "../components/GlassCard";
import GlassButton from "../components/GlassButton";
import { useAuth } from "../context/AuthContext";

export default function SignupScreen({ navigation }) {
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSignup = async () => {
    try {
      setLoading(true);
      await signup(name.trim(), email.trim(), password);
    } catch (error) {
      Alert.alert("Sign-up failed", error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#060915", "#101a31", "#121f39"]} style={styles.container}>
      <GlassCard style={styles.card}>
        <Text style={styles.title}>Create Account</Text>
        <TextInput placeholder="Full name" placeholderTextColor="#9BA7C7" value={name} onChangeText={setName} style={styles.input} />
        <TextInput
          placeholder="Email"
          placeholderTextColor="#9BA7C7"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
        <TextInput
          placeholder="Password (min 8 chars)"
          placeholderTextColor="#9BA7C7"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />
        <GlassButton title={loading ? "Creating..." : "Sign Up"} onPress={onSignup} />
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.link}>Already have an account? Login</Text>
        </TouchableOpacity>
      </GlassCard>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 18 },
  card: { marginTop: 30 },
  title: { color: "#F1F5FF", fontSize: 26, fontWeight: "800", marginBottom: 18 },
  input: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    color: "#fff",
    padding: 12,
    marginBottom: 12
  },
  link: { color: "#9cc3ff", textAlign: "center", marginTop: 14, fontWeight: "600" }
});
