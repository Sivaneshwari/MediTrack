import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, Linking, Modal, ScrollView, Share, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from "react-native";
import AdminLayout from "../../components/admin/AdminLayout";
import { COLORS } from "../../constants/colors";
import { BASE_URL } from "../../constants/Config";

interface Appointment {
    id: number;
    full_name: string;
    staff_id: string;
    blood_group?: string;
    department?: string;
    appointment_date: string;
    reason: string;
    status: string;
    nurse_notes?: string;
}

export default function StaffAppointments() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
    const [editStatus, setEditStatus] = useState("");
    const [editNotes, setEditNotes] = useState("");

    // Dispense State
    const [inventory, setInventory] = useState<any[]>([]);
    const [showInvDropdown, setShowInvDropdown] = useState(false);
    const [selectedMedicines, setSelectedMedicines] = useState<any[]>([]);
    const [prescriptionList, setPrescriptionList] = useState<any[]>([]);
    const [period, setPeriod] = useState({ morning: false, afternoon: false, night: false });
    const [duration, setDuration] = useState("1");
    const { width } = useWindowDimensions();
    const isDesktop = width > 768;

    useEffect(() => { fetchAppointments(); }, []);

    // Fetch Inventory
    const fetchInventory = async () => {
        try {
            const res = await fetch(`${BASE_URL}/admin/dashboard/inventory`);
            if (res.ok) setInventory(await res.json());
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        if (editModalVisible) {
            fetchInventory();
        }
    }, [editModalVisible]);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/admin/dashboard/appointments/staff`);
            if (res.ok) setAppointments(await res.json());
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    const handleExport = (type: string) => {
        Linking.openURL(`${BASE_URL}/admin/dashboard/export/appointments/${type}?type=staff`).catch(() => Alert.alert("Error", "Download failed"));
    };

    const handleShare = async () => {
        try {
            const summary = appointments.map(a =>
                `${a.full_name} (${a.staff_id}) - ${a.status.toUpperCase()}\nReason: ${a.reason}\nNotes: ${a.nurse_notes || 'N/A'}`
            ).join('\n\n---\n\n');

            await Share.share({
                message: `Staff Clinical Records Summary:\n\n${summary}`,
                title: 'Share Records'
            });
        } catch (error) {
            Alert.alert('Error', 'Could not share records');
        }
    };

    const handleDelete = (id: number) => {
        Alert.alert("Confirm Delete", "Are you sure you want to delete this appointment?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete", style: "destructive", onPress: async () => {
                    try {
                        const res = await fetch(`${BASE_URL}/admin/dashboard/appointments/${id}`, { method: 'DELETE' });
                        if (res.ok) {
                            Alert.alert("Success", "Appointment deleted");
                            fetchAppointments();
                        } else Alert.alert("Error", "Failed to delete");
                    } catch (e) { Alert.alert("Error", "Network error"); }
                }
            }
        ]);
    };

    const openEditModal = (item: Appointment) => {
        setSelectedAppt(item);
        setEditStatus(item.status);
        setEditNotes(item.nurse_notes || "");
        setEditModalVisible(true);
        // Reset dispense state
        setPrescriptionList([]);
        setPeriod({ morning: false, afternoon: false, night: false });
        setDuration("1");
        setSelectedMedicines([]);
    };

    const toggleMedicine = (med: any) => {
        const exists = selectedMedicines.find(m => m.id === med.id);
        if (exists) {
            setSelectedMedicines(selectedMedicines.filter(m => m.id !== med.id));
        } else {
            setSelectedMedicines([...selectedMedicines, med]);
        }
    };

    const addToPrescription = () => {
        if (selectedMedicines.length === 0) {
            Alert.alert("Error", "Please select at least one medicine");
            return;
        }

        const perDay = (period.morning ? 1 : 0) + (period.afternoon ? 1 : 0) + (period.night ? 1 : 0);
        if (perDay === 0) {
            Alert.alert("Error", "Select at least one timing (Morning/Afternoon/Night)");
            return;
        }

        const days = parseInt(duration) || 0;
        if (days <= 0) {
            Alert.alert("Error", "Enter valid number of days");
            return;
        }

        const qty = perDay * days;

        const newItems = selectedMedicines.map(med => ({
            medicine: med,
            morning: period.morning,
            afternoon: period.afternoon,
            night: period.night,
            days: days,
            qty: qty
        }));

        setPrescriptionList([...prescriptionList, ...newItems]);

        // Reset inputs
        setSelectedMedicines([]);
        setPeriod({ morning: false, afternoon: false, night: false });
        setDuration("1");
        setShowInvDropdown(false);
    };

    const removeFromPrescription = (index: number) => {
        const newList = [...prescriptionList];
        newList.splice(index, 1);
        setPrescriptionList(newList);
    };

    const handleDispenseAll = async () => {
        if (prescriptionList.length === 0) return;

        setLoading(true);
        let notesToAdd = "\n\n[Rx Dispensed]";
        let successCount = 0;

        try {
            for (const item of prescriptionList) {
                // 1. Deduct from Inventory
                const res = await fetch(`${BASE_URL}/admin/dashboard/inventory/deduct`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        id: item.medicine.id,
                        quantity: item.qty
                    })
                });

                if (res.ok) {
                    successCount++;
                    const timingStr = [
                        item.morning ? 'Morning' : '',
                        item.afternoon ? 'Afternoon' : '',
                        item.night ? 'Night' : ''
                    ].filter(Boolean).join(' + ');

                    const shortTimingStr = [
                        item.morning ? 'M' : '',
                        item.afternoon ? 'A' : '',
                        item.night ? 'N' : ''
                    ].filter(Boolean).join('-');

                    // 2. Add to Prescriptions Table
                    try {
                        await fetch(`${BASE_URL}/admin/dashboard/prescriptions`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                appointment_id: selectedAppt?.id,
                                medicine_name: item.medicine.item_name,
                                dosage: `1 ${item.medicine.unit || 'unit'}`,
                                frequency: timingStr,
                                duration: `${item.days} days`,
                                notes: `Total Dispensed: ${item.qty}`
                            })
                        });
                    } catch (err) {
                        console.error("Failed to create prescription record", err);
                    }

                    notesToAdd += `\n• ${item.medicine.item_name}: ${shortTimingStr} x ${item.days} days (Qty: ${item.qty})`;
                }
            }

            if (successCount > 0) {
                setEditNotes(prev => prev + notesToAdd);
                Alert.alert("Dispensed", `${successCount} medicines dispensed successfully.`);
                setPrescriptionList([]); // Clear list after dispensing
                fetchInventory();
            } else {
                Alert.alert("Error", "Failed to dispense medicines");
            }

        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Network error during dispensing");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!selectedAppt) return;
        try {
            const res = await fetch(`${BASE_URL}/admin/dashboard/appointments/${selectedAppt.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: editStatus, nurse_notes: editNotes })
            });
            if (res.ok) {
                Alert.alert("Success", "Appointment updated");
                setEditModalVisible(false);
                fetchAppointments();
            } else Alert.alert("Error", "Update failed");
        } catch (e) { Alert.alert("Error", "Network error"); }
    };

    const TableHeader = () => (
        <View style={styles.tableHeader}>
            <Text style={[styles.th, { flex: 2 }]}>Staff Name</Text>
            <Text style={[styles.th, { flex: 1 }]}>Blood Group</Text>
            <Text style={[styles.th, { flex: 1.5 }]}>Department</Text>
            <Text style={[styles.th, { flex: 2 }]}>Date & Time</Text>
            <Text style={[styles.th, { flex: 2 }]}>Reason</Text>
            <Text style={[styles.th, { flex: 1 }]}>Status</Text>
            <Text style={[styles.th, { flex: 1, textAlign: 'right' }]}>Actions</Text>
        </View>
    );

    const TableRow = ({ item }: { item: Appointment }) => {
        if (!isDesktop) {
            return (
                <View style={styles.mobileCard}>
                    <View style={styles.mobileCardHeader}>
                        <View>
                            <Text style={styles.tdBold}>{item.full_name}</Text>
                            <Text style={styles.tdSub}>{item.staff_id}</Text>
                        </View>
                        <View style={[styles.statusBadge,
                        item.status === 'completed' ? styles.statusSuccess :
                            item.status === 'approved' ? styles.statusApproved :
                                item.status === 'cancelled' ? styles.statusCancelled :
                                    styles.statusPending]}>
                            <Text style={[styles.statusText,
                            item.status === 'completed' ? { color: '#10B981' } :
                                item.status === 'approved' ? { color: '#3B82F6' } :
                                    item.status === 'cancelled' ? { color: '#EF4444' } :
                                        { color: '#F59E0B' }]}>{item.status}</Text>
                        </View>
                    </View>
                    <View style={styles.mobileCardContent}>
                        <Text style={styles.td}>Dept: {item.department}</Text>
                        <Text style={styles.td}>Blood: {item.blood_group || '-'}</Text>
                        <Text style={styles.td}>{new Date(item.appointment_date).toLocaleDateString()} at {new Date(item.appointment_date).toLocaleTimeString()}</Text>
                        <Text style={[styles.td, { marginTop: 4, fontStyle: 'italic' }]}>{item.reason}</Text>
                    </View>
                    <View style={styles.mobileCardActions}>
                        <TouchableOpacity onPress={() => openEditModal(item)} style={styles.actionBtn}>
                            <Ionicons name="create-outline" size={20} color="#3B82F6" />
                            <Text style={{ color: '#3B82F6' }}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionBtn}>
                            <Ionicons name="trash-outline" size={20} color="#EF4444" />
                            <Text style={{ color: '#EF4444' }}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }

        return (
            <View style={styles.tableRow}>
                <View style={{ flex: 2 }}>
                    <Text style={styles.tdBold}>{item.full_name}</Text>
                    <Text style={styles.tdSub}>{item.staff_id}</Text>
                </View>
                <View style={{ flex: 1 }}><Text style={styles.tdBadge}>{item.blood_group || '-'}</Text></View>
                <View style={{ flex: 1.5 }}><Text style={styles.td}>{item.department}</Text></View>
                <View style={{ flex: 2 }}>
                    <Text style={styles.td}>{new Date(item.appointment_date).toLocaleDateString()}</Text>
                    <Text style={styles.tdSub}>{new Date(item.appointment_date).toLocaleTimeString()}</Text>
                </View>
                <View style={{ flex: 2 }}><Text style={styles.td} numberOfLines={1}>{item.reason}</Text></View>
                <View style={{ flex: 1 }}>
                    <View style={[styles.statusBadge,
                    item.status === 'completed' ? styles.statusSuccess :
                        item.status === 'approved' ? styles.statusApproved :
                            item.status === 'cancelled' ? styles.statusCancelled :
                                styles.statusPending]}>
                        <Text style={[styles.statusText,
                        item.status === 'completed' ? { color: '#10B981' } :
                            item.status === 'approved' ? { color: '#3B82F6' } :
                                item.status === 'cancelled' ? { color: '#EF4444' } :
                                    { color: '#F59E0B' }]}>{item.status}</Text>
                    </View>
                </View>
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
                    <TouchableOpacity onPress={() => openEditModal(item)}>
                        <Ionicons name="create-outline" size={20} color={COLORS.secondary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item.id)}>
                        <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <AdminLayout title="Staff Appointments" showSearch={false} showBackButton={true}>
            <View style={styles.topRow}>
                <View style={styles.headerRow}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.pageTitle}>Staff Clinicals</Text>
                        <Text style={styles.pageSub}>Records & Prescriptions</Text>
                    </View>
                    <View style={styles.headerActions}>
                        <TouchableOpacity style={[styles.whiteBtn, { backgroundColor: '#818CF8' }]} onPress={handleShare}>
                            <Ionicons name="share-social-outline" size={18} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.whiteBtn, { backgroundColor: '#10B981' }]} onPress={() => handleExport('excel')}>
                            <Ionicons name="download-outline" size={18} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>



            <View style={styles.tableContainer}>
                {isDesktop && <TableHeader />}
                <FlatList
                    data={appointments}
                    keyExtractor={item => item.id.toString()}
                    renderItem={({ item }) => <TableRow item={item} />}
                    ListEmptyComponent={<Text style={{ textAlign: 'center', padding: 20, color: '#94A3B8' }}>No appointments found</Text>}
                />
            </View>

            <Modal visible={editModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Update Appointment</Text>

                        <Text style={styles.label}>Status:</Text>
                        <View style={styles.statusRow}>
                            {['pending', 'approved', 'completed', 'cancelled'].map(s => (
                                <TouchableOpacity key={s} onPress={() => setEditStatus(s)} style={[styles.statusOption, editStatus === s && styles.statusActive]}>
                                    <Text style={[styles.statusOptionText, editStatus === s && styles.statusActiveText]}>{s.toUpperCase()}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.label}>Nurse Notes:</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Add clinical notes..."
                            placeholderTextColor="#94A3B8"
                            value={editNotes}
                            onChangeText={setEditNotes}
                            multiline
                        />

                        <ScrollView
                            style={{ maxHeight: 400 }}
                            nestedScrollEnabled={true}
                            keyboardShouldPersistTaps="handled"
                            contentContainerStyle={{ paddingBottom: 20 }}
                        >
                            {/* Prescription & Dispensing Section */}
                            <View style={styles.dispenseSection}>
                                <Text style={styles.sectionHeader}>Prescription</Text>

                                {/* Medicine Selector */}
                                <View style={{ zIndex: 2000, marginBottom: 15 }}>
                                    <Text style={styles.labelSmall}>Select Medicine(s)</Text>
                                    <TouchableOpacity style={styles.dropdownBtn} onPress={() => setShowInvDropdown(!showInvDropdown)}>
                                        <Text style={{ color: selectedMedicines.length > 0 ? '#1E293B' : '#94A3B8' }}>
                                            {selectedMedicines.length === 0 ? "Choose Medicine..." :
                                                selectedMedicines.length === 1 ? selectedMedicines[0].item_name :
                                                    `${selectedMedicines.length} Selected`}
                                        </Text>
                                        <Ionicons name="chevron-down" size={16} color="#64748B" />
                                    </TouchableOpacity>

                                    {showInvDropdown && (
                                        <View style={styles.dropdownList}>
                                            <ScrollView nestedScrollEnabled={true} style={{ maxHeight: 200 }}>
                                                {inventory.map((item) => {
                                                    const isSelected = selectedMedicines.some(m => m.id === item.id);
                                                    return (
                                                        <TouchableOpacity
                                                            key={item.id}
                                                            style={[styles.dropdownItem, isSelected && { backgroundColor: '#EFF6FF' }]}
                                                            onPress={() => toggleMedicine(item)}
                                                        >
                                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <Text style={{ fontSize: 13, color: isSelected ? '#3B82F6' : '#334155', fontWeight: isSelected ? '700' : '400' }}>
                                                                    {item.item_name} (Stock: {item.stock_quantity})
                                                                </Text>
                                                                {isSelected && <Ionicons name="checkmark" size={16} color="#3B82F6" />}
                                                            </View>
                                                        </TouchableOpacity>
                                                    );
                                                })}
                                            </ScrollView>
                                        </View>
                                    )}
                                </View>

                                {/* Timing & Duration */}
                                <View style={styles.timingsRow}>
                                    <TouchableOpacity
                                        style={[styles.timingChip, period.morning && styles.timingActive]}
                                        onPress={() => setPeriod(p => ({ ...p, morning: !p.morning }))}
                                    >
                                        <Text style={[styles.timingText, period.morning && styles.timingTextActive]}>Morning</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.timingChip, period.afternoon && styles.timingActive]}
                                        onPress={() => setPeriod(p => ({ ...p, afternoon: !p.afternoon }))}
                                    >
                                        <Text style={[styles.timingText, period.afternoon && styles.timingTextActive]}>Afternoon</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.timingChip, period.night && styles.timingActive]}
                                        onPress={() => setPeriod(p => ({ ...p, night: !p.night }))}
                                    >
                                        <Text style={[styles.timingText, period.night && styles.timingTextActive]}>Night</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={{ marginTop: 15 }}>
                                    <Text style={styles.labelSmall}>Duration (Days)</Text>
                                    <TextInput
                                        style={styles.inputSmall}
                                        keyboardType="numeric"
                                        value={duration}
                                        onChangeText={setDuration}
                                        placeholder="Number of days"
                                        placeholderTextColor="#94A3B8"
                                    />
                                </View>

                                <TouchableOpacity style={styles.addFullBtn} onPress={addToPrescription}>
                                    <Ionicons name="add-circle" size={20} color="#fff" />
                                    <Text style={styles.addBtnText}>Add to Prescription</Text>
                                </TouchableOpacity>

                                {/* Live Quantity Preview */}
                                <View style={{ marginTop: 10, alignItems: 'center', backgroundColor: '#F1F5F9', padding: 8, borderRadius: 6 }}>
                                    <Text style={{ fontSize: 12, color: '#475569', fontWeight: '600' }}>
                                        Daily: <Text style={{ color: '#3B82F6' }}>{(period.morning ? 1 : 0) + (period.afternoon ? 1 : 0) + (period.night ? 1 : 0)}</Text>  ×  Days: <Text style={{ color: '#3B82F6' }}>{parseInt(duration) || 0}</Text>  =  Total Qty: <Text style={{ color: '#EF4444', fontSize: 14, fontWeight: 'bold' }}>{((period.morning ? 1 : 0) + (period.afternoon ? 1 : 0) + (period.night ? 1 : 0)) * (parseInt(duration) || 0)}</Text>
                                    </Text>
                                </View>

                                {/* Added Items List */}
                                {prescriptionList.length > 0 && (
                                    <View style={styles.rxList}>
                                        <Text style={styles.labelSmall}>Current Prescription:</Text>
                                        {prescriptionList.map((item, idx) => (
                                            <View key={idx} style={styles.rxItem}>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.rxName}>{item.medicine.item_name}</Text>
                                                </View>
                                                <TouchableOpacity onPress={() => removeFromPrescription(idx)}>
                                                    <Ionicons name="close-circle" size={20} color="#EF4444" />
                                                </TouchableOpacity>
                                            </View>
                                        ))}

                                        <TouchableOpacity style={styles.dispenseBtn} onPress={handleDispenseAll}>
                                            <Ionicons name="checkmark-circle-outline" size={18} color="#FFF" />
                                            <Text style={styles.dispenseBtnText}>Dispense All ({prescriptionList.length})</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </ScrollView>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.cancelBtn}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleUpdate} style={styles.saveBtn}>
                                <Text style={styles.saveText}>Save Changes</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </AdminLayout>
    );
}

const styles = StyleSheet.create({
    topRow: { marginBottom: 20, paddingHorizontal: 20 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerActions: { flexDirection: 'row', gap: 10 },
    pageTitle: { fontSize: 24, fontWeight: '900', color: '#133C55' },
    pageSub: { color: '#64748B', fontSize: 13, marginTop: -2 },
    whiteBtn: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    btnText: { fontWeight: '700', color: '#133C55', fontSize: 12 },

    tableContainer: { flex: 1, paddingHorizontal: 20 },
    tableHeader: { flexDirection: 'row', backgroundColor: '#F8FAFC', padding: 15, borderRadius: 12, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
    th: { fontSize: 11, fontWeight: '700', color: '#64748B', textTransform: 'uppercase' },
    tableRow: { flexDirection: 'row', padding: 15, backgroundColor: '#fff', borderRadius: 12, marginBottom: 10, alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
    tdBold: { fontWeight: '700', color: '#1E293B', fontSize: 14 },
    td: { color: '#334155', fontSize: 13 },
    tdSub: { color: '#94A3B8', fontSize: 11 },
    tdBadge: { color: '#EF4444', fontWeight: '800', fontSize: 12 },

    statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, alignSelf: 'flex-start' },
    statusSuccess: { backgroundColor: '#DCFCE7' },
    statusApproved: { backgroundColor: '#DBEAFE' },
    statusCancelled: { backgroundColor: '#FEE2E2' },
    statusPending: { backgroundColor: '#FEF3C7' },
    statusText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },

    mobileCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9', elevation: 2 },
    mobileCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    mobileCardContent: { marginBottom: 12, gap: 4 },
    mobileCardActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 10, justifyContent: 'flex-end', gap: 15 },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 4 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '95%' },
    modalTitle: { fontSize: 24, fontWeight: '900', color: '#133C55', marginBottom: 20, textAlign: 'center' },
    label: { fontSize: 14, fontWeight: '700', color: '#475569', marginBottom: 10, marginTop: 10 },
    labelSmall: { fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 6 },
    
    statusRow: { flexDirection: 'row', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
    statusOption: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' },
    statusActive: { backgroundColor: '#133C55', borderColor: '#133C55' },
    statusOptionText: { fontSize: 11, fontWeight: '700', color: '#64748B' },
    statusActiveText: { color: '#fff' },

    modalInput: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 14, fontSize: 14, borderWidth: 1, borderColor: '#E2E8F0', color: '#1E293B', minHeight: 80, textAlignVertical: 'top' },
    
    dispenseSection: { backgroundColor: '#F1F5F9', padding: 16, borderRadius: 16, marginTop: 10, marginBottom: 20 },
    sectionHeader: { fontSize: 14, fontWeight: '800', color: '#1E293B', marginBottom: 12, textTransform: 'uppercase' },
    
    dropdownBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', padding: 14, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    dropdownList: { backgroundColor: '#fff', borderRadius: 12, marginTop: 5, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden', elevation: 3 },
    dropdownItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    
    timingsRow: { flexDirection: 'row', gap: 6, marginTop: 10 },
    timingChip: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
    timingActive: { backgroundColor: '#133C55', borderColor: '#133C55' },
    timingText: { fontSize: 11, fontWeight: '700', color: '#64748B' },
    timingTextActive: { color: '#fff' },
    
    inputSmall: { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', fontSize: 15, color: '#1E293B' },
    addFullBtn: { backgroundColor: '#E11D48', paddingVertical: 14, borderRadius: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 15, elevation: 4, shadowColor: '#E11D48', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
    addBtnText: { color: '#fff', fontWeight: '900', fontSize: 15 },
    
    rxList: { marginTop: 20, borderTopWidth: 1, borderTopColor: '#CBD5E1', paddingTop: 15 },
    rxItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0' },
    rxName: { fontSize: 13, fontWeight: '700', color: '#133C55' },
    dispenseBtn: { backgroundColor: '#10B981', padding: 14, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 10 },
    dispenseBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
    
    modalButtons: { flexDirection: 'row', gap: 12, marginTop: 20 },
    cancelBtn: { flex: 1, padding: 16, borderRadius: 16, backgroundColor: '#F1F5F9', alignItems: 'center' },
    saveBtn: { flex: 2, padding: 16, borderRadius: 16, backgroundColor: '#133C55', alignItems: 'center' },
    cancelText: { color: '#64748B', fontWeight: '700', fontSize: 16 },
    saveText: { color: '#fff', fontWeight: '800', fontSize: 16 }
});
