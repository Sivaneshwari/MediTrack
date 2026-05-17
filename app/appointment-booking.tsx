import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

import { BASE_URL } from "../constants/Config";
import { COLORS } from "../constants/colors";

const { width } = Dimensions.get('window');

/**
 * MediTrack Original Appointment Booking (Version 1)
 * Theme: Clinical, Simple Form, White/Green.
 */
export default function AppointmentBooking() {
    const { student_id } = useLocalSearchParams();
    const student_id_str = typeof student_id === 'string' ? student_id : student_id?.[0] || '';

    const [form, setForm] = useState({
        reason: "",
        priority: "Normal",
        date: new Date().toISOString().split('T')[0],
        time: "09:00",
    });

    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        if (!form.reason) {
            Alert.alert("Error", "Please state your reason for the visit");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/student/appointment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    student_id: student_id_str,
                    date: form.date,
                    time: form.time,
                    reason: form.reason,
                    priority: form.priority,
                }),
            });

            if (res.ok) {
                Alert.alert("Success", "Appointment booked successfully");
                router.back();
            } else {
                const data = await res.json();
                Alert.alert("Failed", data.message || "Slot unavailable");
            }
        } catch (e) {
            Alert.alert("Error", "Connection error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <SafeAreaView style={{ flex: 1 }}>

                {/* Simple Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="close" size={28} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Book Appointment</Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content}>

                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>REASON FOR VISIT</Text>
                        <TextInput
                            style={styles.textArea}
                            placeholder="e.g. Fever, Consultation, etc."
                            multiline
                            numberOfLines={4}
                            value={form.reason}
                            onChangeText={(v) => setForm({ ...form, reason: v })}
                        />
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>PRIORITY</Text>
                        <View style={styles.prioRow}>
                            {["Normal", "Urgent"].map((p) => (
                                <TouchableOpacity
                                    key={p}
                                    style={[
                                        styles.prioBtn,
                                        form.priority === p && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }
                                    ]}
                                    onPress={() => setForm({ ...form, priority: p })}
                                >
                                    <Text style={[styles.prioText, form.priority === p && { color: 'white' }]}>{p}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>DATE & TIME</Text>
                        <View style={styles.dateTimeRow}>
                            <View style={styles.inputBox}>
                                <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
                                <TextInput
                                    style={styles.smallInput}
                                    value={form.date}
                                    onChangeText={(v) => setForm({ ...form, date: v })}
                                    placeholder="YYYY-MM-DD"
                                />
                            </View>
                            <View style={styles.inputBox}>
                                <Ionicons name="time-outline" size={20} color={COLORS.primary} />
                                <TextInput
                                    style={styles.smallInput}
                                    value={form.time}
                                    onChangeText={(v) => setForm({ ...form, time: v })}
                                    placeholder="HH:mm"
                                />
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.confirmBtn, loading && { opacity: 0.7 }]}
                        onPress={handleConfirm}
                        disabled={loading}
                    >
                        <Text style={styles.confirmBtnText}>
                            {loading ? "Processing..." : "Confirm Booking"}
                        </Text>
                    </TouchableOpacity>

                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    header: { paddingHorizontal: 20, height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: COLORS.tabBackground },
    headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
    backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
    content: { padding: 24, gap: 24 },
    section: { gap: 10 },
    sectionLabel: { fontSize: 13, fontWeight: '700', color: COLORS.textLight, letterSpacing: 1 },
    textArea: { backgroundColor: COLORS.backgroundAlt, borderRadius: 16, padding: 16, fontSize: 16, color: COLORS.text, height: 120, textAlignVertical: 'top' },
    prioRow: { flexDirection: 'row', gap: 12 },
    prioBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: COLORS.tabBackground, alignItems: 'center', backgroundColor: 'white' },
    prioText: { fontWeight: '700', color: COLORS.text },
    dateTimeRow: { flexDirection: 'row', gap: 12 },
    inputBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.backgroundAlt, borderRadius: 12, paddingHorizontal: 12, gap: 10, height: 50 },
    smallInput: { flex: 1, fontSize: 15, fontWeight: '600', color: COLORS.text },
    confirmBtn: { backgroundColor: COLORS.primary, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 20, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
    confirmBtnText: { color: 'white', fontSize: 18, fontWeight: '800' }
});
