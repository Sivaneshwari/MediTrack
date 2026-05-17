import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, Linking, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { BASE_URL } from "../../constants/Config";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

interface Donor {
    full_name: string;
    student_id?: string;
    staff_id?: string;
    phone: string;
    blood_group: string;
    email?: string;
    department?: string;
}

interface RequestHistory {
    id: number;
    blood_group: string;
    urgency: string;
    contact_person: string;
    contact_phone: string;
    message: string;
    is_fulfilled: number; // 0 or 1
    donor_name?: string;
    donor_phone?: string;
    created_at: string;
}

import AdminLayout from "../../components/admin/AdminLayout";

export default function BloodGroups() {
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
    const [userType, setUserType] = useState<'student' | 'staff'>('student');
    const [data, setData] = useState<Donor[]>([]);
    const [loading, setLoading] = useState(false);
    const [showNotifyModal, setShowNotifyModal] = useState(false);
    const [notification, setNotification] = useState({
        blood_group: '', urgency: 'high', message: 'Urgent blood donation required.', contact_person: 'Admin', contact_phone: ''
    });

    // History
    const [history, setHistory] = useState<RequestHistory[]>([]);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [currentRequest, setCurrentRequest] = useState<RequestHistory | null>(null);
    const [fulfillmentModal, setFulfillmentModal] = useState(false);
    const [donorDetails, setDonorDetails] = useState({ name: '', address: '', phone: '' });

    useEffect(() => { if (selectedGroup) fetchData(); }, [selectedGroup, userType]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const endpoint = userType === 'student' ? '/admin/dashboard/blood-groups/students' : '/admin/dashboard/blood-groups/staff';
            const groupParam = selectedGroup ? encodeURIComponent(selectedGroup) : '';
            const res = await fetch(`${BASE_URL}${endpoint}?bloodGroup=${groupParam}`);
            const json = await res.json();
            if (res.ok) setData(json);

            fetchHistory();
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    const fetchHistory = async () => {
        try {
            const res = await fetch(`${BASE_URL}/admin/dashboard/blood-bank/history`);
            const json = await res.json();
            if (res.ok) setHistory(json);
        } catch (e) { console.error(e); }
    };

    const handleExport = (exportType: string) => {
        const url = `${BASE_URL}/admin/dashboard/export/blood-groups/${exportType}?type=${userType}`;
        Linking.openURL(url).catch(err => Alert.alert("Error", "Could not open download link"));
    };

    const sendNotification = async () => {
        try {
            const res = await fetch(`${BASE_URL}/admin/dashboard/blood-groups/notify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(notification)
            });
            if (res.ok) {
                Alert.alert("Success", "Requests sent");
                setShowNotifyModal(false);
                fetchHistory(); // Refresh history
            }
        } catch (err) { Alert.alert("Error", "Failed to send"); }
    };

    const handleFulfill = async () => {
        if (!currentRequest) return;
        if (!donorDetails.name || !donorDetails.phone) return Alert.alert("Missing Info", "Name and Phone are required");

        try {
            const res = await fetch(`${BASE_URL}/admin/dashboard/blood-bank/request/${currentRequest.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    donor_name: donorDetails.name,
                    donor_address: donorDetails.address,
                    donor_phone: donorDetails.phone
                })
            });

            if (res.ok) {
                Alert.alert("Success", "Donor details saved");
                setFulfillmentModal(false);
                fetchHistory();
            } else {
                Alert.alert("Error", "Failed to update");
            }
        } catch (e) { Alert.alert("Error", "Connection failed"); }
    };

    return (
        <AdminLayout title="Blood Bank" showBackButton={true}>
            <View style={styles.content}>
                <View style={[styles.headerRow, { marginTop: 10 }]}>
                    <View>
                        <Text style={styles.pageTitle}>Blood Bank</Text>
                        <Text style={styles.pageSub}>Donors & Requests</Text>
                    </View>
                    <View style={styles.headerActions}>
                        <TouchableOpacity style={[styles.exportBtn, { backgroundColor: '#818CF8' }]} onPress={() => setShowHistoryModal(true)}>
                            <Ionicons name="time-outline" size={20} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.exportBtn, { backgroundColor: '#10B981' }]} onPress={() => handleExport('excel')}>
                            <Ionicons name="document-text-outline" size={20} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.exportBtn, { backgroundColor: '#F87171' }]} onPress={() => handleExport('pdf')}>
                            <Ionicons name="print-outline" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Styled Segmented Control */}
                <View style={styles.tabs}>
                    <TouchableOpacity onPress={() => setUserType('student')} style={[styles.tab, userType === 'student' && styles.activeTab]}>
                        <Text style={[styles.tabText, userType === 'student' && styles.activeTabText]}>Students</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setUserType('staff')} style={[styles.tab, userType === 'staff' && styles.activeTab]}>
                        <Text style={[styles.tabText, userType === 'staff' && styles.activeTabText]}>Staff</Text>
                    </TouchableOpacity>
                </View>

                {/* Horizontal Blood Group Chips */}
                <View style={styles.selectorContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.groupScroll}>
                        {BLOOD_GROUPS.map(bg => (
                            <TouchableOpacity 
                                key={bg} 
                                style={[styles.bgChip, selectedGroup === bg && styles.activeBgChip]} 
                                onPress={() => setSelectedGroup(bg)}
                            >
                                <Text style={[styles.bgText, selectedGroup === bg && styles.activeBgText]}>{bg}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {!selectedGroup ? (
                    <View style={styles.placeholder}>
                        <View style={styles.placeholderIconBg}>
                            <Ionicons name="water" size={60} color="#E11D48" />
                        </View>
                        <Text style={styles.placeholderTitle}>No Group Selected</Text>
                        <Text style={styles.placeholderSub}>Choose a blood type to view donors</Text>
                    </View>
                ) : (
                    <FlatList
                        data={data}
                        keyExtractor={(item, idx) => idx.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.donorCard}>
                                <View style={styles.donorInfo}>
                                    <Text style={styles.donorName}>{item.full_name}</Text>
                                    <Text style={styles.donorSub}>{item.student_id || item.staff_id} • {item.phone}</Text>
                                    <Text style={styles.donorDept}>{item.department || 'N/A'}</Text>
                                </View>
                                <View style={styles.donorBadgeBg}>
                                    <Text style={styles.donorBadgeText}>{item.blood_group}</Text>
                                </View>
                            </View>
                        )}
                        contentContainerStyle={styles.listContainer}
                        ListEmptyComponent={
                            <View style={styles.placeholder}>
                                <Text style={styles.emptyText}>No donors found for {selectedGroup}</Text>
                            </View>
                        }
                    />
                )}

                <TouchableOpacity style={styles.emergencyBtn} onPress={() => { setNotification({ ...notification, blood_group: selectedGroup || 'O+' }); setShowNotifyModal(true); }}>
                    <Ionicons name="megaphone" size={24} color="#fff" />
                    <Text style={styles.emergencyText}>Broadcast Request</Text>
                </TouchableOpacity>

                <Modal visible={showNotifyModal} animationType="slide" transparent>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHandle} />
                            <View style={styles.modalHeaderSec}>
                                <View style={styles.warningIconBg}>
                                    <Ionicons name="megaphone" size={32} color="#EF4444" />
                                </View>
                                <Text style={styles.modalTitleLarge}>Emergency Broadcast</Text>
                                <Text style={styles.modalSub}>Alerting donors for {notification.blood_group}</Text>
                            </View>
                            
                            <Text style={styles.inputLabel}>Message</Text>
                            <TextInput 
                                style={[styles.input, { height: 100, textAlignVertical: 'top' }]} 
                                placeholder="Enter urgent message..." 
                                multiline 
                                value={notification.message} 
                                onChangeText={t => setNotification({ ...notification, message: t })} 
                            />
                            
                            <Text style={styles.inputLabel}>Contact Phone</Text>
                            <TextInput 
                                style={styles.input} 
                                placeholder="Contact phone number" 
                                keyboardType="phone-pad" 
                                value={notification.contact_phone} 
                                onChangeText={t => setNotification({ ...notification, contact_phone: t })} 
                            />
                            
                            <View style={styles.modalActionRow}>
                                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowNotifyModal(false)}>
                                    <Text style={styles.cancelBtnText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.modalSendBtn} onPress={sendNotification}>
                                    <Text style={styles.sendBtnText}>Broadcast Now</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* History Modal */}
                <Modal visible={showHistoryModal} animationType="slide" presentationStyle="pageSheet">
                    <View style={styles.historyContainer}>
                        <View style={styles.headerRow}>
                            <Text style={styles.modalTitleLarge}>Broadcast History</Text>
                            <TouchableOpacity onPress={() => setShowHistoryModal(false)}>
                                <Ionicons name="close" size={28} color="#133C55" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={history}
                            keyExtractor={item => item.id.toString()}
                            contentContainerStyle={{ paddingBottom: 50 }}
                            renderItem={({ item }) => (
                                <View style={[styles.donorCard, { flexDirection: 'column', alignItems: 'flex-start', gap: 5 }]}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                                        <Text style={{ fontWeight: '900', fontSize: 16, color: '#133C55' }}>{item.blood_group} Request</Text>
                                        <Text style={{ color: item.is_fulfilled ? '#10B981' : '#E11D48', fontWeight: '900', fontSize: 12 }}>
                                            {item.is_fulfilled ? 'FULFILLED' : 'PENDING'}
                                        </Text>
                                    </View>
                                    <Text style={{ color: '#666' }}>{new Date(item.created_at).toLocaleDateString()} - {item.message}</Text>
                                    {item.is_fulfilled ? (
                                        <View style={{ marginTop: 8, padding: 12, backgroundColor: '#F0FDF4', borderRadius: 12, width: '100%', borderWidth: 1, borderColor: '#DCFCE7' }}>
                                            <Text style={{ fontWeight: '800', color: '#166534', fontSize: 14 }}>Donor: {item.donor_name}</Text>
                                            <Text style={{ fontSize: 12, color: '#15803D', marginTop: 2 }}>{item.donor_phone}</Text>
                                        </View>
                                    ) : (
                                        <TouchableOpacity
                                            style={[styles.modalSendBtn, { marginTop: 12, alignSelf: 'stretch', padding: 12, borderRadius: 12 }]}
                                            onPress={() => { setCurrentRequest(item); setFulfillmentModal(true); setDonorDetails({ name: '', address: '', phone: '' }); }}
                                        >
                                            <Text style={{ color: '#fff', fontWeight: '900', fontSize: 14 }}>Found Donor? Add Details</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}
                        />
                    </View>
                </Modal>

                {/* Fulfillment Modal */}
                <Modal visible={fulfillmentModal} animationType="fade" transparent>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHandle} />
                            <Text style={styles.modalTitleLarge}>Add Donor Details</Text>
                            <Text style={styles.modalSub}>Recording donation fulfillment</Text>

                            <Text style={styles.inputLabel}>Donor Name</Text>
                            <TextInput style={styles.input} value={donorDetails.name} onChangeText={t => setDonorDetails({ ...donorDetails, name: t })} placeholder="Full Name" />

                            <Text style={styles.inputLabel}>Phone Number</Text>
                            <TextInput style={styles.input} value={donorDetails.phone} keyboardType="phone-pad" onChangeText={t => setDonorDetails({ ...donorDetails, phone: t })} placeholder="Phone Number" />

                            <Text style={styles.inputLabel}>Address</Text>
                            <TextInput style={styles.input} value={donorDetails.address} onChangeText={t => setDonorDetails({ ...donorDetails, address: t })} multiline placeholder="Address (Optional)" />

                            <View style={styles.modalActionRow}>
                                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setFulfillmentModal(false)}>
                                    <Text style={styles.cancelBtnText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.modalSendBtn, { backgroundColor: '#10B981' }]} onPress={handleFulfill}>
                                    <Text style={styles.sendBtnText}>SAVE</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </AdminLayout>
    );
}

const styles = StyleSheet.create({
    content: { flex: 1, paddingHorizontal: 20 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
    headerActions: { flexDirection: 'row', gap: 10 },
    pageTitle: { fontSize: 32, fontWeight: '900', color: '#133C55', letterSpacing: -0.5 },
    pageSub: { color: '#64748B', fontSize: 13, fontWeight: '600', marginTop: -2 },
    exportBtn: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
    
    tabs: { flexDirection: 'row', marginBottom: 20, backgroundColor: '#F1F5F9', borderRadius: 16, padding: 6, borderWidth: 1, borderColor: '#E2E8F0' },
    tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
    activeTab: { backgroundColor: '#fff', elevation: 3, shadowColor: '#133C55', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    tabText: { fontWeight: '700', color: '#64748B', fontSize: 13 },
    activeTabText: { color: '#133C55' },

    selectorContainer: { marginBottom: 20 },
    groupScroll: { gap: 12, paddingRight: 20 },
    bgChip: { width: 56, height: 56, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F1F5F9', elevation: 1 },
    activeBgChip: { backgroundColor: '#E11D48', borderColor: '#E11D48', elevation: 4 },
    bgText: { fontWeight: '800', color: '#64748B', fontSize: 14 },
    activeBgText: { color: '#fff' },

    placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 },
    placeholderIconBg: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#FFF5F5', alignItems: 'center', justifyContent: 'center', marginBottom: 25 },
    placeholderTitle: { fontSize: 22, fontWeight: '900', color: '#133C55', marginBottom: 8 },
    placeholderSub: { fontSize: 14, color: '#94A3B8', fontWeight: '500' },
    listContainer: { paddingBottom: 110 },
    donorCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9', elevation: 2 },
    donorInfo: { flex: 1 },
    donorName: { fontSize: 17, fontWeight: '800', color: '#1E293B' },
    donorSub: { color: '#64748B', fontSize: 13, marginTop: 2, fontWeight: '500' },
    donorDept: { color: '#94A3B8', fontSize: 11, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
    donorBadgeBg: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FEE2E2' },
    donorBadgeText: { color: '#E11D48', fontWeight: '900', fontSize: 15 },
    emptyText: { textAlign: 'center', color: '#94A3B8', fontWeight: '600' },

    emergencyBtn: { position: 'absolute', bottom: 30, right: 20, left: 20, backgroundColor: '#E11D48', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, borderRadius: 24, elevation: 8, gap: 12, shadowColor: '#E11D48', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
    emergencyText: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 36, borderTopRightRadius: 36, padding: 24, paddingBottom: 40 },
    modalHandle: { width: 40, height: 5, backgroundColor: '#E2E8F0', borderRadius: 3, alignSelf: 'center', marginBottom: 24 },
    modalHeaderSec: { alignItems: 'center', marginBottom: 24 },
    warningIconBg: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    modalTitleLarge: { fontSize: 24, fontWeight: '900', color: '#133C55' },
    modalSub: { fontSize: 14, color: '#64748B', marginTop: 4 },
    
    inputLabel: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 8, marginTop: 16 },
    input: { backgroundColor: '#F8FAFC', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', fontSize: 16, color: '#1E293B' },
    
    modalActionRow: { flexDirection: 'row', gap: 12, marginTop: 32 },
    modalCancelBtn: { flex: 1, padding: 18, borderRadius: 20, alignItems: 'center', backgroundColor: '#F1F5F9' },
    modalSendBtn: { flex: 2, padding: 18, borderRadius: 20, alignItems: 'center', backgroundColor: '#E11D48' },
    cancelBtnText: { color: '#64748B', fontWeight: '800', fontSize: 16 },
    sendBtnText: { color: '#fff', fontWeight: '900', fontSize: 16 },

    historyContainer: { flex: 1, backgroundColor: '#F8FAFC', padding: 24, paddingTop: 60 }
});
