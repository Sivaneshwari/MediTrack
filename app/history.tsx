import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";

import {
    ActivityIndicator,
    Dimensions,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { groupPrescriptionsByAppointment } from "../components/PrescriptionUtils";
import { BASE_URL } from "../constants/Config";
import { COLORS } from "../constants/colors";

const { width } = Dimensions.get('window');

/**
 * MediTrack Original Medical History (Version 1)
 * Theme: Clinical, Clean, White/Green.
 */
export default function HistoryScreen() {
    const { userId, userType } = useLocalSearchParams();
    const id_str = typeof userId === 'string' ? userId : userId?.[0] || '';
    const type_str = typeof userType === 'string' ? userType : userType?.[0] || 'student';

    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [history, setHistory] = useState<any[]>([]);

    const fetchData = useCallback(async () => {
        if (!id_str) return;
        setLoading(true);
        try {
            // Fetch from correct endpoint dynamically (staff or student)
            const res = await fetch(`${BASE_URL}/${type_str}/prescriptions/${id_str}`);
            if (res.ok) {
                const data = await res.json();
                // Group by appointment to handle multiple medicines per visit
                const grouped = groupPrescriptionsByAppointment(data);
                setHistory(grouped);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [id_str, type_str]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <SafeAreaView style={{ flex: 1 }}>

                {/* Simple Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={28} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Medical History</Text>
                    <View style={{ width: 44 }} />
                </View>

                {loading && !refreshing ? (
                    <View style={styles.center}>
                        <ActivityIndicator color={COLORS.primary} size="large" />
                    </View>
                ) : (
                    <ScrollView
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
                        contentContainerStyle={styles.content}
                    >
                        {history.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="folder-open-outline" size={60} color={COLORS.muted} />
                                <Text style={styles.emptyText}>No medical records found.</Text>
                            </View>
                        ) : (
                            history.map((item, idx) => (
                                <Animated.View key={idx} entering={FadeInDown.delay(idx * 100)} style={styles.card}>
                                    <View style={styles.dateBox}>
                                        <Text style={styles.dateDay}>{new Date(item.date).getDate()}</Text>
                                        <Text style={styles.dateMonth}>{new Date(item.date).toLocaleString('en-US', { month: 'short' })}</Text>
                                    </View>
                                    <View style={styles.cardInfo}>
                                        <Text style={styles.cardTitle}>{item.reason || "General Checkup"}</Text>
                                        <Text style={styles.cardTime}>
                                            {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Text>

                                        {/* Medicine Recommendations */}
                                        {item.nurse_notes ? (
                                            <View style={{ marginTop: 8, padding: 10, backgroundColor: '#F8FAFC', borderRadius: 8, borderLeftWidth: 3, borderLeftColor: COLORS.primary }}>
                                                <Text style={{ fontSize: 13, color: COLORS.text, fontStyle: 'italic' }}>{item.nurse_notes}</Text>
                                            </View>
                                        ) : null}

                                        {item.items && item.items.length > 0 && (
                                            <View style={styles.medSection}>
                                                <Text style={styles.medHeader}>RECOMMENDED MEDICINE:</Text>
                                                {item.items.map((med: any, mIdx: number) => (
                                                    <View key={mIdx} style={styles.medRow}>
                                                        <Ionicons name="medical-outline" size={14} color={COLORS.primary} />
                                                        <Text style={styles.medName}>
                                                            {med.medicine_name} - <Text style={styles.medDose}>{med.dosage}</Text>
                                                        </Text>
                                                    </View>
                                                ))}
                                            </View>
                                        )}
                                    </View>
                                </Animated.View>
                            ))
                        )}
                    </ScrollView>
                )}
            </SafeAreaView>
        </View>
    );
}


const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    header: { paddingHorizontal: 20, height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: COLORS.tabBackground },
    headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
    backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    content: { padding: 20, gap: 12 },
    card: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: COLORS.tabBackground, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    dateBox: { width: 50, height: 50, borderRadius: 12, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
    dateDay: { fontSize: 18, fontWeight: '800', color: COLORS.primaryDark },
    dateMonth: { fontSize: 10, fontWeight: '700', color: COLORS.primaryDark, textTransform: 'uppercase' },
    cardInfo: { flex: 1, marginLeft: 16 },
    cardTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text },
    cardTime: { fontSize: 13, color: COLORS.textLight, marginTop: 2, marginBottom: 8 },
    statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
    detailsBtn: { padding: 8 },
    medSection: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f1f1f1' },
    medHeader: { fontSize: 10, fontWeight: '800', color: COLORS.primary, letterSpacing: 1, marginBottom: 8 },
    medRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    medName: { fontSize: 14, fontWeight: '700', color: COLORS.text, flex: 1 },
    medDose: { fontWeight: '400', color: COLORS.textLight },
    emptyContainer: { alignItems: 'center', marginTop: 100, gap: 16 },

    emptyText: { color: COLORS.textLight, fontWeight: '600', fontSize: 16 }
});
