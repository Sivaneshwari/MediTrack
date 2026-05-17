import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

import { BASE_URL } from "../constants/Config";
import { COLORS } from "../constants/colors";

const { width } = Dimensions.get('window');

/**
 * MediTrack Original Profile Screen (Version 1)
 * Theme: Professional, Clean, Clinical.
 */
export default function ProfileScreen() {
    const { student_id } = useLocalSearchParams();
    const student_id_str = typeof student_id === 'string' ? student_id : student_id?.[0] || '';

    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = useCallback(async () => {
        try {
            const res = await fetch(`${BASE_URL}/student/profile/${student_id_str}`);
            if (res.ok) setProfile(await res.json());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [student_id_str]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleLogout = () => {
        Alert.alert("Logout", "Are you sure you want to exit?", [
            { text: "No" },
            { text: "Yes", onPress: () => router.replace("/") }
        ]);
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <SafeAreaView style={{ flex: 1 }}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={28} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>My Profile</Text>
                    <TouchableOpacity onPress={handleLogout}>
                        <Ionicons name="log-out-outline" size={28} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.content}>

                    {/* Identification */}
                    <View style={styles.profileHero}>
                        <View style={styles.avatarLarge}>
                            <Ionicons name="person" size={60} color={COLORS.primary} />
                        </View>
                        <Text style={styles.profileName}>{profile?.full_name || "Student"}</Text>
                        <Text style={styles.profileId}>{profile?.student_id}</Text>
                    </View>

                    {/* Info Grid */}
                    <View style={styles.infoGrid}>
                        <View style={styles.infoBox}>
                            <Text style={styles.infoLabel}>DEPARTMENT</Text>
                            <Text style={styles.infoValue}>{profile?.department || "N/A"}</Text>
                        </View>
                        <View style={styles.infoBox}>
                            <Text style={styles.infoLabel}>SHIFT</Text>
                            <Text style={styles.infoValue}>{profile?.shift || "Morning"}</Text>
                        </View>
                    </View>

                    {/* Medical Stats */}
                    <Text style={styles.sectionLabel}>MEDICAL INFORMATION</Text>
                    <View style={styles.medGrid}>
                        <View style={styles.medItem}>
                            <View style={[styles.medIcon, { backgroundColor: '#FFEBEE' }]}>
                                <Ionicons name="water" size={24} color="#D32F2F" />
                            </View>
                            <Text style={styles.medValue}>{profile?.blood_group || "O+"}</Text>
                            <Text style={styles.medLabel}>Blood Group</Text>
                        </View>
                        <View style={styles.medItem}>
                            <View style={[styles.medIcon, { backgroundColor: COLORS.primaryLight }]}>
                                <Ionicons name="fitness" size={24} color={COLORS.secondary} />
                            </View>
                            <Text style={styles.medValue}>{profile?.weight || "65"} kg</Text>
                            <Text style={styles.medLabel}>Weight</Text>
                        </View>
                        <View style={styles.medItem}>
                            <View style={[styles.medIcon, { backgroundColor: COLORS.primaryLight }]}>
                                <Ionicons name="body" size={24} color={COLORS.accent} />
                            </View>
                            <Text style={styles.medValue}>{profile?.height || "172"} cm</Text>
                            <Text style={styles.medLabel}>Height</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.secondaryBtn}>
                        <Ionicons name="settings-outline" size={20} color={COLORS.textLight} />
                        <Text style={styles.secondaryBtnText}>Account Settings</Text>
                    </TouchableOpacity>

                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { paddingHorizontal: 20, height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: COLORS.border },
    headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
    backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
    content: { padding: 24 },
    profileHero: { alignItems: 'center', marginBottom: 40 },
    avatarLarge: { width: 120, height: 120, borderRadius: 60, backgroundColor: COLORS.backgroundAlt, justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 4, borderColor: COLORS.primary },
    profileName: { fontSize: 24, fontWeight: '900', color: COLORS.text },
    profileId: { fontSize: 16, color: COLORS.textLight, fontWeight: '600', marginTop: 4 },
    infoGrid: { flexDirection: 'row', gap: 12, marginBottom: 32 },
    infoBox: { flex: 1, backgroundColor: COLORS.backgroundAlt, padding: 16, borderRadius: 16 },
    infoLabel: { fontSize: 10, fontWeight: '800', color: COLORS.textLight, letterSpacing: 1, marginBottom: 4 },
    infoValue: { fontSize: 15, fontWeight: '700', color: COLORS.text },
    sectionLabel: { fontSize: 13, fontWeight: '700', color: COLORS.textLight, letterSpacing: 1, marginBottom: 16 },
    medGrid: { flexDirection: 'row', gap: 12, marginBottom: 40 },
    medItem: { flex: 1, backgroundColor: COLORS.white, padding: 20, borderRadius: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2, borderWidth: 1, borderColor: COLORS.border },
    medIcon: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    medValue: { fontSize: 18, fontWeight: '800', color: COLORS.text },
    medLabel: { fontSize: 12, color: COLORS.textLight, fontWeight: '600', marginTop: 4 },
    secondaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border },
    secondaryBtnText: { color: COLORS.textLight, fontWeight: '700', fontSize: 15 }
});
