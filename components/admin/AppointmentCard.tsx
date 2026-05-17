import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function AppointmentCard({ appointment, onPress }) {
    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return '#3B82F6';
            case 'completed': return '#10B981';
            case 'cancelled': return '#EF4444';
            default: return '#F59E0B';
        }
    };

    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.name}>{appointment.full_name}</Text>
                    <Text style={styles.id}>{appointment.student_id || appointment.staff_id} • {appointment.department}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: getStatusColor(appointment.status) + '20' }]}>
                    <Text style={[styles.status, { color: getStatusColor(appointment.status) }]}>
                        {appointment.status.toUpperCase()}
                    </Text>
                </View>
            </View>

            <View style={styles.dateRow}>
                <Ionicons name="calendar-outline" size={16} color="#64748B" />
                <Text style={styles.date}>
                    {new Date(appointment.appointment_date).toLocaleString()}
                </Text>
            </View>

            <View style={styles.divider} />

            <Text style={styles.reason} numberOfLines={2}>
                <Text style={{ fontWeight: '600' }}>Reason: </Text>
                {appointment.reason}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        elevation: 1,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 10
    },
    name: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1E293B"
    },
    id: {
        fontSize: 13,
        color: "#64748B",
        marginTop: 2
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6
    },
    status: {
        fontSize: 10,
        fontWeight: "700"
    },
    dateRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10
    },
    date: {
        marginLeft: 6,
        fontSize: 14,
        color: "#64748B"
    },
    divider: {
        height: 1,
        backgroundColor: "#F1F5F9",
        marginBottom: 10
    },
    reason: {
        fontSize: 14,
        color: "#475569",
        lineHeight: 20
    }
});
