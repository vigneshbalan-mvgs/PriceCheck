import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { sendNotification } from "../utils/notification";
import { getItems, TrackedItem, updateItem } from "../utils/storage";

export type TrackedItemWithMeta = TrackedItem & {
    image?: string;
    title?: string;
    tagName?: string;
    id?: string;
    inactive?: boolean;
};

const PAGE_SIZE = 10;

export default function WatchlistScreen() {
    const [items, setItems] = useState<TrackedItemWithMeta[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(0);
    const router = useRouter();

    async function load() {
        setRefreshing(true);
        const all = await getItems();
        setItems(all.filter((item: TrackedItemWithMeta) => !item.inactive));
        setRefreshing(false);
        await sendNotification("Watchlist Refreshed", "Your watchlist has been refreshed.");
    }

    useEffect(() => {
        load();
    }, []);

    async function handleRemove(idx: number) {
        Alert.alert("Remove?", "Mark this tracked item as inactive?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Remove",
                style: "destructive",
                onPress: async () => {
                    const updated = { ...items[page * PAGE_SIZE + idx], inactive: true };
                    await updateItem(page * PAGE_SIZE + idx, updated);
                    load();
                },
            },
        ]);
    }

    async function handleRefreshItem(idx: number) {
        setRefreshing(true);
        // Optionally, you could re-fetch the price here (mocked as just updating timestamp)
        const updated = { ...items[page * PAGE_SIZE + idx], timestamp: Date.now() };
        await updateItem(page * PAGE_SIZE + idx, updated);
        load();
        await sendNotification("Item Refreshed", "Tracked item has been refreshed.");
    }

    // Pagination logic
    const totalPages = Math.ceil(items.length / PAGE_SIZE);
    const pagedItems = items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.header}>Watchlist</Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TouchableOpacity style={styles.iconBtn} onPress={() => router.push("/settings")}>
                        <Text style={styles.icon}>⚙️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.refreshBtn} onPress={load} disabled={refreshing}>
                        <Text style={styles.refreshText}>{refreshing ? "Refreshing..." : "Refresh"}</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <ScrollView contentContainerStyle={{ padding: 16 }}>
                {pagedItems.length === 0 && (
                    <Text style={styles.text}>No active tracked items.</Text>
                )}
                {pagedItems.map((item, idx) => (
                    <View key={idx} style={styles.item}>
                        {item.image ? (
                            <Image source={{ uri: item.image }} style={styles.previewImage} />
                        ) : (
                            <View style={styles.previewImagePlaceholder} />
                        )}
                        <Text style={styles.titleText}>{item.title || "No title"}</Text>
                        <TouchableOpacity onPress={() => Linking.openURL(item.url)}>
                            <Text style={[styles.text, styles.link]} numberOfLines={1}>{item.url}</Text>
                        </TouchableOpacity>
                        <Text style={styles.priceText}>Price: <Text style={styles.value}>{item.lastText}</Text></Text>
                        <View style={styles.row}>
                            <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemove(idx)}>
                                <Text style={styles.removeText}>Remove</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.itemRefreshBtn} onPress={() => handleRefreshItem(idx)}>
                                <Text style={styles.itemRefreshText}>Refresh</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </ScrollView>
            {totalPages > 1 && (
                <View style={styles.paginationBar}>
                    <TouchableOpacity
                        style={[styles.pageBtn, page === 0 && styles.pageBtnDisabled]}
                        disabled={page === 0}
                        onPress={() => setPage(page - 1)}
                    >
                        <Text style={styles.pageBtnText}>Prev</Text>
                    </TouchableOpacity>
                    <Text style={styles.pageInfo}>
                        Page {page + 1} / {totalPages}
                    </Text>
                    <TouchableOpacity
                        style={[styles.pageBtn, page === totalPages - 1 && styles.pageBtnDisabled]}
                        disabled={page === totalPages - 1}
                        onPress={() => setPage(page + 1)}
                    >
                        <Text style={styles.pageBtnText}>Next</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#000" },
    headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, paddingBottom: 0 },
    header: { color: "#fff", fontSize: 20, fontWeight: "bold" },
    iconBtn: { marginRight: 12 },
    icon: { fontSize: 22 },
    refreshBtn: { backgroundColor: "#222", padding: 8, borderRadius: 6 },
    refreshText: { color: "#fff", fontSize: 14 },
    text: { color: "#fff", marginBottom: 4 },
    link: { textDecorationLine: "underline" },
    item: {
        backgroundColor: "#111",
        borderRadius: 8,
        padding: 12,
        marginBottom: 24,
        alignItems: "center",
    },
    previewImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginBottom: 8,
        backgroundColor: "#222",
    },
    previewImagePlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginBottom: 8,
        backgroundColor: "#222",
    },
    titleText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 4,
        textAlign: "center",
    },
    priceText: {
        color: "#fff",
        fontSize: 16,
        marginBottom: 8,
    },
    value: { color: "#0ff" },
    row: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 8,
    },
    removeBtn: {
        backgroundColor: "#222",
        padding: 6,
        borderRadius: 4,
        alignSelf: "center",
        marginRight: 10,
    },
    removeText: { color: "#f55" },
    itemRefreshBtn: {
        backgroundColor: "#222",
        padding: 6,
        borderRadius: 4,
        alignSelf: "center",
    },
    itemRefreshText: { color: "#0ff" },
    paginationBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#111",
        paddingVertical: 10,
    },
    pageBtn: {
        backgroundColor: "#222",
        paddingVertical: 6,
        paddingHorizontal: 18,
        borderRadius: 4,
        marginHorizontal: 12,
    },
    pageBtnDisabled: {
        opacity: 0.4,
    },
    pageBtnText: {
        color: "#fff",
        fontSize: 15,
    },
    pageInfo: {
        color: "#fff",
        fontSize: 15,
    },
});
