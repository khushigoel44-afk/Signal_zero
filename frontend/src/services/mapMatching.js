import { haversine } from "../utils/haversine";

export const mapMatch = (lat, lng, waypoints = []) => {
  if (!waypoints.length) return { nearestIndex: -1, distanceKm: 0, segment: 0 };

  let nearestIndex = 0;
  let distanceKm = Number.MAX_SAFE_INTEGER;

  waypoints.forEach((wp, i) => {
    const d = haversine(lat, lng, wp.lat, wp.lng);
    if (d < distanceKm) {
      distanceKm = d;
      nearestIndex = i;
    }
  });

  return {
    nearestIndex,
    distanceKm,
    segment: Math.min(nearestIndex, Math.max(0, waypoints.length - 2))
  };
};
