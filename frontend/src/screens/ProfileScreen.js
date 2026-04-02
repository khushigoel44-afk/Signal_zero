import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import GlassCard from "../components/GlassCard";
import GlassButton from "../components/GlassButton";
import { useAuth } from "../context/AuthContext";

export default function ProfileScreen() {
  const { user, updateProfile, logout } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");

  useEffect(() => {
    setName(user?.name || "");
    setPhone(user?.phone || "");
  }, [user]);

  const save = async () => {
    try {
      await updateProfile({ name, phone });
      Alert.alert("Saved", "Your profile was updated.");
    } catch (error) {
      Alert.alert("Update failed", error.response?.data?.message || error.message);
    }
  };

  return (
    <LinearGradient colors={["#060915", "#101a31", "#121f39"]} style={styles.container}>
      <Text style={styles.header}>Account</Text>
      <GlassCard style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.email}>{user?.email || "-"}</Text>
        <Text style={styles.label}>Name</Text>
        <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Full Name" placeholderTextColor="#9BA7C7" />
        <Text style={styles.label}>Phone</Text>
        <TextInput value={phone} onChangeText={setPhone} style={styles.input} placeholder="Phone Number" placeholderTextColor="#9BA7C7" />
      </GlassCard>
      <GlassButton title="Save Changes" onPress={save} style={styles.btn} />
      <GlassButton title="Logout" onPress={logout} style={styles.btn} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { color: "#f1f5ff", fontSize: 24, fontWeight: "800", marginBottom: 14 },
  card: { marginBottom: 12 },
  label: { color: "#b7c6e8", marginBottom: 5, fontSize: 12, fontWeight: "700" },
  email: { color: "#f2f6ff", marginBottom: 11, fontSize: 15, fontWeight: "700" },
  input: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    color: "#fff",
    padding: 11,
    marginBottom: 12
  },
  btn: { marginBottom: 10 }
});
