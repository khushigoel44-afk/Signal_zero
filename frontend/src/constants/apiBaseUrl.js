/**
 * Backend base URL for development when neither EXPO_PUBLIC_API_BASE_URL nor
 * app.json `extra.apiBaseUrl` is set.
 *
 * For Expo Go on a physical device, use your computer's LAN IP (same Wi‑Fi as the phone).
 * Android emulator: set EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:5001 instead.
 */
export const DEV_MACHINE_LAN_API_BASE = "http://192.168.1.100:5001";
