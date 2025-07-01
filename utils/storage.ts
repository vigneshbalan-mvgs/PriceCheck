import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "tracked_items";

export type TrackedItem = {
  url: string;
  className: string;
  lastText: string;
  timestamp: number;
};

export async function saveItem(item: TrackedItem) {
  const items = await getItems();
  items.push(item);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export async function getItems(): Promise<TrackedItem[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function removeItem(index: number) {
  const items = await getItems();
  items.splice(index, 1);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export async function updateItem(index: number, newItem: TrackedItem) {
  const items = await getItems();
  items[index] = newItem;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}
