import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import MapView, { Marker, Polyline, Circle } from "react-native-maps";
import NetInfo from "@react-native-community/netinfo";
import OFFLINE_ROUTES from "../constants/routes";
import colors from "../constants/colors";
import { fetchRoutes, postTrack, syncLogs } from "../services/api";
import {
  getRoutes as getStoredRoutes,
  saveRoutes,
  enqueueMovement,
  getQueue,
  clearQueue,
  setLastSync
} from "../services/storage";
import { requestLocationPermission, getCurrentPosition, watchPosition } from "../services/gps";
import { mapMatch } from "../services/mapMatching";

const DEVICE_ID = "expo-device-001";

export default function MapScreen() {
  const [online, setOnline] = useState(true);
  const [routes, setRoutes] = useState(OFFLINE_ROUTES);
  const [position, setPosition] = useState({ lat: OFFLINE_ROUTES[0].waypoints[0].lat, lng: OFFLINE_ROUTES[0].waypoints[0].lng, speedKmh: 0 });
  const [pulseRadius, setPulseRadius] = useState(25);
  const [activeRoute] = useState(OFFLINE_ROUTES[0]);

  useEffect(() => {
    const unsubNet = NetInfo.addEventListener((state) => setOnline(Boolean(state.isConnected)));

    const init = async () => {
      try {
        const ok = await requestLocationPermission();
        if (!ok) return;
        const current = await getCurrentPosition();
        setPosition(current);
      } catch (e) {
        // Keep app functional even if GPS init fails.
      }

      const cached = await getStoredRoutes();
      if (cached?.length) setRoutes(cached);

      try {
        const remote = await fetchRoutes();
        if (remote?.length) {
          setRoutes(remote);
          await saveRoutes(remote);
        }
      } catch (e) {
        // Offline fallback already applied.
      }
    };
    init();

    let watcher;
    watchPosition(async (loc) => {
      setPosition(loc);
      const payload = {
        deviceId: DEVICE_ID,
        lat: loc.lat,
        lng: loc.lng,
        speed: loc.speedKmh,
        timestamp: loc.timestamp
      };
      if (online) {
        try {
          await postTrack(payload);
        } catch (e) {
          await enqueueMovement(payload);
        }
      } else {
        await enqueueMovement(payload);
      }
    }).then((w) => {
      watcher = w;
    });

    return () => {
      unsubNet();
      if (watcher) watcher.remove();
    };
  }, []);

  useEffect(() => {
    const autoSync = async () => {
      if (!online) return;
      const queued = await getQueue();
      if (!queued.length) return;
      try {
        await syncLogs({ deviceId: DEVICE_ID, logs: queued });
        await clearQueue();
        await setLastSync(new Date().toISOString());
      } catch (e) {
        // Keep queue intact if sync fails.
      }
    };
    autoSync();
  }, [online]);

  useEffect(() => {
    let delta = 4;
    const timer = setInterval(() => {
      setPulseRadius((prev) => {
        if (prev > 42) delta = -4;
        if (prev < 22) delta = 4;
        return prev + delta;
      });
    }, 300);
    return () => clearInterval(timer);
  }, []);

  const waypoints = useMemo(() => activeRoute?.waypoints || routes[0]?.waypoints || [], [activeRoute, routes]);
  const match = mapMatch(position.lat, position.lng, waypoints);
  const nearest = waypoints[match.nearestIndex];
  const nextStop = waypoints[match.nearestIndex + 1] || waypoints[match.nearestIndex];

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: position.lat,
          longitude: position.lng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05
        }}
      >
        <Polyline
          coordinates={waypoints.map((w) => ({ latitude: w.lat, longitude: w.lng }))}
          strokeColor={colors.accent}
          strokeWidth={4}
        />
        <Circle
          center={{ latitude: position.lat, longitude: position.lng }}
          radius={pulseRadius}
          fillColor="rgba(68,217,230,0.35)"
        />
        <Marker coordinate={{ latitude: position.lat, longitude: position.lng }} title="Current Position" pinColor="#3FA9F5" />
        {nearest ? (
          <Marker coordinate={{ latitude: nearest.lat, longitude: nearest.lng }} title={`Matched: ${nearest.name}`} pinColor={colors.warning} />
        ) : null}
        {nextStop ? (
          <Marker coordinate={{ latitude: nextStop.lat, longitude: nextStop.lng }} title={`Next: ${nextStop.name}`} pinColor={colors.success} />
        ) : null}
      </MapView>
      <View style={styles.overlay}>
        <Text style={styles.title}>Live Route Tracking</Text>
        <Text style={styles.sub}>{online ? "Online mode" : "Offline mode"} | Segment {match.segment}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  map: { flex: 1 },
  overlay: {
    position: "absolute",
    top: 50,
    left: 16,
    right: 16,
    backgroundColor: "rgba(7,11,23,0.75)",
    borderRadius: 12,
    padding: 12
  },
  title: { color: colors.text, fontSize: 18, fontWeight: "700" },
  sub: { color: colors.subtext, marginTop: 4 }
});
