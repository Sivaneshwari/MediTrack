
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from "react";
import {
    Alert,
    Modal,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { COLORS } from '../constants/colors';
import ActionButton from './ui/ActionButton';
import CustomCalendar from './ui/CustomCalendar';

interface BookingModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    userRole: 'student' | 'staff';
    initialDate?: Date;
    initialReason?: string;
    initialPriority?: 'Casual' | 'High' | 'Emergency';
    initialBookForStudent?: boolean;
}


export default function BookingModal({ visible, onClose, onSubmit, userRole, initialDate, initialReason, initialPriority, initialBookForStudent }: BookingModalProps) {

    const [date, setDate] = useState(initialDate || new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Time State
    const [time, setTime] = useState(new Date());
    const [showTimePicker, setShowTimePicker] = useState(false);

    // Form Fields
    const [reason, setReason] = useState(initialReason || "");

    // Staff Specific
    const [bookForStudent, setBookForStudent] = useState(false);
    const [targetStudentId, setTargetStudentId] = useState("");
    const [priority, setPriority] = useState<'Casual' | 'High' | 'Emergency'>(initialPriority || 'Casual');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            setDate(initialDate || new Date());
            setReason(initialReason || "");
            setBookForStudent(initialBookForStudent || false);
            setTargetStudentId("");
            setPriority(initialPriority || 'Casual');
            setLoading(false);


            // Set default time to next hour, clamped to 9-17
            let nextHour = new Date();
            nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);

            const hours = nextHour.getHours();
            if (hours < 9) {
                nextHour.setHours(9, 0, 0, 0);
            } else if (hours >= 17) {
                // If it's past 5 PM, maybe set to 9 AM of next day? 
                // For simplicity, just set to 9 AM of current selected date (which might be in past if we don't change date, but usually date is today/future)
                // Let's just clamp to 17:00 or 9:00. 
                // User can change date.
                nextHour.setHours(9, 0, 0, 0);
            }
            setTime(nextHour);
        }
    }, [visible, initialDate]);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const dateStr = date.toISOString().split('T')[0];
            const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

            // Validate Time (Double Check)
            const hours = time.getHours();
            if (hours < 9 || hours >= 17) {
                Alert.alert("Invalid Time", "Please select a time between 9:00 AM and 5:00 PM.");
                setLoading(false);
                return;
            }

            const payload: any = {
                date: dateStr,
                time: timeStr,
                reason,
            };

            if (userRole === 'staff') {
                payload.role = bookForStudent ? 'student' : 'staff';
                if (bookForStudent) payload.student_id = targetStudentId;
            } else {
                // For students, allow Casual or Emergency (pre-set)
                // If priority is High, default to Casual?
                payload.priority = priority;
            }

            await onSubmit(payload);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Book Appointment</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close-circle" size={28} color={COLORS.textLight} />
                        </TouchableOpacity>
                    </View>

                    {/* Emergency Banner */}
                    {priority === 'Emergency' && (
                        <View style={{ backgroundColor: '#FEE2E2', padding: 12, borderRadius: 12, marginBottom: 16, alignItems: 'center' }}>
                            <Text style={{ color: COLORS.danger, fontWeight: '700' }}>⚠️ EMERGENCY BOOKING</Text>
                        </View>
                    )}

                    {/* Staff: Book for Student Switch */}
                    {userRole === 'staff' && (
                        <View style={styles.switchContainer}>
                            <Text style={styles.label}>Book for Student?</Text>
                            <Switch
                                value={bookForStudent}
                                onValueChange={setBookForStudent}
                                trackColor={{ false: '#E2E8F0', true: COLORS.secondary }}
                                thumbColor={COLORS.white}
                            />
                        </View>
                    )}

                    {/* Staff: Student ID Input */}
                    {userRole === 'staff' && bookForStudent && (
                        <View style={styles.inputContainer}>
                            <Ionicons name="person-outline" size={20} color={COLORS.textLight} />
                            <TextInput
                                style={styles.textInput}
                                placeholder="Enter Student ID"
                                value={targetStudentId}
                                onChangeText={setTargetStudentId}
                                autoCapitalize="characters"
                            />
                        </View>
                    )}

                    {/* Date Picker */}
                    <Text style={styles.label}>Date & Time</Text>
                    <View style={styles.row}>
                        <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowDatePicker(true)}>
                            <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
                            <Text style={styles.pickerText}>{date.toLocaleDateString()}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowTimePicker(true)}>
                            <Ionicons name="time-outline" size={20} color={COLORS.primary} />
                            <Text style={styles.pickerText}>
                                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Custom Calendar Modal */}
                    <CustomCalendar
                        visible={showDatePicker}
                        onClose={() => setShowDatePicker(false)}
                        onSelect={(d) => {
                            setDate(d);
                            // Sync status of time to the new date so validation works
                            const newTime = new Date(time);
                            newTime.setFullYear(d.getFullYear(), d.getMonth(), d.getDate());

                            // Optional: check if newTime is within bounds
                            const h = newTime.getHours();
                            if (h < 9) newTime.setHours(9, 0, 0, 0);
                            if (h >= 17) newTime.setHours(9, 0, 0, 0);

                            setTime(newTime);
                            setShowDatePicker(false);
                        }}
                        selectedDate={date}
                        minDate={new Date()}
                    />

                    {showTimePicker && (
                        (() => {
                            // Calculate bounds for the selected date
                            // We must ensure the 'value' passed to DateTimePicker is relatively valid
                            // i.e. it has the same date as min/max if we want time-only restriction to work reliably

                            const minTime = new Date(date);
                            minTime.setHours(9, 0, 0, 0);

                            const maxTime = new Date(date);
                            maxTime.setHours(17, 0, 0, 0);

                            // Ensure 'value' is on the correct date
                            const pickerValue = new Date(time);
                            pickerValue.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());

                            return (
                                <DateTimePicker
                                    value={pickerValue}
                                    mode="time"
                                    is24Hour={false} // Force 12h for ease? Or system default. 
                                    // minimumDate/maximumDate with mode="time" works on iOS to restrict wheels.
                                    // On Android, it might just validate.
                                    // IMPORTANT: The date part of min/max MUST match the date part of value.
                                    minimumDate={minTime}
                                    maximumDate={maxTime}
                                    onChange={(e, d) => {
                                        setShowTimePicker(false);
                                        if (d) {
                                            // d comes back with the date set to... whatever the picker used. 
                                            // usually today or the date we passed in value.

                                            // Force date part to match selected date state
                                            const finalTime = new Date(d);
                                            finalTime.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());

                                            const hours = finalTime.getHours();
                                            const mins = finalTime.getMinutes();

                                            // Check strict bounds (9:00 - 17:00)
                                            // 17:00 is technically allowed as 'start time'? Usually 5pm is closing. 
                                            // Let's assume last appt is 4:30? Or 5:00 is straight up "Office Closed".
                                            // Requirement says "9:00AM to 5pm". 
                                            // We'll allow 17:00 as the absolute boundary but typically alerts triggers if >= 17

                                            if (hours < 9 || (hours >= 17 && mins > 0) || hours > 17) {
                                                // Allow 17:00:00 exactly? Or strictly < 17?
                                                // Code below used >= 17 before. Let's stick to strict < 17 for appointments.
                                                // Most places close AT 5. Last appt might be 4:30.
                                                // Let's strict reject >= 17.
                                                if (hours >= 17) {
                                                    Alert.alert("Closed", "Our hours are 9:00 AM - 5:00 PM. Please choose an earlier time.");
                                                    finalTime.setHours(16, 30, 0, 0); // Suggest 4:30? or reset to 9
                                                    setTime(finalTime);
                                                    return;
                                                }
                                                Alert.alert("Not Open", "Our hours are 9:00 AM - 5:00 PM.");
                                                finalTime.setHours(9, 0, 0, 0);
                                                setTime(finalTime);
                                            } else {
                                                setTime(finalTime);
                                            }
                                        }
                                    }}
                                />
                            );
                        })()
                    )}
                    <Text style={{ fontSize: 12, color: COLORS.textLight, marginTop: 4, marginLeft: 4 }}>
                        * Available 9:00 AM - 5:00 PM
                    </Text>

                    {/* Reason Input */}
                    <Text style={styles.label}>Reason</Text>
                    <View style={[styles.inputContainer, { height: 100, alignItems: 'flex-start' }]}>
                        <TextInput
                            style={[styles.textInput, { height: '100%', textAlignVertical: 'top', paddingTop: 10 }]}
                            placeholder="Describe your symptoms (e.g. Fever, Headache)..."
                            value={reason}
                            onChangeText={setReason}
                            multiline
                        />
                    </View>

                    {/* Priority Selection */}
                    <View style={styles.priorityRow}>
                        <TouchableOpacity
                            style={[styles.prioBtn, priority === 'Casual' && styles.prioBtnActive]}
                            onPress={() => setPriority('Casual')}
                        >
                            <Text style={[styles.prioText, priority === 'Casual' && styles.prioTextActive]}>Casual</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.prioBtn, priority === 'High' && styles.prioBtnUrgent]}
                            onPress={() => setPriority('High')}
                        >
                            <Text style={[styles.prioText, priority === 'High' && styles.prioTextActive]}>High</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Submit */}
                    {/* Submit */}
                    <ActionButton
                        title="Confirm Booking"
                        subtitle="Send request to medical staff"
                        icon="calendar"
                        onPress={handleSubmit}
                        loading={loading}
                        style={{ marginTop: 32 }}
                    />

                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    content: {
        backgroundColor: COLORS.card,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        minHeight: 500
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.text
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 8,
        marginTop: 16
    },
    row: {
        flexDirection: 'row',
        gap: 12
    },
    pickerBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primaryLight,
        padding: 14,
        borderRadius: 12,
        gap: 8,
        borderWidth: 1,
        borderColor: COLORS.border
    },
    pickerText: {
        color: COLORS.text,
        fontWeight: '500'
    },
    inputContainer: {
        backgroundColor: COLORS.primaryLight,
        borderRadius: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        height: 50,
        gap: 12
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        color: COLORS.text
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        marginBottom: 8
    },
    priorityRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20
    },
    prioBtn: {
        flex: 1,
        padding: 12,
        borderRadius: 10,
        backgroundColor: COLORS.primaryLight,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border // Frozen Lake
    },
    prioBtnActive: {
        backgroundColor: COLORS.secondary, // Fresh Sky
        borderColor: COLORS.secondary
    },
    prioBtnUrgent: {
        backgroundColor: COLORS.warning,
        borderColor: COLORS.warning
    },
    prioBtnEmergency: {
        backgroundColor: COLORS.danger,
        borderColor: COLORS.danger
    },
    prioText: {
        fontWeight: '600',
        color: COLORS.textLight
    },
    prioTextActive: {
        color: '#fff'
    },
    submitBtn: {
        backgroundColor: COLORS.primary,
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 32,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4
    },
    submitText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700'
    }
});
