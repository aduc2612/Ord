import { fetch } from "expo/fetch";
import { createClient, type SupportedStorage } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Fail fast on missing env vars
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl) throw new Error("Missing EXPO_PUBLIC_SUPABASE_URL");
if (!supabaseKey)
  throw new Error("Missing EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY");

// SecureStore has a 2KB (iOS) / 3KB (Android) limit per key.
// For values that exceed the limit, chunk them across multiple keys.
const CHUNK_PREFIX = "__sc_chunk_";

const ExpoSecureStoreAdapter: SupportedStorage = {
  getItem: async (key: string) => {
    const meta = await SecureStore.getItemAsync(key);
    if (!meta) return meta;

    // Check if this key holds chunked data
    if (meta.startsWith(CHUNK_PREFIX)) {
      const count = parseInt(meta.slice(CHUNK_PREFIX.length), 10);
      const chunks: string[] = [];
      for (let i = 0; i < count; i++) {
        const chunk = await SecureStore.getItemAsync(`${key}_${i}`);
        if (chunk === null) return null;
        chunks.push(chunk);
      }
      return chunks.join("");
    }

    return meta;
  },

  setItem: async (key: string, value: string) => {
    // Clean up any existing chunks for this key
    const existing = await SecureStore.getItemAsync(key);
    if (existing?.startsWith(CHUNK_PREFIX)) {
      const oldCount = parseInt(existing.slice(CHUNK_PREFIX.length), 10);
      for (let i = 0; i < oldCount; i++) {
        await SecureStore.deleteItemAsync(`${key}_${i}`);
      }
    }

    if (value.length <= 2048) {
      await SecureStore.setItemAsync(key, value);
      return;
    }

    // Chunk the value across multiple keys
    const chunks: string[] = [];
    for (let i = 0; i < value.length; i += 2048) {
      chunks.push(value.slice(i, i + 2048));
    }

    for (let i = 0; i < chunks.length; i++) {
      await SecureStore.setItemAsync(`${key}_${i}`, chunks[i]);
    }

    // Store a marker with the chunk count under the original key
    await SecureStore.setItemAsync(key, `${CHUNK_PREFIX}${chunks.length}`);
  },

  removeItem: async (key: string) => {
    const meta = await SecureStore.getItemAsync(key);
    if (meta?.startsWith(CHUNK_PREFIX)) {
      const count = parseInt(meta.slice(CHUNK_PREFIX.length), 10);
      for (let i = 0; i < count; i++) {
        await SecureStore.deleteItemAsync(`${key}_${i}`);
      }
    }
    await SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage:
      Platform.OS === "web"
        ? AsyncStorage
        : (ExpoSecureStoreAdapter as SupportedStorage),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    fetch: fetch as unknown as typeof globalThis.fetch,
  },
});
