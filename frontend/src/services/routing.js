import { haversine } from "../utils/haversine";

const geocodePlace = async (query) => {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "OGTPS/1.0" }
  });
  if (!res.ok) throw new Error("Geocoding failed");
  const data = await res.json();
  if (!data.length) throw new Error("Location not found");
  return { lat: Number(data[0].lat), lng: Number(data[0].lon), label: data[0].display_name };
};

export const getOnlineRoute = async (sourceText, destinationText) => {
  const src = await geocodePlace(sourceText);
  const dst = await geocodePlace(destinationText);
  const osrm = `https://router.project-osrm.org/route/v1/driving/${src.lng},${src.lat};${dst.lng},${dst.lat}?overview=full&geometries=geojson`;
  const routeRes = await fetch(osrm);
  if (!routeRes.ok) throw new Error("Route API unavailable");
  const routeData = await routeRes.json();
  const coords = routeData?.routes?.[0]?.geometry?.coordinates || [];
  const polyline = coords.map(([lng, lat]) => ({ lat, lng }));
  return { source: src, destination: dst, polyline };
};

export const getOfflineRoute = (sourceText, destinationText, fallbackRoute) => {
  if (!fallbackRoute?.waypoints?.length) {
    return { source: null, destination: null, polyline: [] };
  }
  const source = fallbackRoute.waypoints[0];
  const destination = fallbackRoute.waypoints[fallbackRoute.waypoints.length - 1];
  const polyline = fallbackRoute.waypoints.map((p) => ({ lat: p.lat, lng: p.lng }));
  const approxDistance = haversine(source.lat, source.lng, destination.lat, destination.lng);
  return {
    source: { ...source, label: sourceText || source.name },
    destination: { ...destination, label: destinationText || destination.name },
    polyline,
    approxDistance
  };
};
