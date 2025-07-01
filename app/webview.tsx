import * as Linking from "expo-linking";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { WebView } from "react-native-webview";
import { sendNotification } from "../utils/notification";
import { getItems, saveItem, updateItem } from "../utils/storage";

const INJECTED_JAVASCRIPT = `
(function() {
  function postElementData(el) {
    window.ReactNativeWebView.postMessage(JSON.stringify({
      innerText: el.innerText,
      className: el.className,
      tagName: el.tagName,
      id: el.id,
      src: el.src || ""
    }));
  }
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    postElementData(e.target);
    return false;
  });
})();
true;
`;

const SELECT_OPTIONS = [
    { key: "price", label: "Price" },
    { key: "title", label: "Title" },
    { key: "image", label: "Image" },
];

export default function WebviewScreen() {
    const { url } = useLocalSearchParams<{ url?: string }>();
    const [currentUrl, setCurrentUrl] = useState(url as string | undefined);
    const webviewRef = useRef<WebView>(null);

    // Selection state
    const [price, setPrice] = useState<any>(null);
    const [title, setTitle] = useState<any>(null);
    const [image, setImage] = useState<any>(null);

    // UI state
    const [selecting, setSelecting] = useState<"price" | "title" | "image">("price");
    const [selected, setSelected] = useState<{ price?: any; title?: any; image?: any }>({});
    const [showSave, setShowSave] = useState(false);

    // Price monitoring interval (unchanged)
    useEffect(() => {
        let interval: NodeJS.Timeout;
        async function monitor() {
            const items = await getItems();
            items.forEach(async (item, idx) => {
                try {
                    const response = await fetch(item.url);
                    const html = await response.text();
                    const match = new RegExp(`<[^>]*class=["']${item.className}["'][^>]*>(.*?)<\\/[^>]+>`, "is").exec(html);
                    const newText = match ? match[1].trim() : "";
                    if (newText && newText !== item.lastText) {
                        await sendNotification("Price Changed!", `New value: ${newText}`);
                        await updateItem(idx, { ...item, lastText: newText, timestamp: Date.now() });
                    }
                } catch { }
            });
        }
        interval = setInterval(monitor, 30 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    // Handle shared URLs (unchanged)
    useEffect(() => {
        const sub = Linking.addEventListener("url", ({ url }) => {
            const parsed = Linking.parse(url);
            if (parsed.queryParams?.url) {
                setCurrentUrl(parsed.queryParams.url as string);
            }
        });
        return () => sub.remove();
    }, []);

    // Handle element selection
    const handleElementSelect = (data: any) => {
        if (selecting === "price") {
            // Require price to contain a number and currency, but be more tolerant
            if (!data.innerText || !/\d/.test(data.innerText)) {
                Alert.alert("Select a valid price element (must contain a number).");
                return;
            }
            setSelected(prev => ({ ...prev, price: data }));
            setSelecting("title");
        } else if (selecting === "title") {
            // Accept any non-empty text for title
            if (!data.innerText || !data.innerText.trim()) {
                Alert.alert("Select a valid title element (must contain text).");
                return;
            }
            setSelected(prev => ({ ...prev, title: data }));
            setSelecting("image");
        } else if (selecting === "image") {
            // Accept any element with a src attribute (image)
            if (!data.src || typeof data.src !== "string" || !/^https?:\/\//.test(data.src)) {
                Alert.alert("Select a valid image element.");
                return;
            }
            setSelected(prev => ({ ...prev, image: data }));
            setShowSave(true);
        }
    };

    // Save tracked item
    const handleSave = async () => {
        if (!selected.price) {
            Alert.alert("Please select a price first.");
            return;
        }
        await saveItem({
            url: currentUrl,
            className: selected.price.className,
            lastText: selected.price.innerText,
            timestamp: Date.now(),
            tagName: selected.price.tagName,
            id: selected.price.id,
            image: selected.image?.src,
            title: selected.title?.innerText,
        });
        setSelected({});
        setSelecting("price");
        setShowSave(false);
        Alert.alert("Tracked!", "Your selection has been saved.");
    };

    // Show current selections at the top
    const renderSelectionSummary = () => (
        <View style={styles.selectionSummary}>
            <Text style={styles.selectionLabel}>
                Price: <Text style={styles.selectionValue}>{selected.price?.innerText || "Not selected"}</Text>
            </Text>
            <Text style={styles.selectionLabel}>
                Title: <Text style={styles.selectionValue}>{selected.title?.innerText || "Not selected"}</Text>
            </Text>
            <Text style={styles.selectionLabel}>
                Image:
                {selected.image?.src ? (
                    <Image
                        source={{ uri: selected.image.src }}
                        style={styles.selectionImage}
                        resizeMode="contain"
                    />
                ) : (
                    <Text style={styles.selectionValue}> Not selected</Text>
                )}
            </Text>
        </View>
    );

    if (!currentUrl) {
        return (
            <View style={styles.center}>
                <ActivityIndicator color="#fff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {renderSelectionSummary()}
            <WebView
                ref={webviewRef}
                source={{ uri: currentUrl }}
                style={{ flex: 1, backgroundColor: "#000" }}
                injectedJavaScript={INJECTED_JAVASCRIPT}
                onMessage={event => {
                    try {
                        const data = JSON.parse(event.nativeEvent.data);
                        handleElementSelect(data);
                    } catch { }
                }}
                javaScriptEnabled
                domStorageEnabled
                allowsBackForwardNavigationGestures
                originWhitelist={["*"]}
                injectedJavaScriptBeforeContentLoaded={`
                    try {
                        document.documentElement.style.background = "#000";
                        document.body.style.background = "#000";
                        document.body.style.color = "#fff";
                    } catch(e){}
                `}
            />
            <View style={styles.bottomBar}>
                {SELECT_OPTIONS.map(opt => (
                    <TouchableOpacity
                        key={opt.key}
                        style={[
                            styles.selectBtn,
                            selecting === opt.key && styles.selectBtnActive,
                            selected[opt.key as "price" | "title" | "image"] && styles.selectBtnDone,
                        ]}
                        disabled={selecting !== opt.key}
                        onPress={() => setSelecting(opt.key as "price" | "title" | "image")}
                    >
                        <Text style={styles.selectBtnText}>
                            {opt.label}
                            {selected[opt.key as "price" | "title" | "image"] ? " ✓" : ""}
                        </Text>
                    </TouchableOpacity>
                ))}
                {showSave && (
                    <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                        <Text style={styles.saveText}>Save</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#000" },
    center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" },
    bottomBar: {
        flexDirection: "row",
        backgroundColor: "#111",
        padding: 10,
        alignItems: "center",
        justifyContent: "space-around",
    },
    selectBtn: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
        backgroundColor: "#222",
        marginHorizontal: 4,
    },
    selectBtnActive: {
        backgroundColor: "#0ff",
    },
    selectBtnDone: {
        backgroundColor: "#444",
    },
    selectBtnText: {
        color: "#fff",
        fontWeight: "bold",
    },
    saveBtn: {
        backgroundColor: "#0ff",
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 6,
        marginLeft: 12,
    },
    saveText: { color: "#000", fontWeight: "bold", fontSize: 16 },
    selectionSummary: {
        backgroundColor: "#111",
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#222",
    },
    selectionLabel: {
        color: "#fff",
        fontSize: 15,
        marginBottom: 4,
    },
    selectionValue: {
        color: "#0ff",
    },
    selectionImage: {
        width: 40,
        height: 40,
        marginLeft: 8,
        borderRadius: 4,
        backgroundColor: "#222",
        display: "inline",
    },
});
