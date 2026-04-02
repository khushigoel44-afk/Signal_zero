import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "ogtps_auth_token";

export const saveToken = async (token) => SecureStore.setItemAsync(TOKEN_KEY, token);
export const getToken = async () => SecureStore.getItemAsync(TOKEN_KEY);
export const clearToken = async () => SecureStore.deleteItemAsync(TOKEN_KEY);
