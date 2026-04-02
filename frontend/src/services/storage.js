import AsyncStorage from "@react-native-async-storage/async-storage";

const ROUTES_KEY = "ogtps_routes_cache";
const QUEUE_KEY = "ogtps_movement_queue";
const LAST_SYNC_KEY = "ogtps_last_sync";
const HISTORY_KEY = "ogtps_search_history";

export const saveRoutes = async (routes) => AsyncStorage.setItem(ROUTES_KEY, JSON.stringify(routes));
export const getRoutes = async () => {
  const raw = await AsyncStorage.getItem(ROUTES_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const enqueueMovement = async (payload) => {
  const current = await getQueue();
  current.push(payload);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(current));
};

export const getQueue = async () => {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  return raw ? JSON.parse(raw) : [];
};

export const clearQueue = async () => AsyncStorage.removeItem(QUEUE_KEY);

export const setLastSync = async (value) => AsyncStorage.setItem(LAST_SYNC_KEY, value);
export const getLastSync = async () => AsyncStorage.getItem(LAST_SYNC_KEY);

export const getSearchHistory = async () => {
  const raw = await AsyncStorage.getItem(HISTORY_KEY);
  return raw ? JSON.parse(raw) : [];
};

export const addSearchHistory = async (entry) => {
  const current = await getSearchHistory();
  const dedup = current.filter(
    (item) =>
      !(
        item.source.toLowerCase() === entry.source.toLowerCase() &&
        item.destination.toLowerCase() === entry.destination.toLowerCase()
      )
  );
  const next = [{ ...entry, timestamp: new Date().toISOString() }, ...dedup].slice(0, 25);
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  return next;
};

export const clearSearchHistory = async () => AsyncStorage.removeItem(HISTORY_KEY);
