
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { ReactNode, useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import AdminLayout from "../../components/admin/AdminLayout";

const COLORS = {
    primary: '#133C55', // Yale Blue
    secondary: '#386FA4', // Cornflower Ocean
    dark: '#133C55',    // Yale Blue
    text: '#133C55',    // Yale Blue
    glass: 'rgba(255, 255, 255, 0.9)',
    border: '#84D2F6',  // Frozen Lake
    white: '#FFFFFF',
    bg: '#F0F9FF',      // Very Light Blue
    danger: '#EF4444'
};

interface SectionProps {
    title: string;
    children: ReactNode;
}

const Section = ({ title, children }: SectionProps) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {children}
    </View>
);

interface SettingRowProps {
    label: string;
    sub?: string;
    right?: ReactNode;
    onPress?: () => void;
}

const SettingRow = ({ label, sub, right, onPress }: SettingRowProps) => (
    <TouchableOpacity
        style={styles.row}
        activeOpacity={onPress ? 0.7 : 1}
        onPress={onPress}
    >
        <View style={{ flex: 1 }}>
            <Text style={styles.label}>{label}</Text>
            {sub && <Text style={styles.sub}>{sub}</Text>}
        </View>
        {right}
    </TouchableOpacity>
);

export default function Settings() {
    // State
    const [notifEnabled, setNotifEnabled] = useState(true);
    const [emailAlerts, setEmailAlerts] = useState(true);

    // Profile State
    const [name, setName] = useState("Dr. Sivaneshwari");
    const [role, setRole] = useState("Health Administrator");
    const [email, setEmail] = useState("sivaneshwari13@gmail.com");
    const [phone, setPhone] = useState("9443878547");

    // Edit Modal State
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(name);
    const [editEmail, setEditEmail] = useState(email);
    const [editPhone, setEditPhone] = useState(phone);

    const handleSaveProfile = () => {
        setName(editName);
        setEmail(editEmail);
        setPhone(editPhone);
        setIsEditing(false);
        Alert.alert("Success", "Profile updated successfully!");
    };

    const handleEditPress = () => {
        setEditName(name);
        setEditEmail(email);
        setEditPhone(phone);
        setIsEditing(true);
    };

    return (
        <AdminLayout title="Settings">
            <View style={{ marginBottom: 30 }}>
                <Text style={styles.pageTitle}>Settings</Text>
                <Text style={styles.pageSub}>Manage your account and preferences</Text>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 50 }} showsVerticalScrollIndicator={false}>
                <Section title="Profile & Account">
                    <View style={styles.profileCard}>
                        <View style={styles.avatar}>
                            <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>{name.charAt(0)}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.name}>{name}</Text>
                            <Text style={styles.role}>{role}</Text>
                        </View>
                        <TouchableOpacity style={styles.editBtn} onPress={handleEditPress}>
                            <Text style={{ color: COLORS.secondary, fontWeight: '600' }}>Edit</Text>
                        </TouchableOpacity>
                    </View>
                    <SettingRow
                        label="Email Address"
                        sub={email}
                        right={<Ionicons name="mail-outline" size={20} color="#94A3B8" />}
                    />
                    <SettingRow
                        label="Phone Number"
                        sub={phone}
                        right={<Ionicons name="call-outline" size={20} color="#94A3B8" />}
                    />
                </Section>

                <Section title="Notifications">
                    <SettingRow
                        label="Push Notifications"
                        sub="Receive alerts on your device"
                        right={<Switch value={notifEnabled} onValueChange={setNotifEnabled} trackColor={{ true: COLORS.primary }} />}
                    />
                    <SettingRow
                        label="Email Alerts"
                        sub="Receive daily summaries and emergency alerts"
                        right={<Switch value={emailAlerts} onValueChange={setEmailAlerts} trackColor={{ true: COLORS.primary }} />}
                    />
                </Section>

                <Section title="Security">
                    <SettingRow
                        label="Change Password"
                        sub="Update your login password"
                        right={<Ionicons name="chevron-forward" size={20} color="#94A3B8" />}
                        onPress={() => Alert.alert("Reset Password", "A password reset link has been sent to " + email)}
                    />                    <TouchableOpacity style={styles.logoutRow} onPress={() => router.replace("/")}>
                        <Text style={[styles.actionText, { color: COLORS.danger }]}>Log Out</Text>
                        <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                    </TouchableOpacity>
                </Section>
            </ScrollView>

            {/* Edit Profile Modal */}
            <Modal visible={isEditing} transparent animationType="slide" onRequestClose={() => setIsEditing(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Edit Profile</Text>
                            <TouchableOpacity onPress={() => setIsEditing(false)}>
                                <Ionicons name="close" size={24} color={COLORS.text} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>Full Name</Text>
                        <TextInput
                            style={styles.input}
                            value={editName}
                            onChangeText={setEditName}
                            placeholder="Dr. Name"
                        />

                        <Text style={styles.label}>Email Address</Text>
                        <TextInput
                            style={styles.input}
                            value={editEmail}
                            onChangeText={setEditEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput
                            style={styles.input}
                            value={editPhone}
                            onChangeText={setEditPhone}
                            keyboardType="phone-pad"
                        />

                        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile}>
                            <Text style={styles.saveBtnText}>Save Changes</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </AdminLayout>
    );
}

const styles = StyleSheet.create({
    pageTitle: { fontSize: 24, fontWeight: '800', color: COLORS.dark },
    pageSub: { color: '#64748B', marginTop: 5, fontSize: 14 },

    section: { marginBottom: 30 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#64748B', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 0.5 },

    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.glass,
        padding: 24,
        borderRadius: 20,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10
    },
    avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    name: { fontSize: 18, fontWeight: '700', color: COLORS.dark },
    role: { color: '#64748B', fontSize: 14, marginTop: 2 },
    editBtn: { padding: 10, backgroundColor: '#EFF6FF', borderRadius: 10 },

    row: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.glass,
        padding: 20,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border
    },
    label: { fontSize: 16, fontWeight: '600', color: COLORS.text },
    sub: { color: '#94A3B8', fontSize: 13, marginTop: 4 },

    logoutRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FEF2F2',
        padding: 20,
        borderRadius: 16,
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#FECACA'
    },
    actionText: { fontSize: 16, fontWeight: '600', color: COLORS.dark },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 30 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { fontSize: 20, fontWeight: '700', color: COLORS.dark },
    input: { backgroundColor: '#F1F5F9', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#CBD5E1', fontSize: 16, color: COLORS.dark, marginBottom: 20 },
    saveBtn: { backgroundColor: COLORS.primary, padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 10 },
    saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
