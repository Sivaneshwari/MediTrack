import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AdminLayout from "../../components/admin/AdminLayout";
import { BASE_URL } from "../../constants/Config";

const SCREEN_WIDTH = Dimensions.get('window').width;
const DAY_WIDTH = (SCREEN_WIDTH - 60) / 7; // Adjust for padding

interface Appointment {
    id: number;
    appointment_date: string;
    reason: string;
    status: string;
    patient_type: 'student' | 'staff';
    patient_name: string;
    patient_details: string;
    priority?: string;
}

export default function Schedule() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewDate, setViewDate] = useState(new Date()); // For month navigation

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const res = await fetch(`${BASE_URL}/admin/dashboard/appointments/all`);
            if (res.ok) {
                const data = await res.json();
                setAppointments(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Calendar Helpers
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month, 1).getDay();
    };

    const changeMonth = (offset: number) => {
        const newDate = new Date(viewDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setViewDate(newDate);
    };

    const isSameDay = (d1: Date, d2: Date) => {
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    };

    // Filter appointments for selected date
    const selectedAppointments = appointments.filter(ppt => {
        const pptDate = new Date(ppt.appointment_date);
        return isSameDay(pptDate, selectedDate);
    });

    // Check if a date has appointments
    const hasAppointments = (day: number) => {
        const currentCheck = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        return appointments.some(ppt => isSameDay(new Date(ppt.appointment_date), currentCheck));
    };

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(viewDate);
        const firstDay = getFirstDayOfMonth(viewDate);
        const days = [];

        // Empty slots for previous month
        for (let i = 0; i < firstDay; i++) {
            days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
        }

        // Days
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), i);
            const isSelected = isSameDay(date, selectedDate);
            const isToday = isSameDay(date, new Date());
            const hasAppt = hasAppointments(i);

            days.push(
                <TouchableOpacity
                    key={`day-${i}`}
                    style={[
                        styles.dayCell,
                        isSelected && styles.selectedDayCell,
                        isToday && !isSelected && styles.todayCell
                    ]}
                    onPress={() => setSelectedDate(date)}
                >
                    <Text style={[
                        styles.dayText,
                        isSelected && styles.selectedDayText,
                        isToday && !isSelected && styles.todayText
                    ]}>{i}</Text>
                    {hasAppt && <View style={[styles.dot, isSelected && { backgroundColor: '#fff' }]} />}
                </TouchableOpacity>
            );
        }

        return (
            <View style={styles.calendarContainer}>
                {/* Header */}
                <View style={styles.calHeader}>
                    <TouchableOpacity onPress={() => changeMonth(-1)}>
                        <Ionicons name="chevron-back" size={24} color="#334155" />
                    </TouchableOpacity>
                    <Text style={styles.calTitle}>
                        {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </Text>
                    <TouchableOpacity onPress={() => changeMonth(1)}>
                        <Ionicons name="chevron-forward" size={24} color="#334155" />
                    </TouchableOpacity>
                </View>

                {/* Days of Week */}
                <View style={styles.weekRow}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <Text key={d} style={styles.weekDay}>{d}</Text>
                    ))}
                </View>

                {/* Grid */}
                <View style={styles.daysGrid}>
                    {days}
                </View>
            </View>
        );
    };

    return (
        <AdminLayout title="Schedule">
            <ScrollView style={{ flex: 1 }}>
                <View style={{ padding: 20 }}>
                    <Text style={styles.pageTitle}>Appointments Calendar</Text>
                    <Text style={styles.pageSub}>View and manage upcoming schedule</Text>
                </View>

                {/* Calendar */}
                {renderCalendar()}

                {/* Appointment List */}
                <View style={styles.listContainer}>
                    <Text style={styles.dateHeader}>
                        {selectedDate.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </Text>

                    {loading ? (
                        <ActivityIndicator size="small" color="#2563EB" />
                    ) : selectedAppointments.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="calendar-outline" size={48} color="#CBD5E1" />
                            <Text style={styles.emptyText}>No appointments for this day</Text>
                        </View>
                    ) : (
                        selectedAppointments.map(appt => (
                            <View key={appt.id} style={styles.apptCard}>
                                <View style={styles.timeCol}>
                                    <Text style={styles.timeText}>
                                        {new Date(appt.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </View>
                                <View style={[styles.cardContent, { borderLeftColor: appt.patient_type === 'student' ? '#3B82F6' : '#10B981' }]}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                        <Text style={styles.apptTitle}>{appt.priority || 'NORMAL'}</Text>
                                        <View style={[styles.statusBadge,
                                        appt.status === 'approved' ? styles.stApproved :
                                            appt.status === 'completed' ? styles.stCompleted :
                                                appt.status === 'cancelled' ? styles.stCancelled : styles.stPending
                                        ]}>
                                            <Text style={styles.statusText}>{appt.status}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.row}>
                                        <Ionicons name="person" size={12} color="#64748B" />
                                        <Text style={styles.patientName}>
                                            {appt.patient_name} <Text style={{ fontSize: 12, color: '#94A3B8' }}>({appt.patient_type})</Text>
                                        </Text>
                                    </View>

                                    <View style={{ marginTop: 4, padding: 8, backgroundColor: '#F8FAFC', borderRadius: 6 }}>
                                        <Text style={{ fontSize: 11, color: '#64748B', fontWeight: '600' }}>REASON:</Text>
                                        <Text style={{ fontSize: 13, color: '#334155' }}>{appt.reason || 'No reason provided'}</Text>
                                    </View>
                                </View>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        </AdminLayout>
    );
}

const styles = StyleSheet.create({
    pageTitle: { fontSize: 24, fontWeight: '700', color: '#1E293B' },
    pageSub: { color: '#64748B', marginTop: 4 },
    calendarContainer: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        borderRadius: 16,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5
    },
    calHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16
    },
    calTitle: { fontSize: 18, fontWeight: '600', color: '#1E293B' },
    weekRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 },
    weekDay: { width: 32, textAlign: 'center', color: '#94A3B8', fontSize: 12, fontWeight: '600' },
    daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    dayCell: {
        width: '14.28%', // 100% / 7
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
        borderRadius: 20
    },
    selectedDayCell: { backgroundColor: '#2563EB' },
    todayCell: { borderWidth: 1, borderColor: '#2563EB' },
    dayText: { fontSize: 14, color: '#334155' },
    selectedDayText: { color: '#fff', fontWeight: '600' },
    todayText: { color: '#2563EB', fontWeight: '600' },
    dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#EF4444', marginTop: 2 },

    listContainer: { padding: 20 },
    dateHeader: { fontSize: 16, fontWeight: '600', color: '#64748B', marginBottom: 12, textTransform: 'uppercase' },
    emptyState: { alignItems: 'center', padding: 20 },
    emptyText: { color: '#94A3B8', marginTop: 8 },

    apptCard: { flexDirection: 'row', marginBottom: 12 },
    timeCol: { width: 70, paddingTop: 10 },
    timeText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
    cardContent: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        borderLeftWidth: 4,
        elevation: 1
    },
    apptTitle: { fontSize: 15, fontWeight: '600', color: '#1E293B', marginBottom: 4 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
    patientName: { fontSize: 13, color: '#475569' },
    statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
    statusText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
    stPending: { backgroundColor: '#FEF3C7', color: '#D97706' },
    stApproved: { backgroundColor: '#DBEAFE', color: '#1D4ED8' },
    stCompleted: { backgroundColor: '#DCFCE7', color: '#15803D' },
    stCancelled: { backgroundColor: '#FEE2E2', color: '#B91C1C' }
});
