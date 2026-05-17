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

export default function HistoryDetailScreen() {
    const params = useLocalSearchParams();
    const {
        medicine_name,
        dosage,
        frequency,
        duration,
        notes,
        appointment_date,
        doctor_name // Optional if available
    } = params;

    const date = new Date(appointment_date as string);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Prescription Details</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Date Badge */}
                <View style={styles.dateBadge}>
                    <Ionicons name="calendar" size={18} color={COLORS.primary} />
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

                {/* Main Card */}
                <View style={styles.card}>
                    <View style={styles.medicineHeader}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="medkit" size={32} color="#fff" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Medicine</Text>
                            <Text style={styles.medicineName}>{medicine_name}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.row}>
                        <View style={styles.col}>
                            <Text style={styles.label}>Dosage</Text>
                            <Text style={styles.value}>{dosage}</Text>
                        </View>
                        <View style={styles.col}>
                            <Text style={styles.label}>Frequency</Text>
                            <Text style={styles.value}>{frequency}</Text>
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.col}>
                            <Text style={styles.label}>Duration</Text>
                            <Text style={styles.value}>{duration}</Text>
                        </View>
                        <View style={styles.col}>
                            {/* Placeholder for future Doctor info */}
                            <Text style={styles.label}>Status</Text>
                            <View style={styles.statusBadge}>
                                <Text style={styles.statusText}>COMPLETED</Text>
                            </View>
                        </View>
                    </View>

                    {notes ? (
                        <View style={styles.notesContainer}>
                            <Text style={styles.label}>Doctor's Notes</Text>
                            <Text style={styles.notesText}>{notes}</Text>
                        </View>
                    ) : null}
                </View>

                {/* Additional Info / Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Prescribed by MediTrack Clinic</Text>
                    <Text style={styles.footerSubText}>Always follow the prescribed dosage.</Text>
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
        padding: 24,
    },
    dateBadge: {
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: 24,
        gap: 4
    },
    dateText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
    },
    timeText: {
        fontSize: 14,
        color: COLORS.textLight,
    },
    card: {
        backgroundColor: COLORS.card,
        borderRadius: 24,
        padding: 24,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
        elevation: 8,
    },
    medicineHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 16,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 18,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    medicineName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    label: {
        fontSize: 12,
        textTransform: 'uppercase',
        color: '#94A3B8',
        fontWeight: '600',
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    col: {
        flex: 1,
    },
    value: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
    },
    statusBadge: {
        backgroundColor: '#D1FAE5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#047857',
    },
    notesContainer: {
        backgroundColor: '#F8FAFC',
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.accent,
    },
    notesText: {
        fontSize: 15,
        color: COLORS.text,
        lineHeight: 22,
        fontStyle: 'italic',
    },
    footer: {
        marginTop: 40,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textLight,
        marginBottom: 4,
    },
    footerSubText: {
        fontSize: 12,
        color: '#CBD5E1',
    },
});
