import React, { useEffect, useState } from "react";
import { SafeAreaView, Text, View, StyleSheet, Pressable } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import colors from "../constants/colors";
import { getQueue, clearQueue, getLastSync, setLastSync } from "../services/storage";
import { syncLogs } from "../services/api";

const DEVICE_ID = "expo-device-001";

export default function SyncScreen() {
  const [online, setOnline] = useState(true);
  const [queued, setQueued] = useState(0);
  const [lastSync, setLastSyncState] = useState("Never");
  const [status, setStatus] = useState("Idle");

  const refreshQueue = async () => {
    const q = await getQueue();
    setQueued(q.length);
    const t = await getLastSync();
    if (t) setLastSyncState(new Date(t).toLocaleString());
  };

  useEffect(() => {
    const unsub = NetInfo.addEventListener((s) => setOnline(Boolean(s.isConnected)));
    refreshQueue();
    return unsub;
  }, []);

  const onSync = async () => {
    if (!online) {
      setStatus("Cannot sync while offline");
      return;
    }
    const logs = await getQueue();
    if (!logs.length) {
      setStatus("No queued data");
      return;
    }

    setStatus("Syncing...");
    try {
      await syncLogs({ deviceId: DEVICE_ID, logs });
      await clearQueue();
      const now = new Date().toISOString();
      await setLastSync(now);
      setLastSyncState(new Date(now).toLocaleString());
      setStatus("Sync successful");
      setQueued(0);
    } catch (e) {
      setStatus("Sync failed");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Offline Sync Center</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Connectivity</Text>
        <Text style={styles.value}>{online ? "Online" : "Offline"}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Queued movement logs</Text>
        <Text style={styles.value}>{queued}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Last Sync</Text>
        <Text style={styles.value}>{lastSync}</Text>
      </View>
      <Pressable style={styles.button} onPress={onSync}>
        <Text style={styles.buttonText}>Manual Sync</Text>
      </Pressable>
      <Text style={styles.status}>Status: {status}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  header: { color: colors.text, fontSize: 24, fontWeight: "800", marginBottom: 16 },
  card: { backgroundColor: colors.card, borderRadius: 12, padding: 14, marginBottom: 10 },
  label: { color: colors.subtext, fontSize: 13 },
  value: { color: colors.text, fontSize: 18, fontWeight: "700", marginTop: 5 },
  button: {
    marginTop: 12,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center"
  },
  buttonText: { color: "#00111a", fontWeight: "800", fontSize: 16 },
  status: { color: colors.text, marginTop: 14, fontWeight: "600" }
});
