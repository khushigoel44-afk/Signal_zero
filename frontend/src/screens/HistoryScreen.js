import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import GlassCard from "../components/GlassCard";
import GlassButton from "../components/GlassButton";
import { clearSearchHistory, getSearchHistory } from "../services/storage";

export default function HistoryScreen() {
  const [items, setItems] = useState([]);

  const load = async () => {
    const data = await getSearchHistory();
    setItems(data);
  };

  useEffect(() => {
    load();
  }, []);

  const clearAll = async () => {
    await clearSearchHistory();
    setItems([]);
  };

  return (
    <LinearGradient colors={["#060915", "#101a31", "#121f39"]} style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Recent Searches</Text>
      </View>
      <FlatList
        data={items}
        keyExtractor={(item, i) => `${item.source}-${item.destination}-${i}`}
        renderItem={({ item }) => (
          <TouchableOpacity activeOpacity={0.85}>
            <GlassCard style={styles.card}>
              <Text style={styles.title}>{item.source}</Text>
              <Text style={styles.subtitle}>to {item.destination}</Text>
              <Text style={styles.meta}>{item.mode?.toUpperCase()} | {new Date(item.timestamp).toLocaleString()}</Text>
            </GlassCard>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={<Text style={styles.empty}>No recent searches yet.</Text>}
        contentContainerStyle={{ padding: 16, paddingBottom: 36 }}
      />
      {!!items.length && <GlassButton title="Clear History" onPress={clearAll} style={styles.clearBtn} />}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { paddingHorizontal: 16, paddingTop: 16 },
  header: { color: "#f1f5ff", fontSize: 24, fontWeight: "800" },
  card: { marginBottom: 0 },
  title: { color: "#fff", fontSize: 16, fontWeight: "800" },
  subtitle: { color: "#c8d5f6", marginTop: 2 },
  meta: { color: "#9fb0d9", marginTop: 6, fontSize: 12 },
  empty: { color: "#a9b5d6", textAlign: "center", marginTop: 28 },
  clearBtn: { marginHorizontal: 16, marginBottom: 16 }
});
