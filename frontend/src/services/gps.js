import * as Location from "expo-location";

export const requestLocationPermission = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === "granted";
};

export const getCurrentPosition = async () => {
  const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
  return {
    lat: pos.coords.latitude,
    lng: pos.coords.longitude,
    speedKmh: Math.max(0, (pos.coords.speed || 0) * 3.6),
    timestamp: new Date(pos.timestamp).toISOString()
  };
};

export const watchPosition = async (callback) =>
  Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.Balanced,
      distanceInterval: 5,
      timeInterval: 3000
    },
    (pos) => {
      callback({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        speedKmh: Math.max(0, (pos.coords.speed || 0) * 3.6),
        timestamp: new Date(pos.timestamp).toISOString()
      });
    }
  );
