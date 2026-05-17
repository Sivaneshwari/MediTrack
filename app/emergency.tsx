import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Linking, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

import { BASE_URL } from "../constants/Config";
import { COLORS } from "../constants/colors";

/**
 * MediTrack Original Emergency Screen (Version 1)
 * Theme: Urgent, Red/White, Fast Actions.
 */
export default function EmergencyScreen() {
    const { student_id } = useLocalSearchParams();
    const student_id_str = typeof student_id === 'string' ? student_id : student_id?.[0] || '';
    const [booking, setBooking] = useState(false);

    const handleEmergencyBooking = async () => {
        Alert.alert(
            "Confirm Emergency",
            "This will immediately notify the campus medical team. Continue?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "YES, BOOK NOW",
                    style: "destructive",
                    onPress: async () => {
                        setBooking(true);
                        try {
                            const now = new Date();
                            const dateStr = now.toISOString().split('T')[0];
                            const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

                            const res = await fetch(`${BASE_URL}/student/appointment`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    student_id: student_id_str,
                                    date: dateStr,
                                    time: timeStr,
                                    reason: "🚨 EMERGENCY ASSISTANCE REQUESTED",
                                    priority: "Urgent",
                                }),
                            });

                            if (res.ok) {
                                Alert.alert("Request Sent", "A medical team has been notified. Please stay calm.");
                            } else {
                                Alert.alert("Error", "Could not process request. Please call directly.");
                            }
                        } catch (e) {
                            Alert.alert("Network Error", "Please use the call button below.");
                        } finally {
                            setBooking(false);
                        }
                    }
                }
            ]
        );
    };

    const handleCall = (number: string) => {
        Linking.openURL(`tel:${number}`);
    };


    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#e74c3c" />

            <View style={styles.header}>
                <SafeAreaView>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={28} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Emergency Services</Text>
                </SafeAreaView>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                <View style={styles.hero}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="medical" size={60} color="#e74c3c" />
                    </View>
                    <Text style={styles.heroTitle}>Need Help Immediately?</Text>
                    <Text style={styles.heroSub}>Click below to contact the nearest medical response team.</Text>
                </View>

                <TouchableOpacity
                    style={[styles.emergencyRecordBtn, booking && { opacity: 0.7 }]}
                    onPress={handleEmergencyBooking}
                    disabled={booking}
                >
                    <Ionicons name="medical-outline" size={32} color="white" />
                    <Text style={styles.mainCallText}>{booking ? "Processing..." : "Book Emergency Visit"}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.mainCallBtn}
                    onPress={() => handleCall('911')} // Placeholder for clinic emergency number
                >
                    <Ionicons name="call" size={32} color="white" />
                    <Text style={styles.mainCallText}>Call Campus Clinic</Text>
                </TouchableOpacity>

                <Text style={styles.sectionLabel}>OTHER EMERGENCY CONTACTS</Text>

                <View style={styles.contactList}>
                    <TouchableOpacity style={styles.contactItem} onPress={() => handleCall('000')}>
                        <View style={styles.contactIcon}>
                            <Ionicons name="shield-checkmark" size={24} color="#2c3e50" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.contactName}>Campus Security</Text>
                            <Text style={styles.contactSub}>24/7 Patrol Team</Text>
                        </View>
                        <Ionicons name="call-outline" size={24} color="#e74c3c" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.contactItem} onPress={() => handleCall('111')}>
                        <View style={styles.contactIcon}>
                            <Ionicons name="bus" size={24} color="#2c3e50" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.contactName}>Ambulance Dispatch</Text>
                            <Text style={styles.contactSub}>External Hospital Link</Text>
                        </View>
                        <Ionicons name="call-outline" size={24} color="#e74c3c" />
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    header: { backgroundColor: '#e74c3c', paddingBottom: 20 },
    backBtn: { paddingHorizontal: 20, paddingTop: 10 },
    headerTitle: { fontSize: 24, fontWeight: '900', color: 'white', paddingHorizontal: 24, marginTop: 10 },
    content: { padding: 24 },
    hero: { alignItems: 'center', marginBottom: 32 },
    iconCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#fdeaea', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    heroTitle: { fontSize: 22, fontWeight: '800', color: '#2c3e50', marginBottom: 8 },
    heroSub: { fontSize: 15, color: COLORS.textLight, textAlign: 'center', lineHeight: 22 },
    mainCallBtn: { backgroundColor: '#e74c3c', height: 70, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, shadowColor: '#e74c3c', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8, marginBottom: 16 },
    emergencyRecordBtn: { backgroundColor: '#2c3e50', height: 70, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, shadowColor: '#2c3e50', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8, marginBottom: 16 },
    mainCallText: { color: 'white', fontSize: 20, fontWeight: '800' },

    sectionLabel: { fontSize: 13, fontWeight: '700', color: COLORS.textLight, letterSpacing: 1, marginBottom: 16 },
    contactList: { gap: 12 },
    contactItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f9fa', padding: 16, borderRadius: 16, gap: 16 },
    contactIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' },
    contactName: { fontSize: 16, fontWeight: '700', color: '#2c3e50' },
    contactSub: { fontSize: 13, color: COLORS.textLight }
});
