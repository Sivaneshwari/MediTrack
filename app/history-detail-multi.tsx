import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
    Dimensions,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from "../constants/colors";

const { width } = Dimensions.get('window');

export default function HistoryDetailMultiScreen() {
    const params = useLocalSearchParams();
    const { appointmentData } = params;

    // Parse the data
    let data: any = {};
    try {
        data = JSON.parse(appointmentData as string);
    } catch (e) {
        console.error("Failed to parse", e);
    }

    const date = new Date(data.date);
    const items = data.items || [];

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Visit Details</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Date Badge */}
                <View style={styles.dateSection}>
                    <View style={styles.calendarIcon}>
                        <Ionicons name="calendar" size={24} color="#fff" />
                    </View>
                    <View>
                        <Text style={styles.dateText}>
                            {date.toLocaleDateString('en-GB', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </Text>
                        <Text style={styles.timeText}>
                            {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>
                </View>

                {/* Reason Section */}
                {/* Reason Section */}
                <View style={styles.reasonCard}>
                    <Text style={styles.reasonLabel}>Reason for Visit:</Text>
                    <Text style={styles.reasonText}>{data.reason || "Not specified"}</Text>
                </View>

                <Text style={styles.sectionTitle}>Prescribed Medicines</Text>

                {items.map((item: any, index: number) => (
                    <View key={index} style={styles.card}>
                        <View style={styles.medicineHeader}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="medkit" size={24} color={COLORS.primaryLight} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.medicineName}>Medicine: {item.medicine_name}</Text>
                                <Text style={styles.subText}>{item.dosage} • {item.frequency}</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                            <Text style={styles.label}>Duration:</Text>
                            <Text style={styles.value}>{item.duration}</Text>
                        </View>

                        {item.notes ? (
                            <View style={styles.notesContainer}>
                                <Text style={styles.label}>Note:</Text>
                                <Text style={styles.notesText}>{item.notes}</Text>
                            </View>
                        ) : null}
                    </View>
                ))}

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Total Medicines: {items.length}</Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingTop: Platform.OS === 'android' ? 35 : 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: COLORS.background,
    },
    backBtn: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
    },
    content: {
        padding: 20,
    },
    dateSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    calendarIcon: {
        width: 50,
        height: 50,
        borderRadius: 14,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    dateText: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
    },
    timeText: {
        fontSize: 14,
        color: COLORS.textLight,
        marginTop: 2
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 16,
        marginLeft: 4
    },
    card: {
        backgroundColor: COLORS.card,
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 4,
        borderWidth: 1,
        borderColor: COLORS.border
    },
    medicineHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    medicineName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    subText: {
        fontSize: 14,
        color: COLORS.textLight,
        marginTop: 2
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        color: '#94A3B8',
        fontWeight: '600',
        marginRight: 8
    },
    value: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.text,
    },
    notesContainer: {
        backgroundColor: '#F8FAFC',
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
        flexDirection: 'row'
    },
    notesText: {
        fontSize: 14,
        color: COLORS.text,
        fontStyle: 'italic',
        flex: 1,
        lineHeight: 20
    },
    footer: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40
    },
    footerText: {
        color: '#CBD5E1',
        fontWeight: '600'
    },
    reasonCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.primary,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    reasonLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 4,
        textTransform: 'uppercase'
    },
    reasonText: {
        fontSize: 16,
        color: COLORS.text,
        lineHeight: 24
    }
});
