import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { sendNotification } from "../utils/notification";

const STORAGE_KEY = "check_frequency_per_day";
const FREQUENCY_OPTIONS = [1, 2, 4, 6, 8, 12, 24];

export default function SettingsScreen() {
    const [frequency, setFrequency] = useState(8);

    useEffect(() => {
        AsyncStorage.getItem(STORAGE_KEY).then(val => {
            if (val) setFrequency(Number(val));
        });
    }, []);

    async function saveFrequency(val: number) {
        setFrequency(val);
        await AsyncStorage.setItem(STORAGE_KEY, String(val));
        await sendNotification("Settings Updated", `Check frequency set to ${val} times/day`);
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Settings</Text>
            <Text style={styles.label}>How many times per day to check prices?</Text>
            <View style={styles.optionsRow}>
                {FREQUENCY_OPTIONS.map(opt => (
                    <TouchableOpacity
                        key={opt}
                        style={[
                            styles.optionBtn,
                            frequency === opt && styles.optionBtnActive,
                        ]}
                        onPress={() => saveFrequency(opt)}
                    >
                        <Text style={[
                            styles.optionText,
                            frequency === opt && styles.optionTextActive,
                        ]}>
                            {opt}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <Text style={styles.value}>{frequency} times/day</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#000", padding: 24, justifyContent: "center" },
    header: { color: "#fff", fontSize: 22, fontWeight: "bold", marginBottom: 24 },
    label: { color: "#fff", fontSize: 16, marginBottom: 8 },
    optionsRow: { flexDirection: "row", flexWrap: "wrap", marginVertical: 16, justifyContent: "center" },
    optionBtn: {
        backgroundColor: "#222",
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 6,
        margin: 6,
    },
    optionBtnActive: {
        backgroundColor: "#0ff",
    },
    optionText: {
        color: "#fff",
        fontSize: 16,
    },
    optionTextActive: {
        color: "#000",
        fontWeight: "bold",
    },
    value: { color: "#0ff", fontSize: 18, textAlign: "center" },
});
