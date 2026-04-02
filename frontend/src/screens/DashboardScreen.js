import React, { useEffect, useState } from "react";
import { SafeAreaView, Text, View, StyleSheet } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import colors from "../constants/colors";
import Speedometer from "../components/Speedometer";
import ETACard from "../components/ETACard";
import StatusBadge from "../components/StatusBadge";
import SignalIndicator from "../components/SignalIndicator";
import { predictETA } from "../services/api";

export default function DashboardScreen() {
  const [online, setOnline] = useState(true);
  const [speed, setSpeed] = useState(0);
  const [eta, setEta] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0);
  const [status, setStatus] = useState("STOPPED");

  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => setOnline(Boolean(state.isConnected)));
    const timer = setInterval(async () => {
      const simulatedSpeed = Math.max(0, Math.round(20 + Math.random() * 45 - 10));
      const simulatedDistance = Math.max(0.2, Number((2 + Math.random() * 12).toFixed(2)));
      setSpeed(simulatedSpeed);
      setDistanceKm(simulatedDistance);

      if (simulatedSpeed <= 2) setStatus("STOPPED");
      else if (simulatedSpeed < 12) setStatus("DELAYED");
      else setStatus("MOVING");

      try {
        const pred = await predictETA({
          speed: simulatedSpeed,
          distance: simulatedDistance,
          hour_of_day: new Date().getHours(),
          day_of_week: new Date().getDay(),
          historical_avg_speed: 34,
          segment_index: 2
        });
        setEta(pred.predicted_eta_minutes);
      } catch (e) {
        setEta(Math.round((simulatedDistance / Math.max(simulatedSpeed, 1)) * 60));
      }
    }, 5000);

    return () => {
      unsub();
      clearInterval(timer);
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Operations Dashboard</Text>
      <View style={styles.row}>
        <StatusBadge status={status} />
        <SignalIndicator online={online} />
      </View>
      <Speedometer speed={speed} />
      <ETACard etaMinutes={eta} distanceKm={distanceKm} />
      <View style={styles.panel}>
        <Text style={styles.panelText}>Speed: {Math.round(speed)} km/h</Text>
        <Text style={styles.panelText}>Distance to next stop: {distanceKm.toFixed(2)} km</Text>
        <Text style={styles.panelText}>ETA: {Math.round(eta)} minutes</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  header: { color: colors.text, fontSize: 24, fontWeight: "800", marginBottom: 14 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  panel: { backgroundColor: colors.card, borderRadius: 14, padding: 16 },
  panelText: { color: colors.text, marginBottom: 8, fontSize: 15, fontWeight: "600" }
});
