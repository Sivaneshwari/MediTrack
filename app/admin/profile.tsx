
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { router } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    KeyboardTypeOptions,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import AdminLayout from "../../components/admin/AdminLayout";
import { COLORS } from "../../constants/colors";
import { useAdminProfile } from "../../context/AdminProfileContext";

interface ProfileData {
    name: string;
    role: string;
    email: string;
    phone: string;
    office: string;
    joiningDate: string;
    profileImg: string | null;
}

export default function AdminProfile() {
    const { profile, updateProfile } = useAdminProfile();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form State
    const [form, setForm] = useState<ProfileData>({ ...profile });

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions!');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setForm({ ...form, profileImg: result.assets[0].uri });
        }
    };

    const handleSave = () => {
        setLoading(true);
        setTimeout(() => {
            updateProfile({ ...form });
            setIsEditing(false);
            setLoading(false);
            Alert.alert("Success", "Admin profile updated successfully!");
        }, 1000);
    };

    return (
        <AdminLayout title="Admin Profile" showSearch={false} showBackButton>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView 
                    showsVerticalScrollIndicator={false} 
                    contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
                >

                    {/* Header Card */}
                    <View style={styles.headerCard}>
                        <TouchableOpacity
                            onPress={pickImage}
                            disabled={!isEditing}
                            style={styles.avatarContainer}
                        >
                            {form.profileImg ? (
                                <Image source={{ uri: form.profileImg }} style={styles.avatar} />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Text style={styles.avatarText}>NR</Text>
                                </View>
                            )}
                            {isEditing && (
                                <View style={styles.cameraBtn}>
                                    <Ionicons name="camera" size={16} color="white" />
                                </View>
                            )}
                        </TouchableOpacity>

                        <Text style={styles.nameText}>{profile.name}</Text>
                        <Text style={styles.roleText}>{profile.role}</Text>

                        {!isEditing && (
                            <TouchableOpacity
                                style={styles.editBtn}
                                onPress={() => setIsEditing(true)}
                            >
                                <Ionicons name="create-outline" size={18} color={COLORS.primary} />
                                <Text style={styles.editBtnText}>Edit Profile</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Info Sections */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>PERSONAL INFORMATION</Text>
                        <View style={styles.infoGroup}>
                            <InfoRow
                                label="Full Name"
                                value={form.name}
                                icon="person-outline"
                                isEditing={isEditing}
                                onChange={(val: string) => setForm({ ...form, name: val })}
                            />
                            <InfoRow
                                label="Email Address"
                                value={form.email}
                                icon="mail-outline"
                                isEditing={isEditing}
                                keyboardType="email-address"
                                onChange={(val: string) => setForm({ ...form, email: val })}
                            />
                            <InfoRow
                                label="Phone Number"
                                value={form.phone}
                                icon="call-outline"
                                isEditing={isEditing}
                                keyboardType="phone-pad"
                                onChange={(val: string) => setForm({ ...form, phone: val })}
                            />
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>ADMINISTRATIVE DETAILS</Text>
                        <View style={styles.infoGroup}>
                            <InfoRow
                                label="Office / Cabin"
                                value={form.office}
                                icon="business-outline"
                                isEditing={isEditing}
                                onChange={(val: string) => setForm({ ...form, office: val })}
                            />
                            <InfoRow
                                label="Administrative Role"
                                value={form.role}
                                icon="shield-checkmark-outline"
                                isEditing={isEditing}
                                onChange={(val: string) => setForm({ ...form, role: val })}
                            />
                            <InfoRow
                                label="Joined On"
                                value={profile.joiningDate}
                                icon="calendar-outline"
                                isEditing={false} // Read-only
                            />
                        </View>
                    </View>

                    {isEditing && (
                        <View style={styles.actionRow}>
                            <TouchableOpacity
                                style={[styles.actionBtn, styles.cancelBtn]}
                                onPress={() => { setIsEditing(false); setForm({ ...profile }); }}
                            >
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionBtn, styles.saveBtn]}
                                onPress={handleSave}
                            >
                                <Text style={styles.saveBtnText}>{loading ? "Saving..." : "Save Changes"}</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {!isEditing && (
                        <TouchableOpacity
                            style={styles.logoutBtn}
                            onPress={() => router.replace("/")}
                        >
                            <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
                            <Text style={styles.logoutBtnText}>Switch Account / Logout</Text>
                        </TouchableOpacity>
                    )}

                </ScrollView>
            </KeyboardAvoidingView>
        </AdminLayout>
    );
}

interface InfoRowProps {
    label: string;
    value: string;
    icon: any; // Ionicons names are many, using any here or keyof typeof Ionicons.glyphMap
    isEditing: boolean;
    onChange?: (val: string) => void;
    keyboardType?: KeyboardTypeOptions;
}

function InfoRow({ label, value, icon, isEditing, onChange, keyboardType = 'default' }: InfoRowProps) {
    return (
        <View style={styles.row}>
            <View style={styles.iconBox}>
                <Ionicons name={icon} size={20} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>{label}</Text>
                {isEditing && onChange ? (
                    <TextInput
                        style={styles.input}
                        value={value}
                        onChangeText={onChange}
                        keyboardType={keyboardType}
                    />
                ) : (
                    <Text style={styles.infoValue}>{value}</Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    headerCard: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        marginTop: 10,
    },
    avatarContainer: {
        marginBottom: 16,
        position: 'relative'
    },
    avatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
    },
    avatarPlaceholder: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: COLORS.primaryLight || '#D0E1EA',
        alignItems: 'center',
        justifyContent: 'center'
    },
    avatarText: {
        fontSize: 30,
        fontWeight: 'bold',
        color: COLORS.primary
    },
    cameraBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.primary,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: 'white'
    },
    nameText: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.text,
        textAlign: 'center'
    },
    roleText: {
        fontSize: 13,
        color: COLORS.textLight,
        marginTop: 4,
        textAlign: 'center',
        lineHeight: 18,
    },
    editBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 18,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: COLORS.primaryLight || '#D0E1EA',
        borderRadius: 12,
        gap: 8
    },
    editBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.primary
    },
    section: {
        marginBottom: 20
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '800',
        color: COLORS.textLight,
        marginBottom: 10,
        paddingLeft: 4,
        letterSpacing: 1,
        textTransform: 'uppercase'
    },
    infoGroup: {
        backgroundColor: 'white',
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        gap: 14
    },
    iconBox: {
        width: 38,
        height: 38,
        borderRadius: 10,
        backgroundColor: COLORS.primaryLight || '#D0E1EA',
        alignItems: 'center',
        justifyContent: 'center'
    },
    infoLabel: {
        fontSize: 11,
        color: COLORS.textLight,
        fontWeight: '600'
    },
    infoValue: {
        fontSize: 15,
        color: COLORS.text,
        fontWeight: '600',
        marginTop: 2
    },
    input: {
        fontSize: 15,
        color: COLORS.text,
        fontWeight: '600',
        marginTop: 2,
        padding: 0,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.primary
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 10
    },
    actionBtn: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center'
    },
    cancelBtn: {
        backgroundColor: COLORS.backgroundAlt || '#F8FAFC'
    },
    cancelBtnText: {
        color: COLORS.textLight,
        fontWeight: '700'
    },
    saveBtn: {
        backgroundColor: COLORS.primary
    },
    saveBtnText: {
        color: 'white',
        fontWeight: '700'
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#FECACA',
        backgroundColor: '#FEF2F2',
        marginTop: 10,
        gap: 10
    },
    logoutBtnText: {
        color: '#DC2626',
        fontWeight: '700'
    }
});
