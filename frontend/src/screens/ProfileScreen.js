import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import GlassCard from "../components/GlassCard";
import GlassButton from "../components/GlassButton";
import { useAuth } from "../context/AuthContext";
import colors from "../constants/colors";

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
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <GlassCard style={styles.card}>
            <Text style={styles.title}>Account</Text>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.email}>{user?.email || "-"}</Text>
            <Text style={styles.label}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              style={styles.input}
              placeholder="Full name"
              placeholderTextColor={colors.subtext}
            />
            <Text style={styles.label}>Phone</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              style={styles.input}
              placeholder="Phone number"
              placeholderTextColor={colors.subtext}
              keyboardType="phone-pad"
            />
            <GlassButton title="Save Changes" onPress={save} style={styles.btn} />
            <GlassButton title="Logout" onPress={logout} style={styles.btnLast} />
          </GlassCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 28 },
  card: { marginTop: 8 },
  title: { color: colors.text, fontSize: 26, fontWeight: "800", marginBottom: 18 },
  label: { color: colors.subtext, marginBottom: 5, fontSize: 12, fontWeight: "700" },
  email: { color: colors.text, marginBottom: 11, fontSize: 15, fontWeight: "700" },
  input: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    color: colors.text,
    padding: 12,
    marginBottom: 12
  },
  btn: { marginTop: 4, marginBottom: 10 },
  btnLast: { marginBottom: 0 }
});
