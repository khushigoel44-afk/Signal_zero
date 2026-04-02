import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, TextInput, Alert } from "react-native";
import MapView, { Circle, Marker, Polyline } from "react-native-maps";
import NetInfo from "@react-native-community/netinfo";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import GlassCard from "../components/GlassCard";
import GlassButton from "../components/GlassButton";
import { mapMatch } from "../services/mapMatching";
import OFFLINE_ROUTES from "../constants/routes";
import { addSearchHistory, clearQueue, enqueueMovement, getQueue, setLastSync } from "../services/storage";
import { getCurrentPosition, requestLocationPermission, watchPosition } from "../services/gps";
import { getOfflineRoute, getOnlineRoute } from "../services/routing";
import { postTrack, syncLogs } from "../services/api";

const DEVICE_ID = "expo-device-001";

export default function HomeScreen() {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [online, setOnline] = useState(true);
  const [routeShape, setRouteShape] = useState([]);
  const [position, setPosition] = useState({ lat: 28.7041, lng: 77.1025, speedKmh: 0, timestamp: new Date().toISOString() });

  useEffect(() => {
    const unsub = NetInfo.addEventListener((s) => setOnline(Boolean(s.isConnected)));
    let watcher;

    const init = async () => {
      try {
        const ok = await requestLocationPermission();
        if (ok) {
          const pos = await getCurrentPosition();
          setPosition(pos);
        }
      } catch (error) {
        // Keep default position.
      }
      watcher = await watchPosition(async (loc) => {
        setPosition(loc);
        const payload = { deviceId: DEVICE_ID, lat: loc.lat, lng: loc.lng, speed: loc.speedKmh, timestamp: loc.timestamp };
        if (!online) return enqueueMovement(payload);
        try {
          await postTrack(payload);
        } catch (error) {
          await enqueueMovement(payload);
        }
      });
    };
    init();

    return () => {
      unsub();
      if (watcher) watcher.remove();
    };
  }, [online]);

  useEffect(() => {
    const syncOffline = async () => {
      if (!online) return;
      const queue = await getQueue();
      if (!queue.length) return;
      await syncLogs({ deviceId: DEVICE_ID, logs: queue });
      await clearQueue();
      await setLastSync(new Date().toISOString());
    };
    syncOffline().catch(() => {});
  }, [online]);

  const fallbackRoute = OFFLINE_ROUTES[0];
  const match = useMemo(
    () => mapMatch(position.lat, position.lng, fallbackRoute.waypoints),
    [position.lat, position.lng, fallbackRoute.waypoints]
  );

  const planRoute = async () => {
    if (!source.trim() || !destination.trim()) {
      Alert.alert("Missing fields", "Please enter source and destination");
      return;
    }
    try {
      let routeResult;
      if (online) {
        routeResult = await getOnlineRoute(source, destination);
      } else {
        routeResult = getOfflineRoute(source, destination, fallbackRoute);
      }
      setRouteShape(routeResult.polyline);
      await addSearchHistory({ source, destination, mode: online ? "online" : "offline" });
    } catch (error) {
      Alert.alert("Route planning failed", error.message);
    }
  };

  const nearest = fallbackRoute.waypoints[match.nearestIndex];
  const next = fallbackRoute.waypoints[match.nearestIndex + 1] || nearest;

  return (
    <LinearGradient colors={["#060915", "#101a31", "#121f39"]} style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{ latitude: position.lat, longitude: position.lng, latitudeDelta: 0.07, longitudeDelta: 0.07 }}
      >
        {routeShape.length ? (
          <Polyline coordinates={routeShape.map((p) => ({ latitude: p.lat, longitude: p.lng }))} strokeWidth={4} strokeColor="#72a8ff" />
        ) : null}
        <Circle center={{ latitude: position.lat, longitude: position.lng }} radius={28} fillColor="rgba(68,217,230,0.35)" />
        <Marker coordinate={{ latitude: position.lat, longitude: position.lng }} title="Current Position" pinColor="#3FA9F5" />
        {nearest ? <Marker coordinate={{ latitude: nearest.lat, longitude: nearest.lng }} title={`Matched ${nearest.name}`} pinColor="#ffb703" /> : null}
        {next ? <Marker coordinate={{ latitude: next.lat, longitude: next.lng }} title={`Next ${next.name}`} pinColor="#3ddc97" /> : null}
      </MapView>

      <GlassCard style={styles.panel}>
        <View style={styles.modeRow}>
          <Text style={styles.title}>Smart Route Tracking</Text>
          <View style={styles.modeBadge}>
            <Ionicons name={online ? "cloud-done" : "cloud-offline"} color="#E9F0FF" size={14} />
            <Text style={styles.modeText}>{online ? "Online Mode" : "Offline Mode"}</Text>
          </View>
        </View>
        <TextInput placeholder="Source" placeholderTextColor="#9BA7C7" value={source} onChangeText={setSource} style={styles.input} />
        <TextInput
          placeholder="Destination"
          placeholderTextColor="#9BA7C7"
          value={destination}
          onChangeText={setDestination}
          style={styles.input}
        />
        <GlassButton title="Track Route" onPress={planRoute} />
      </GlassCard>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  panel: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 22
  },
  modeRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  modeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10
  },
  modeText: { color: "#e7efff", fontSize: 12, fontWeight: "700" },
  title: { color: "#f1f5ff", fontSize: 17, fontWeight: "800" },
  input: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 11,
    color: "#fff",
    padding: 11,
    marginBottom: 8
  }
});
