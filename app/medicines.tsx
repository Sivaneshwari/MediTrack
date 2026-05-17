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

import { isPrescriptionActive } from "../components/PrescriptionUtils";
import { BASE_URL } from "../constants/Config";
import { COLORS } from "../constants/colors";

const { width } = Dimensions.get('window');

/**
 * MediTrack Original Medicines Screen (Version 1)
 * Displays current active prescriptions.
 */
export default function MedicinesScreen() {
    const { student_id } = useLocalSearchParams();
    const student_id_str = typeof student_id === 'string' ? student_id : student_id?.[0] || '';

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [medicines, setMedicines] = useState<any[]>([]);

    const fetchData = useCallback(async () => {
        if (!student_id_str) return;
        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/student/prescriptions/${student_id_str}`);
            if (res.ok) {
                const data = await res.json();
                // Filter for active ones using our utility
                const active = data.filter((p: any) => isPrescriptionActive(p.appointment_date, p.duration));
                setMedicines(active);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [student_id_str]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <SafeAreaView style={{ flex: 1 }}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={28} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>My Medicines</Text>
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
                        <View style={styles.summaryCard}>
                            <View style={styles.summaryIcon}>
                                <Ionicons name="medkit" size={32} color="white" />
                            </View>
                            <View>
                                <Text style={styles.summaryTitle}>Active Course</Text>
                                <Text style={styles.summarySub}>{medicines.length} medicine(s) currently prescribed</Text>
                            </View>
                        </View>

                        <Text style={styles.sectionLabel}>CURRENT PRESCRIPTIONS</Text>

                        {medicines.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="medical-outline" size={60} color={COLORS.muted} />
                                <Text style={styles.emptyText}>No active prescriptions found.</Text>
                            </View>
                        ) : (
                            medicines.map((item, idx) => (
                                <Animated.View key={idx} entering={FadeInDown.delay(idx * 100)} style={styles.medicineCard}>
                                    <View style={styles.medHeader}>
                                        <View style={styles.medIconBox}>
                                            <Ionicons name="bandage-outline" size={24} color={COLORS.primary} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.medName}>{item.medicine_name}</Text>
                                            <Text style={styles.medDose}>{item.dosage} • {item.frequency}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.medFooter}>
                                        <View style={styles.footerItem}>
                                            <Ionicons name="calendar-outline" size={14} color={COLORS.textLight} />
                                            <Text style={styles.footerText}>Duration: {item.duration}</Text>
                                        </View>
                                        <View style={styles.footerItem}>
                                            <Ionicons name="time-outline" size={14} color={COLORS.textLight} />
                                            <Text style={styles.footerText}>Started: {new Date(item.appointment_date).toLocaleDateString()}</Text>
                                        </View>
                                    </View>
                                    {item.notes && (
                                        <View style={styles.notesBox}>
                                            <Text style={styles.notesText}>Note: {item.notes}</Text>
                                        </View>
                                    )}
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
    container: { flex: 1, backgroundColor: '#fcfcfc' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { paddingHorizontal: 20, height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: COLORS.tabBackground, backgroundColor: 'white' },
    headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
    backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
    content: { padding: 20 },
    summaryCard: { backgroundColor: COLORS.primary, borderRadius: 24, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 32, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
    summaryIcon: { width: 60, height: 60, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    summaryTitle: { fontSize: 20, fontWeight: '800', color: 'white' },
    summarySub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
    sectionLabel: { fontSize: 12, fontWeight: '800', color: COLORS.textLight, letterSpacing: 1, marginBottom: 16 },
    medicineCard: { backgroundColor: 'white', borderRadius: 20, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    medHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
    medIconBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center' },
    medName: { fontSize: 17, fontWeight: '800', color: COLORS.text },
    medDose: { fontSize: 14, color: COLORS.textLight, fontWeight: '600', marginTop: 2 },
    medFooter: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#f1f1f1', paddingTop: 16, gap: 20 },
    footerItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    footerText: { fontSize: 12, color: COLORS.textLight, fontWeight: '600' },
    notesBox: { marginTop: 12, backgroundColor: '#f8f9fa', padding: 12, borderRadius: 12 },
    notesText: { fontSize: 12, color: COLORS.textLight, fontStyle: 'italic' },
    emptyContainer: { alignItems: 'center', marginTop: 60, gap: 16 },
    emptyText: { color: COLORS.textLight, fontWeight: '600', fontSize: 15 }
});
