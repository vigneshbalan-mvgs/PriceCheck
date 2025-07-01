import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
    const [url, setUrl] = useState("");
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Price Tracker</Text>
            <TextInput
                style={styles.input}
                placeholder="Paste product URL"
                placeholderTextColor="#888"
                value={url}
                onChangeText={setUrl}
                autoCapitalize="none"
                autoCorrect={false}
            />
            <TouchableOpacity
                style={styles.button}
                disabled={!url}
                onPress={() => router.push({ pathname: "/webview", params: { url } })}
            >
                <Text style={styles.buttonText}>Open in WebView</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.button, { marginTop: 16, backgroundColor: "#222" }]}
                onPress={() => router.push("/watchlist")}
            >
                <Text style={styles.buttonText}>Go to Watchlist</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center", padding: 24 },
    title: { color: "#fff", fontSize: 28, marginBottom: 32 },
    input: {
        width: "100%",
        backgroundColor: "#111",
        color: "#fff",
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#222",
    },
    button: {
        backgroundColor: "#444",
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 8,
        alignItems: "center",
        width: "100%",
    },
    buttonText: { color: "#fff", fontSize: 16 },
});
