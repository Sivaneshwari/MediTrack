
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AdminLayout from '../../components/admin/AdminLayout';
import { COLORS } from '../../constants/colors';

interface NotificationItem {
    id: string;
    title: string;
    message: string;
    time: string;
    type: 'warning' | 'info' | 'success' | 'danger';
    icon: keyof typeof Ionicons.glyphMap;
}

export default function NotificationsScreen() {
    const notifications: NotificationItem[] = [
        {
            id: '1',
            title: 'Low Stock Alert',
            message: 'Paracetamol 500mg is below 10% inventory level.',
            time: '10 mins ago',
            type: 'warning',
            icon: 'cube'
        },
        {
            id: '2',
            title: 'New Visit Request',
            message: 'A student has requested an appointment for tomorrow.',
            time: '1 hour ago',
            type: 'info',
            icon: 'calendar'
        },
        {
            id: '3',
            title: 'Blood Bank Update',
            message: '3 units of O+ blood have been added after donation.',
            time: '3 hours ago',
            type: 'success',
            icon: 'water'
        }
    ];

    const getIconColor = (type: NotificationItem['type']) => {
        switch (type) {
            case 'warning': return COLORS.warning || '#f1c40f';
            case 'success': return '#10B981';
            case 'danger': return COLORS.danger || '#e74c3c';
            default: return COLORS.secondary || '#386FA4';
        }
    };

    return (
        <AdminLayout title="Notifications" showBackButton={true} showSearch={false}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Notifications</Text>
                    <TouchableOpacity>
                        <Text style={styles.markRead}>Mark all as read</Text>
                    </TouchableOpacity>
                </View>

                {notifications.map((item) => (
                    <TouchableOpacity key={item.id} style={styles.card}>
                        <View style={[styles.iconContainer, { backgroundColor: getIconColor(item.type) + '15' }]}>
                            <Ionicons name={item.icon} size={24} color={getIconColor(item.type)} />
                        </View>
                        <View style={styles.content}>
                            <Text style={styles.cardTitle}>{item.title}</Text>
                            <Text style={styles.message}>{item.message}</Text>
                            <Text style={styles.time}>{item.time}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </AdminLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: COLORS.primary,
    },
    markRead: {
        color: COLORS.secondary,
        fontWeight: '700',
        fontSize: 14,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(19, 60, 85, 0.05)',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 1,
    },
    iconContainer: {
        width: 52,
        height: 52,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        marginLeft: 16,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.primary,
    },
    message: {
        fontSize: 13,
        color: COLORS.textLight,
        marginTop: 2,
        lineHeight: 18,
    },
    time: {
        fontSize: 11,
        color: COLORS.muted,
        marginTop: 6,
        fontWeight: '600',
    }
});
