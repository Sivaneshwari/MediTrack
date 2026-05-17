
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
    Alert,
    Dimensions,
    Image,
    Modal,
    Platform,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated'; // Added animations
import { SafeAreaView } from 'react-native-safe-area-context';

import BloodGroupPicker from "../components/BloodGroupPicker";
import BookingModal from "../components/BookingModal";
import { groupPrescriptionsByAppointment, isPrescriptionActive } from "../components/PrescriptionUtils";
import RulerPicker from "../components/RulerPicker";
import ActionButton from "../components/ui/ActionButton";
const { width } = Dimensions.get('window');

import { COLORS } from '../constants/colors';
import { BASE_URL } from "../constants/Config";

// 💡 Daily Tips Data with "Cartoon" Icons (Simulated via Lucide/Ionicons + Colors)
const HEALTH_TIPS = [
    { text: "Drink plenty of water today!", icon: "water", color: "#60A5FA", bg: "#EFF6FF" },
    { text: "Take a deep breath and relax.", icon: "leaf", color: "#34D399", bg: "#ECFDF5" },
    { text: "Stretch your back and neck.", icon: "accessibility", color: "#F472B6", bg: "#FDF2F8" },
    { text: "Wash your hands frequently.", icon: "hand-left", color: "#FBBF24", bg: "#FFFBEB" },
    { text: "Get at least 8 hours of sleep.", icon: "bed", color: "#818CF8", bg: "#EEF2FF" },
    { text: "Eat a fruit or vegetable snack.", icon: "nutrition", color: "#F87171", bg: "#FEF2F2" },
];

export default function StudentHome() {
    const { student_id, name } = useLocalSearchParams();
    const student_id_str = typeof student_id === 'string' ? student_id : student_id?.[0] || '';
    const [healthTip, setHealthTip] = useState(HEALTH_TIPS[0]); // Changed to object
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Tip Modal State
    const [showTipModal, setShowTipModal] = useState(false);
    const [expandedAppointments, setExpandedAppointments] = useState(false);

    // Data
    const [appointments, setAppointments] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [activePrescriptions, setActivePrescriptions] = useState<any[]>([]);
    const [profile, setProfile] = useState<any>(null); // Height/Weight

    // Modal
    const [modalVisible, setModalVisible] = useState(false);
    const [profileModalVisible, setProfileModalVisible] = useState(false);
    const [bloodHistoryModalVisible, setBloodHistoryModalVisible] = useState(false);
    const [prescriptionsModalVisible, setPrescriptionsModalVisible] = useState(false);
    const [modalProps, setModalProps] = useState<any>({});

    // Animations for Tip Modal
    const tipScale = useSharedValue(0);

    // Show Tip on Login (Mount)
    useFocusEffect(
        useCallback(() => {
            // Pick a random tip
            const randomTip = HEALTH_TIPS[Math.floor(Math.random() * HEALTH_TIPS.length)];
            setHealthTip(randomTip);

            // Show modal with delay
            setTimeout(() => {
                setShowTipModal(true);
                tipScale.value = withSpring(1, { damping: 12 });
            }, 500);

            return () => {
                // Cleanup if needed
                setShowTipModal(false);
                tipScale.value = 0;
            };
        }, [tipScale])
    );

    const closeTipModal = () => {
        tipScale.value = withTiming(0, { duration: 200 });
        setTimeout(() => setShowTipModal(false), 200);
    };

    const tipAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: tipScale.value }]
    }));


    // Profile Editing
    const [isEditing, setIsEditing] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [bloodPickerVisible, setBloodPickerVisible] = useState(false);
    const [editForm, setEditForm] = useState({
        blood_group: '',
        height: '',
        weight: '',
        profile_picture: ''
    });

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled && result.assets[0].base64) {
            setEditForm({ ...editForm, profile_picture: `data:image/jpeg;base64,${result.assets[0].base64}` });
        }
    };

    const fetchData = useCallback(async () => {
        if (!student_id_str) return;
        setLoading(true);
        try {
            const [apptRes, notifRes, prescRes, profileRes] = await Promise.all([
                fetch(`${BASE_URL}/student/appointments/${student_id_str}`),
                fetch(`${BASE_URL}/student/notifications/${student_id_str}`),
                fetch(`${BASE_URL}/student/prescriptions/${student_id_str}`),
                fetch(`${BASE_URL}/student/profile/${student_id_str}`),
            ]);

            if (apptRes.ok) setAppointments(await apptRes.json());
            if (notifRes.ok) setNotifications(await notifRes.json());

            if (profileRes.ok) {
                const profileData = await profileRes.json();
                setProfile(profileData);
                setEditForm({
                    blood_group: profileData.blood_group || '',
                    height: profileData.height ? profileData.height.toString() : '',
                    weight: profileData.weight ? profileData.weight.toString() : '',
                    profile_picture: profileData.profile_picture || ''
                });
            }

            if (prescRes.ok) {
                const prescData = await prescRes.json();
                const grouped = groupPrescriptionsByAppointment(prescData);
                const active = grouped.filter((group: any) =>
                    group.items.some((item: any) => isPrescriptionActive(item.appointment_date, item.duration))
                );
                setActivePrescriptions(active);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [student_id_str]);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fetchData])
    );

    const handleUpdateProfile = async () => {
        setIsUpdating(true);
        try {
            const res = await fetch(`${BASE_URL}/student/profile/${student_id_str}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editForm)
            });
            const data = await res.json();

            if (res.ok) {
                Alert.alert("Success", "Profile updated successfully");
                setIsEditing(false);
                fetchData(); // Refresh data
            } else {
                Alert.alert("Error", data.message || "Failed to update profile");
            }
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Network error while updating profile");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleBookAppointment = async (data: any) => {
        // data: { date, time, reason, priority } from BookingModal
        try {
            const payload = {
                student_id: student_id_str,
                date: data.date,
                time: data.time,
                reason: data.reason,
                patient_id: student_id_str,
                role: 'student',
                priority: data.priority || 'Casual'
            };

            const res = await fetch(`${BASE_URL}/student/appointment`, {
                method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
            });
            const resData = await res.json();

            if (res.ok) {
                Alert.alert("Success", "Appointment Request Sent!");
                setModalVisible(false);
                setModalProps({});
                fetchData();
            } else {
                Alert.alert("Failed", resData.message || "Could not book appointment.");
            }
        } catch (e) { Alert.alert("Error", "Network Error"); }
    };

    const handleEmergency = () => {
        console.log("Emergency button clicked. Student ID:", student_id);

        if (!student_id) {
            if (Platform.OS === 'web') {
                window.alert("Error: Session invalid. Please login again.");
            } else {
                Alert.alert("Error", "Session invalid. Please login again.");
            }
            return;
        }

        const confirmData = {
            title: "Confirm Emergency",
            message: "Book immediate emergency slot?",
            onConfirm: async () => {
                const now = new Date();
                try {
                    const hours = now.getHours().toString().padStart(2, '0');
                    const minutes = now.getMinutes().toString().padStart(2, '0');
                    const timeStr = `${hours}:${minutes}`;

                    const payload = {
                        student_id: student_id_str,
                        date: now.toISOString().split('T')[0],
                        time: timeStr,
                        reason: "EMERGENCY",
                        patient_id: student_id_str,
                        role: 'student',
                        priority: "Emergency"
                    };

                    console.log("Sending Emergency Payload:", payload);

                    const res = await fetch(`${BASE_URL}/student/appointment`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload)
                    });

                    const data = await res.json();
                    console.log("Emergency Response:", data);

                    if (res.ok) {
                        if (Platform.OS === 'web') window.alert("Alert Sent: Medical staff notified.");
                        else Alert.alert("Alert Sent", "Medical staff notified.");
                        fetchData();
                    } else {
                        const msg = data.message || "Failed to book emergency.";
                        if (Platform.OS === 'web') window.alert(`Failed: ${msg}`);
                        else Alert.alert("Failed", msg);
                    }
                } catch (e) {
                    console.error("Emergency Error:", e);
                    if (Platform.OS === 'web') window.alert("Error: Failed to book emergency.");
                    else Alert.alert("Error", "Failed to book emergency.");
                }
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm(`${confirmData.title}\n${confirmData.message}`)) {
                confirmData.onConfirm();
            }
        } else {
            Alert.alert(confirmData.title, confirmData.message, [
                { text: "Cancel", style: "cancel" },
                { text: "CONFIRM", style: "destructive", onPress: confirmData.onConfirm }
            ]);
        }
    };

    // --- UI (Apollo / Instagram Style) ---

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
            <SafeAreaView style={{ flex: 1 }}>

                {/* Modern Clean Header */}
                {/* Modern Clean Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity onPress={() => setProfileModalVisible(true)} style={styles.profileAvatarSm}>
                            {profile?.profile_picture ? (
                                <Image source={{ uri: profile.profile_picture }} style={styles.avatarImgSm} />
                            ) : (
                                <Text style={styles.avatarTextSm}>{(typeof name === 'string' ? name : name?.[0] || 'S').charAt(0)}</Text>
                            )}
                        </TouchableOpacity>
                        <View style={{ marginLeft: 12 }}>
                            <Text style={styles.headerLabel}>Hello,</Text>
                            <Text style={styles.headerName}>{name || 'Student'}</Text>
                        </View>
                    </View>
                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            style={styles.notificationBtn}
                            onPress={() => setBloodHistoryModalVisible(true)}
                        >
                            <Ionicons name="water" size={24} color={COLORS.danger} />
                            {notifications.some((n: any) => n.type === 'blood_bank') && (
                                <View style={styles.notificationDot} />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Scroll View Content */}
                <ScrollView
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={COLORS.primary} />}
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Emergency Banner */}
                    {notifications.some((n: any) => n.type === 'blood_bank') && (
                        <Animated.View entering={FadeInDown} style={styles.emergencyBanner}>
                            <Ionicons name="warning" size={20} color={COLORS.danger} />
                            <Text style={styles.emergencyText}>Blood Emergency Active</Text>
                            <TouchableOpacity style={styles.emergencyAction} onPress={() => setBloodHistoryModalVisible(true)}>
                                <Text style={styles.emergencyActionText}>View</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    )}

                    {/* Wellness Story/Tip */}
                    <View style={styles.storyContainer}>
                        <View style={styles.storyRing}>
                            <View style={styles.storyInner}>
                                <Ionicons name="heart" size={24} color={COLORS.accent} />
                            </View>
                        </View>
                        <View style={styles.wellnessBox}>
                            <Text style={styles.wellnessTitle}>Daily Tip</Text>
                            <Text style={styles.wellnessText}>{typeof healthTip === 'string' ? healthTip : healthTip.text}</Text>
                        </View>
                    </View>

                    {/* Quick Stats / Actions Row 1 */}
                    <View style={styles.statsRow}>
                        <TouchableOpacity style={styles.actionButton} onPress={() => { setModalProps({}); setModalVisible(true); }}>
                            <View style={[styles.actionIcon, { backgroundColor: '#00BFA5' }]}>
                                <Ionicons name="add" size={24} color="#FFFFFF" />
                            </View>
                            <Text style={styles.actionText}>Book New</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton} onPress={handleEmergency}>
                            <View style={[styles.actionIcon, { backgroundColor: '#F44336' }]}>
                                <Ionicons name="call" size={22} color="#FFFFFF" />
                            </View>
                            <Text style={styles.actionText}>Emergency</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Quick Stats / Actions Row 2 */}
                    <View style={styles.statsRow}>
                        <TouchableOpacity style={styles.actionButton} onPress={() => setPrescriptionsModalVisible(true)}>
                            <View style={[styles.actionIcon, { backgroundColor: '#7C3AED' }]}>
                                <Ionicons name="medkit" size={24} color="#FFFFFF" />
                            </View>
                            <Text style={styles.actionText}>Prescriptions</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => router.push({ pathname: "/history", params: { userId: student_id_str, userType: 'student' } } as any)}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#475569' }]}>
                                <Ionicons name="time" size={24} color="#FFFFFF" />
                            </View>
                            <Text style={styles.actionText}>History</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
                        <TouchableOpacity onPress={() => setExpandedAppointments(!expandedAppointments)}>
                            <Text style={styles.seeAll}>{expandedAppointments ? "Show Less" : "See All"}</Text>
                        </TouchableOpacity>
                    </View>

                    {appointments.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="calendar-clear-outline" size={48} color={COLORS.muted} />
                            <Text style={styles.emptyText}>No appointments</Text>
                        </View>
                    ) : (
                        (expandedAppointments ? appointments : appointments.slice(0, 4)).map((item, idx) => (
                            <View key={idx} style={styles.cleanCard}>
                                <View style={styles.apptRow}>
                                    <View style={[styles.calendarIcon, { backgroundColor: COLORS.primaryLight }]}>
                                        <Text style={styles.calDay}>{new Date(item.appointment_date).getDate()}</Text>
                                        <Text style={styles.calMonth}>{new Date(item.appointment_date).toLocaleString('en-US', { month: 'short' })}</Text>
                                    </View>
                                    <View style={styles.apptInfo}>
                                        <Text style={styles.apptTitle}>{item.reason}</Text>
                                        <Text style={styles.apptTime}>
                                            {new Date(item.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                    </View>
                                    <View style={[styles.statusBadge, { backgroundColor: item.status === 'approved' ? COLORS.cat_records.bg : COLORS.cat_appt.bg }]}>
                                        <Text style={[styles.statusBadgeText, { color: item.status === 'approved' ? COLORS.cat_records.text : COLORS.cat_appt.text }]}>
                                            {item.status ? item.status : 'Pending'}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        ))
                    )}



                </ScrollView>

                {/* Centralized Modal */}
                <BookingModal
                    visible={modalVisible}
                    onClose={() => { setModalVisible(false); setModalProps({}); }}
                    onSubmit={handleBookAppointment}
                    userRole="student"
                    {...modalProps}
                />

                <BloodGroupPicker
                    visible={bloodPickerVisible}
                    onClose={() => setBloodPickerVisible(false)}
                    onSelect={(val) => setEditForm({ ...editForm, blood_group: val })}
                    selectedValue={editForm.blood_group}
                />

                {/* Profile Modal - Clean Sheet Style */}
                <Modal
                    visible={profileModalVisible}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setProfileModalVisible(false)}
                >
                    <View style={styles.sheetOverlay}>
                        <View style={styles.sheetContainer}>
                            <View style={styles.sheetHandle} />

                            <View style={styles.sheetHeader}>
                                <TouchableOpacity onPress={pickImage} disabled={!isEditing} style={styles.sheetAvatar}>
                                    {(isEditing ? editForm.profile_picture : profile?.profile_picture) ? (
                                        <Image source={{ uri: isEditing ? editForm.profile_picture : profile.profile_picture }} style={styles.avatarImgLg} />
                                    ) : (
                                        <Text style={styles.sheetAvatarText}>{(typeof name === 'string' ? name : name?.[0] || 'S').charAt(0)}</Text>
                                    )}
                                    {isEditing && (
                                        <View style={styles.cameraIconBadge}>
                                            <Ionicons name="camera" size={16} color={COLORS.white} />
                                        </View>
                                    )}
                                </TouchableOpacity>
                                <Text style={styles.sheetName}>{profile?.full_name || name || 'Student'}</Text>
                                <TouchableOpacity style={styles.editToggle} onPress={() => setIsEditing(!isEditing)}>
                                    <Text style={styles.editToggleText}>{isEditing ? "Cancel Edit" : "Edit Profile"}</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.formContainer}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Blood Group</Text>
                                    {isEditing ? (
                                        <TouchableOpacity onPress={() => setBloodPickerVisible(true)}>
                                            <Text style={styles.cleanInput}>{editForm.blood_group || "Select"}</Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <Text style={styles.inputValue}>{profile?.blood_group || '-'}</Text>
                                    )}
                                </View>
                                <View style={[styles.inputGroup, isEditing && { flexDirection: 'column', alignItems: 'stretch' }]}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                                        <Text style={styles.inputLabel}>Height (cm)</Text>
                                        {!isEditing && <Text style={styles.inputValue}>{profile?.height || '-'}</Text>}
                                    </View>
                                    {isEditing && (
                                        <RulerPicker
                                            min={100}
                                            max={250}
                                            value={editForm.height}
                                            onValueChange={(val) => setEditForm({ ...editForm, height: val })}
                                            unit="cm"
                                        />
                                    )}
                                </View>
                                <View style={[styles.inputGroup, isEditing && { flexDirection: 'column', alignItems: 'stretch' }]}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                                        <Text style={styles.inputLabel}>Weight (kg)</Text>
                                        {!isEditing && <Text style={styles.inputValue}>{profile?.weight || '-'}</Text>}
                                    </View>
                                    {isEditing && (
                                        <RulerPicker
                                            min={30}
                                            max={200}
                                            value={editForm.weight}
                                            onValueChange={(val) => setEditForm({ ...editForm, weight: val })}
                                            unit="kg"
                                        />
                                    )}
                                </View>
                            </View>

                            {isEditing && (
                                <ActionButton
                                    title="Save Changes"
                                    icon="save-outline"
                                    onPress={handleUpdateProfile}
                                    loading={isUpdating}
                                    style={{ marginTop: 24 }}
                                />
                            )}

                            {!isEditing && (
                                <View style={styles.profileActions}>


                                    <TouchableOpacity style={styles.actionRow} onPress={() => { setProfileModalVisible(false); router.replace("/"); }}>
                                        <View style={[styles.actionIconSm, { backgroundColor: COLORS.cat_rx.bg }]}>
                                            <Ionicons name="log-out" size={20} color={COLORS.cat_rx.icon} />
                                        </View>
                                        <Text style={[styles.actionRowText, { color: COLORS.danger }]}>Logout</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={styles.outlineBtn} onPress={() => setProfileModalVisible(false)}>
                                        <Text style={styles.outlineBtnText}>Close</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </View>
                </Modal>

                {/* 🩸 Blood History Modal 🩸 */}
                <Modal
                    visible={bloodHistoryModalVisible}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setBloodHistoryModalVisible(false)}
                >
                    <View style={styles.sheetOverlay}>
                        <View style={[styles.sheetContainer, { maxHeight: '80%' }]}>
                            <View style={styles.sheetHandle} />
                            <Text style={[styles.sheetName, { marginBottom: 20, textAlign: 'center' }]}>Blood Notifications</Text>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                {notifications.filter((n: any) => n.type === 'blood_bank').length === 0 ? (
                                    <View style={[styles.emptyContainer, { borderWidth: 0 }]}>
                                        <Ionicons name="notifications-off-outline" size={48} color={COLORS.muted} />
                                        <Text style={styles.emptyText}>No blood requests history.</Text>
                                    </View>
                                ) : (
                                    notifications.filter((n: any) => n.type === 'blood_bank').map((n: any, i: number) => (
                                        <View key={i} style={[styles.cleanCard, { flexDirection: 'row', alignItems: 'center' }]}>
                                            <View style={[styles.calendarIcon, { backgroundColor: '#FEE2E2', width: 40, height: 40 }]}>
                                                <Ionicons name="water" size={20} color={COLORS.danger} />
                                            </View>
                                            <View style={{ marginLeft: 12, flex: 1 }}>
                                                <Text style={[styles.apptTitle, { color: COLORS.danger }]}>Urgent Blood Request</Text>
                                                <Text style={styles.apptTime}>{new Date(n.created_at || Date.now()).toLocaleDateString()}</Text>
                                                <Text style={[styles.apptTime, { marginTop: 4 }]}>{n.message || "B+ blood needed urgently."}</Text>
                                            </View>
                                        </View>
                                    ))
                                )}
                            </ScrollView>

                            <TouchableOpacity style={[styles.outlineBtn, { marginTop: 20 }]} onPress={() => setBloodHistoryModalVisible(false)}>
                                <Text style={styles.outlineBtnText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>


                {/* 💊 Active Prescriptions Modal 💊 */}
                <Modal
                    visible={prescriptionsModalVisible}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setPrescriptionsModalVisible(false)}
                >
                    <View style={styles.sheetOverlay}>
                        <View style={[styles.sheetContainer, { maxHeight: '80%' }]}>
                            <View style={styles.sheetHandle} />
                            <Text style={[styles.sheetName, { marginBottom: 20, textAlign: 'center' }]}>Active Prescriptions</Text>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                {activePrescriptions.length === 0 ? (
                                    <View style={[styles.emptyContainer, { borderWidth: 0 }]}>
                                        <Ionicons name="medkit-outline" size={48} color={COLORS.muted} />
                                        <Text style={styles.emptyText}>No active prescriptions.</Text>
                                    </View>
                                ) : (
                                    activePrescriptions.map((group, idx) => (
                                        <View key={idx} style={styles.cleanCard}>
                                            <View style={styles.prescHeader}>
                                                <Ionicons name="newspaper-outline" size={20} color={COLORS.text} />
                                                <Text style={styles.prescTitle}>{group.items.length} Medicines</Text>
                                            </View>
                                            <View style={styles.divider} />
                                            {group.items.map((med: any, i: number) => (
                                                <View key={i} style={styles.medRow}>
                                                    <View style={styles.bullet} />
                                                    <Text style={styles.medName}>{med.medicine_name}</Text>
                                                    <Text style={styles.medDose}>{med.dosage}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    ))
                                )}
                            </ScrollView>

                            <TouchableOpacity style={[styles.outlineBtn, { marginTop: 20 }]} onPress={() => setPrescriptionsModalVisible(false)}>
                                <Text style={styles.outlineBtnText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* 🌟 Daily Tip Popup Modal 🌟 */}
                <Modal
                    visible={showTipModal}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={closeTipModal}
                >
                    <View style={styles.tipOverlay}>
                        <Animated.View style={[styles.tipCard, tipAnimatedStyle]}>
                            {/* Cartoon Illustration (Simulated) */}
                            <View style={[styles.tipIllustration, { backgroundColor: (healthTip as any).bg || '#F0F9FF' }]}>
                                <Ionicons name={(healthTip as any).icon as any || "sparkles"} size={64} color={(healthTip as any).color || COLORS.primary} />
                                <View style={[styles.blob, { backgroundColor: (healthTip as any).color }]} />
                            </View>

                            <Text style={styles.tipTitle}>Daily Health Tip!</Text>
                            <Text style={styles.tipText}>
                                {typeof healthTip === 'string' ? healthTip : healthTip.text}
                            </Text>

                            <TouchableOpacity style={styles.tipButton} onPress={closeTipModal}>
                                <Text style={styles.tipButtonText}>Thanks!</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
                </Modal>

            </SafeAreaView>
        </View >
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },

    // Header
    header: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.white },
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    headerLabel: { fontSize: 13, color: COLORS.textLight, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
    headerName: { fontSize: 28, fontWeight: '800', color: COLORS.text, marginTop: 2 },
    headerActions: { flexDirection: 'row', alignItems: 'center' },
    profileAvatarSm: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4, overflow: 'hidden' },
    avatarImgSm: { width: '100%', height: '100%', borderRadius: 24 },
    avatarTextSm: { color: COLORS.white, fontWeight: 'bold', fontSize: 20 },
    notificationBtn: { padding: 8, borderRadius: 12, backgroundColor: COLORS.background, marginLeft: 12 },
    notificationDot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.danger, borderWidth: 1, borderColor: COLORS.white },

    content: { padding: 20 },

    // Emergency
    emergencyBanner: { backgroundColor: '#FFEBEE', padding: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    emergencyText: { flex: 1, marginLeft: 10, color: COLORS.danger, fontWeight: '600' },
    emergencyAction: { backgroundColor: COLORS.white, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
    emergencyActionText: { fontSize: 12, fontWeight: 'bold', color: COLORS.danger },

    // Story/Tip
    storyContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
    storyRing: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: COLORS.accent, padding: 3, marginRight: 12 },
    storyInner: { flex: 1, backgroundColor: COLORS.cat_rx.bg, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    wellnessBox: { flex: 1 },
    wellnessTitle: { fontSize: 14, fontWeight: 'bold', color: COLORS.text },
    wellnessText: { fontSize: 13, color: COLORS.textLight, marginTop: 2 },

    // Actions
    statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    actionButton: { flex: 1, backgroundColor: '#F5F5F5', padding: 5, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    actionIcon: { width: '100%', height: 70, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    actionText: { fontSize: 14, fontWeight: '600', color: COLORS.text },

    // Sections
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
    seeAll: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },

    emptyContainer: { alignItems: 'center', padding: 24, backgroundColor: COLORS.white, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed' },
    emptyText: { marginTop: 8, color: COLORS.textLight },

    // Cards
    cleanCard: { backgroundColor: COLORS.white, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    apptRow: { flexDirection: 'row', alignItems: 'center' },
    calendarIcon: { width: 50, height: 50, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    calDay: { fontSize: 18, fontWeight: 'bold', color: COLORS.primaryDark },
    calMonth: { fontSize: 10, fontWeight: '600', color: COLORS.primaryDark, textTransform: 'uppercase' },
    apptInfo: { flex: 1, marginLeft: 16 },
    apptTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text },
    apptTime: { fontSize: 13, color: COLORS.textLight, marginTop: 2 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    statusBadgeText: { fontSize: 11, fontWeight: 'bold' },

    prescHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    prescTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text },
    divider: { height: 1, backgroundColor: COLORS.border, marginBottom: 12 },
    medRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primary, marginRight: 10 },
    medName: { flex: 1, fontSize: 14, color: COLORS.text, fontWeight: '500' },
    medDose: { fontSize: 13, color: COLORS.textLight },

    // Sheet Modal
    sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    sheetContainer: { backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, minHeight: 400 },
    sheetHandle: { width: 40, height: 4, backgroundColor: COLORS.muted, borderRadius: 2, alignSelf: 'center', marginBottom: 24 },

    // Tip Modal Styles
    tipOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30
    },
    tipCard: {
        width: '85%', // Responsive width
        backgroundColor: COLORS.white,
        borderRadius: 32,
        padding: 32,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10
    },
    tipIllustration: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden'
    },
    blob: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        opacity: 0.2,
        transform: [{ scale: 1.5 }]
    },
    tipTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 8,
        textAlign: 'center'
    },
    tipText: {
        fontSize: 16,
        color: COLORS.textLight,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 24,
        paddingHorizontal: 8
    },
    tipButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 16,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4
    },
    tipButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: 'white'
    },
    sheetHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
    sheetAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginRight: 16, overflow: 'hidden', position: 'relative' },
    avatarImgLg: { width: '100%', height: '100%', borderRadius: 40 },
    cameraIconBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: COLORS.primaryDark, padding: 4, borderRadius: 10, borderWidth: 2, borderColor: COLORS.white },
    sheetAvatarText: { fontSize: 32, color: COLORS.white, fontWeight: 'bold' },
    sheetName: { flex: 1, fontSize: 20, fontWeight: 'bold', color: COLORS.text },
    editToggle: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: COLORS.background, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border },
    editToggleText: { fontSize: 12, fontWeight: '600', color: COLORS.text },

    formContainer: { gap: 16, marginBottom: 32 },
    inputGroup: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
    inputLabel: { fontSize: 15, color: COLORS.textLight },
    inputValue: { fontSize: 16, fontWeight: '600', color: COLORS.text },
    cleanInput: { fontSize: 16, fontWeight: '600', color: COLORS.text, textAlign: 'right', minWidth: 100, padding: 0 },

    primaryBtn: { backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
    primaryBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
    outlineBtn: { paddingVertical: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
    outlineBtnText: { color: COLORS.text, fontSize: 16, fontWeight: '600' },

    editIconBtn: { position: 'absolute', top: 20, right: 20, zIndex: 1, padding: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 50 },
    input: { backgroundColor: COLORS.inputBg, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, width: 120, textAlign: 'right', fontWeight: 'bold', color: COLORS.white, borderWidth: 1, borderColor: COLORS.border },

    profileActions: { width: '100%', marginTop: 24, paddingHorizontal: 20 },
    actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
    actionIconSm: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    actionRowText: { fontSize: 16, fontWeight: '500', color: COLORS.text, flex: 1 },
});
