import React, { useEffect, useState } from "react";
import { SafeAreaView, Text, View, StyleSheet, FlatList } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import colors from "../constants/colors";
import OFFLINE_ROUTES from "../constants/routes";
import { fetchRoutes } from "../services/api";
import { getRoutes as getCachedRoutes, saveRoutes } from "../services/storage";

const RouteCard = ({ route }) => (
  <LinearGradient colors={["#131b31", "#1e2a4a"]} style={styles.card}>
    <Text style={styles.cardTitle}>{route.name}</Text>
    <Text style={styles.cardSub}>Type: {route.type}</Text>
    <Text style={styles.cardSub}>Waypoints: {route.waypoints?.length || 0}</Text>
    <Text style={styles.cardSub}>Distance: {route.totalDistance || "N/A"} km</Text>
  </LinearGradient>
);

export default function RoutesScreen() {
  const [routes, setRoutes] = useState(OFFLINE_ROUTES);

  useEffect(() => {
    const load = async () => {
      const cached = await getCachedRoutes();
      if (cached?.length) setRoutes(cached);
      try {
        const remote = await fetchRoutes();
        if (remote?.length) {
          setRoutes(remote);
          await saveRoutes(remote);
        }
      } catch (e) {
        // Keep cached/offline routes on network failure.
      }
    };
    load();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Preloaded Routes</Text>
      <FlatList
        data={routes}
        keyExtractor={(item, idx) => item._id || item.id || `route-${idx}`}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => <RouteCard route={item} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  header: { color: colors.text, fontSize: 24, fontWeight: "800", marginBottom: 14 },
  card: { borderRadius: 16, padding: 16 },
  cardTitle: { color: colors.text, fontSize: 17, fontWeight: "700", marginBottom: 4 },
  cardSub: { color: colors.subtext, fontSize: 14, marginTop: 2 }
});
