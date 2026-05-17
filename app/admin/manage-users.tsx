import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from "react-native";
import AdminLayout from "../../components/admin/AdminLayout";
import CustomCalendar from "../../components/ui/CustomCalendar";
import { BASE_URL } from "../../constants/Config";

interface User {
    student_id?: string;
    staff_id?: string;
    full_name: string;
    department: string;
    shift: string;
    blood_group: string;
    dob?: string;
}

export default function ManageUsers() {
    const [activeTab, setActiveTab] = useState<'student' | 'staff'>('student');
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [editUser, setEditUser] = useState<User | null>(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [addModalVisible, setAddModalVisible] = useState(false);

    // Form States
    const [formId, setFormId] = useState("");
    const [formName, setFormName] = useState("");
    const [formDept, setFormDept] = useState("");
    const [formShift, setFormShift] = useState("");
    const [formBlood, setFormBlood] = useState("");
    const [formDob, setFormDob] = useState(new Date());
    const [showFormDatePicker, setShowFormDatePicker] = useState(false);


    const { width } = useWindowDimensions();
    const params = useLocalSearchParams();

    useEffect(() => {
        fetchUsers();
    }, [activeTab]);

    useEffect(() => {
        if (params.action === 'add') {
            const type = params.type as 'student' | 'staff';
            if (type) setActiveTab(type);
            
            // Short delay to ensure tab has switched before opening modal
            setTimeout(() => {
                openAddModal();
            }, 100);
        }
    }, [params]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const endpoint = activeTab === 'student' ? '/admin/dashboard/users/students' : '/admin/dashboard/users/staff';
            const res = await fetch(`${BASE_URL}${endpoint}`);
            if (res.ok) {
                setUsers(await res.json());
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: string) => {
        Alert.alert(
            "Confirm Delete",
            `Are you sure you want to delete this ${activeTab}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const res = await fetch(`${BASE_URL}/admin/dashboard/users/${activeTab}/${id}`, {
                                method: 'DELETE'
                            });
                            if (res.ok) {
                                Alert.alert("Success", "User deleted");
                                fetchUsers();
                            } else {
                                Alert.alert("Error", "Failed to delete user");
                            }
                        } catch (error) {
                            console.error(error);
                        }
                    }
                }
            ]
        );
    };

    const openEditModal = (user: User) => {
        setEditUser(user);
        setFormId(activeTab === 'student' ? user.student_id! : user.staff_id!);
        setFormName(user.full_name || "");
        setFormDept(user.department || "");
        setFormShift(user.shift || "");
        setFormBlood(user.blood_group || "");

        // Parse DOB
        let initialDate = new Date();
        if (user.dob) {
            if (user.dob.includes('/')) {
                // Handle DD/MM/YYYY
                const parts = user.dob.split('/');
                if (parts.length === 3) {
                    initialDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                }
            } else {
                // Handle ISO string or YYYY-MM-DD
                const parsed = new Date(user.dob);
                if (!isNaN(parsed.getTime())) {
                    initialDate = parsed;
                }
            }
        }
        setFormDob(initialDate);
        setEditModalVisible(true);
    };

    const openAddModal = () => {
        setFormId("");
        setFormName("");
        setFormDept("");
        setFormShift("");
        setFormBlood("");
        setFormDob(new Date());
        setAddModalVisible(true);
    };

    const handleCreate = async () => {
        if (!formId || !formName) {
            Alert.alert("Error", "ID and Full Name are required");
            return;
        }

        const day = formDob.getDate().toString().padStart(2, '0');
        const month = (formDob.getMonth() + 1).toString().padStart(2, '0');
        const year = formDob.getFullYear();
        const formattedDate = `${day}/${month}/${year}`;

        try {
            const res = await fetch(`${BASE_URL}/admin/dashboard/users/${activeTab}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: formId,
                    full_name: formName,
                    department: formDept,
                    shift: formShift,
                    blood_group: formBlood,
                    dob: formattedDate
                })
            });

            const data = await res.json();
            if (res.ok) {
                Alert.alert("Success", data.message);
                setAddModalVisible(false);
                fetchUsers();
            } else {
                Alert.alert("Error", data.message || "Failed to add user");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Server error while adding user");
        }
    };

    const handleFormDateChange = (event: any, date?: Date) => {
        if (Platform.OS === 'android') {
            setShowFormDatePicker(false);
        }
        if (date) {
            setFormDob(date);
        }
    };

    const handleUpdate = async () => {
        if (!editUser) return;
        const id = activeTab === 'student' ? editUser.student_id : editUser.staff_id;

        // Format Date to YYYY-MM-DD for Backend Compatibility
        // (Controller handles conversion to DD/MM/YYYY for login check)
        const day = formDob.getDate().toString().padStart(2, '0');
        const month = (formDob.getMonth() + 1).toString().padStart(2, '0');
        const year = formDob.getFullYear();
        const formattedDate = `${year}-${month}-${day}`;

        try {
            const res = await fetch(`${BASE_URL}/admin/dashboard/users/${activeTab}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    full_name: formName,
                    department: formDept,
                    shift: formShift,
                    blood_group: formBlood,
                    dob: formattedDate
                })
            });

            if (res.ok) {
                Alert.alert("Success", "User updated successfully");
                setEditModalVisible(false);
                fetchUsers();
            } else {
                Alert.alert("Error", "Failed to update user");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Server error while updating");
        }
    };

    const UserRow = ({ item }: { item: User }) => {
        const id = activeTab === 'student' ? item.student_id : item.staff_id;
        const isSmall = width < 450;
        
        return (
            <View style={styles.card}>
                <View style={[styles.info, isSmall && { flexDirection: 'column', alignItems: 'flex-start' }]}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{item.full_name?.charAt(0)}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: isSmall ? 0 : 15, marginTop: isSmall ? 10 : 0 }}>
                        <Text style={styles.name} numberOfLines={1}>{item.full_name}</Text>
                        <Text style={styles.sub} numberOfLines={1}>ID: {id}</Text>
                        <Text style={styles.sub} numberOfLines={1}>Dept: {item.department}</Text>
                        <Text style={styles.sub} numberOfLines={1}>Shift: {item.shift} • Blood: {item.blood_group}</Text>
                    </View>
                </View>
                <View style={[styles.actions, isSmall && { flexDirection: 'column', alignSelf: 'center' }]}>
                    <TouchableOpacity onPress={() => openEditModal(item)} style={[styles.actionBtn, styles.editBtn]}>
                        <Ionicons name="pencil-outline" size={18} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(id!)} style={[styles.actionBtn, styles.deleteBtn]}>
                        <Ionicons name="trash-outline" size={18} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <AdminLayout title="Manage Users" showBackButton={true}>
            <View style={styles.header}>
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.title}>User Management</Text>
                        <Text style={styles.subtitle}>View, edit, and manage registered {activeTab}s</Text>
                    </View>
                    <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
                        <Ionicons name="person-add-outline" size={20} color="#fff" />
                        <Text style={styles.addBtnText}>Add {activeTab}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'student' && styles.activeTab]}
                    onPress={() => setActiveTab('student')}
                >
                    <Text style={[styles.tabText, activeTab === 'student' && styles.activeTabText]}>Students</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'staff' && styles.activeTab]}
                    onPress={() => setActiveTab('staff')}
                >
                    <Text style={[styles.tabText, activeTab === 'staff' && styles.activeTabText]}>Staff</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={users}
                keyExtractor={(item) => (activeTab === 'student' ? item.student_id : item.staff_id) || Math.random().toString()}
                renderItem={({ item }) => <UserRow item={item} />}
                contentContainerStyle={{ paddingBottom: 100 }}
                ListEmptyComponent={<Text style={styles.empty}>No users found.</Text>}
            />

            {/* Edit Modal */}
            <Modal
                visible={editModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Edit {activeTab === 'student' ? 'Student' : 'Staff'}</Text>

                        <ScrollView contentContainerStyle={styles.form}>
                            <Text style={[styles.label, { color: '#94A3B8' }]}>{activeTab === 'student' ? 'Student' : 'Staff'} ID (Locked)</Text>
                            <TextInput style={[styles.input, { backgroundColor: '#F1F5F9', color: '#64748B' }]} value={formId} editable={false} />

                            <Text style={styles.label}>Full Name</Text>
                            <TextInput style={styles.input} value={formName} onChangeText={setFormName} />

                            <Text style={styles.label}>Department</Text>
                            <TextInput style={styles.input} value={formDept} onChangeText={setFormDept} />

                            <Text style={styles.label}>Shift</Text>
                            <TextInput style={styles.input} value={formShift} onChangeText={setFormShift} />

                            <Text style={styles.label}>Blood Group</Text>
                            <TextInput style={styles.input} value={formBlood} onChangeText={setFormBlood} />

                            <Text style={styles.label}>Date of Birth (Password)</Text>
                            {Platform.OS === 'web' ? (
                                <View style={styles.dateBtn}>
                                    <Text style={[styles.dateBtnText, { color: '#64748B', fontSize: 13, marginBottom: 5 }]}>
                                        Select Date (DD/MM/YYYY)
                                    </Text>
                                    <input
                                        type="date"
                                        value={formDob.toISOString().split('T')[0]}
                                        style={{
                                            padding: 10,
                                            fontSize: 16,
                                            borderRadius: 5,
                                            border: '1px solid #CBD5E1',
                                            width: '100%',
                                            backgroundColor: '#F1F5F9',
                                            cursor: 'pointer'
                                        }}
                                        onChange={(e) => setFormDob(e.target.valueAsDate || new Date())}
                                    />
                                </View>
                            ) : (
                                <>
                                    <TouchableOpacity
                                        style={styles.dateBtn}
                                        onPress={() => setShowFormDatePicker(true)}
                                    >
                                        <Text style={styles.dateBtnText}>
                                            {formDob.toLocaleDateString('en-GB')}
                                        </Text>
                                        <Ionicons name="calendar-outline" size={20} color="#475569" />
                                    </TouchableOpacity>

                                    {showFormDatePicker && (
                                        <CustomCalendar
                                            visible={showFormDatePicker}
                                            onClose={() => setShowFormDatePicker(false)}
                                            onSelect={(d) => {
                                                setShowFormDatePicker(false);
                                                setFormDob(d);
                                            }}
                                            selectedDate={formDob}
                                            maxDate={new Date()}
                                        />
                                    )}
                                </>
                            )}
                        </ScrollView>


                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModalVisible(false)}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate}>
                                <Text style={styles.saveText}>Save Changes</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Add Modal */}
            <Modal
                visible={addModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setAddModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Add New {activeTab === 'student' ? 'Student' : 'Staff'}</Text>

                        <ScrollView contentContainerStyle={styles.form}>
                            <Text style={styles.label}>{activeTab === 'student' ? 'Student' : 'Staff'} ID *</Text>
                            <TextInput style={styles.input} value={formId} onChangeText={setFormId} placeholder="e.g. S123456" />

                            <Text style={styles.label}>Full Name *</Text>
                            <TextInput style={styles.input} value={formName} onChangeText={setFormName} placeholder="Enter Full Name" />

                            <Text style={styles.label}>Department</Text>
                            <TextInput style={styles.input} value={formDept} onChangeText={setFormDept} placeholder="e.g. Computer Science" />

                            <Text style={styles.label}>Shift</Text>
                            <TextInput style={styles.input} value={formShift} onChangeText={setFormShift} placeholder="e.g. Day/Evening" />

                            <Text style={styles.label}>Blood Group</Text>
                            <TextInput style={styles.input} value={formBlood} onChangeText={setFormBlood} placeholder="e.g. O+" />

                            <Text style={styles.label}>Date of Birth (Default Password) *</Text>
                            {Platform.OS === 'web' ? (
                                <View style={styles.dateBtn}>
                                    <Text style={[styles.dateBtnText, { color: '#64748B', fontSize: 13, marginBottom: 5 }]}>
                                        Select Date (DD/MM/YYYY)
                                    </Text>
                                    <input
                                        type="date"
                                        value={formDob.toISOString().split('T')[0]}
                                        style={{
                                            padding: 10,
                                            fontSize: 16,
                                            borderRadius: 5,
                                            border: '1px solid #CBD5E1',
                                            width: '100%',
                                            backgroundColor: '#F1F5F9',
                                            cursor: 'pointer'
                                        }}
                                        onChange={(e) => setFormDob(e.target.valueAsDate || new Date())}
                                    />
                                </View>
                            ) : (
                                <>
                                    <TouchableOpacity
                                        style={styles.dateBtn}
                                        onPress={() => setShowFormDatePicker(true)}
                                    >
                                        <Text style={styles.dateBtnText}>
                                            {formDob.toLocaleDateString('en-GB')}
                                        </Text>
                                        <Ionicons name="calendar-outline" size={20} color="#475569" />
                                    </TouchableOpacity>

                                    {showFormDatePicker && (
                                        <CustomCalendar
                                            visible={showFormDatePicker}
                                            onClose={() => setShowFormDatePicker(false)}
                                            onSelect={(d) => {
                                                setShowFormDatePicker(false);
                                                setFormDob(d);
                                            }}
                                            selectedDate={formDob}
                                            maxDate={new Date()}
                                        />
                                    )}
                                </>
                            )}
                        </ScrollView>


                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setAddModalVisible(false)}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveBtn} onPress={handleCreate}>
                                <Text style={styles.saveText}>Add {activeTab}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </AdminLayout >
    );
}

const styles = StyleSheet.create({
    header: { marginBottom: 20, paddingHorizontal: 20 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#133C55', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    addBtnText: { color: '#fff', fontWeight: '700', marginLeft: 8, fontSize: 13 },
    title: { fontSize: 26, fontWeight: '900', color: '#133C55' },
    subtitle: { color: '#64748B', marginTop: 5, fontSize: 13 },
    tabs: { flexDirection: 'row', backgroundColor: '#F1F5F9', padding: 6, borderRadius: 14, marginBottom: 20, marginHorizontal: 20 },
    tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
    activeTab: { backgroundColor: '#fff', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
    tabText: { fontWeight: '700', color: '#64748B', fontSize: 14 },
    activeTabText: { color: '#133C55' },
    card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 12, marginHorizontal: 20, borderWidth: 1, borderColor: '#F1F5F9', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10 },
    info: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    avatar: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#E0F2FE', justifyContent: 'center', alignItems: 'center' },
    avatarText: { fontSize: 18, fontWeight: '800', color: '#0369A1' },
    name: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
    sub: { fontSize: 13, color: '#64748B', marginTop: 2 },
    actions: { flexDirection: 'row', gap: 8, marginLeft: 10 },
    actionBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    editBtn: { backgroundColor: '#0369A1' },
    deleteBtn: { backgroundColor: '#BE123C' },
    empty: { textAlign: 'center', marginTop: 40, color: '#94A3B8', fontSize: 15 },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, width: '100%', maxHeight: '90%', elevation: 10 },
    modalTitle: { fontSize: 24, fontWeight: '900', marginBottom: 24, textAlign: 'center', color: '#133C55' },
    form: { paddingBottom: 20 },
    label: { fontSize: 14, fontWeight: '700', color: '#444', marginBottom: 8, marginTop: 10 },
    input: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 14, fontSize: 16, borderWidth: 1, borderColor: '#E2E8F0', color: '#1E293B' },
    modalActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
    cancelBtn: { flex: 1, padding: 16, borderRadius: 16, backgroundColor: '#F1F5F9', alignItems: 'center' },
    saveBtn: { flex: 2, padding: 16, borderRadius: 16, backgroundColor: '#133C55', alignItems: 'center' },
    cancelText: { color: '#64748B', fontWeight: '700', fontSize: 16 },
    saveText: { color: '#fff', fontWeight: '800', fontSize: 16 },
    dateBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#E2E8F0' },
    dateBtnText: { color: '#1E293B', fontSize: 16, fontWeight: '500' }
});
