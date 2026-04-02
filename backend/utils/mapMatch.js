const haversine = require("./haversine");

const mapMatch = (userLat, userLng, waypoints = []) => {
  if (!waypoints.length) {
    return { nearestIndex: -1, distanceKm: 0, segment: 0 };
  }

  let nearestIndex = 0;
  let minDistance = Number.MAX_SAFE_INTEGER;

  waypoints.forEach((point, index) => {
    const dist = haversine(userLat, userLng, point.lat, point.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearestIndex = index;
    }
  });

  const segment = Math.min(nearestIndex, Math.max(0, waypoints.length - 2));
  return { nearestIndex, distanceKm: minDistance, segment };
};

module.exports = mapMatch;
