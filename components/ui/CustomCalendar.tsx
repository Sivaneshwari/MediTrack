import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../constants/colors";

interface CustomCalendarProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (date: Date) => void;
    selectedDate: Date | null;
    minDate?: Date;
    maxDate?: Date;
}

export default function CustomCalendar({ visible, onClose, onSelect, selectedDate, minDate, maxDate }: CustomCalendarProps) {
    const [viewDate, setViewDate] = useState(selectedDate || new Date());

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => {
        const day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1; // Adjust to make Monday start (0=Mon, 6=Sun) or keep Sunday start? Image shows M T W... so Monday start seems fast.
        // Actually standard JS getDay() 0=Sunday.
        // If row is M T W T F S S, then 0 index is Monday.
        // If 1st is Sunday (0), it should be index 6.
        // If 1st is Monday (1), it should be index 0.
        // So (day + 6) % 7?
        // Sun(0) -> 6
        // Mon(1) -> 0
        // Tue(2) -> 1
    };

    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const changeMonth = (increment: number) => {
        const newDate = new Date(viewDate);
        newDate.setMonth(newDate.getMonth() + increment);
        setViewDate(newDate);
    };

    const handleDatePress = (day: number) => {
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        if (minDate && newDate < new Date(minDate.setHours(0, 0, 0, 0))) return;
        if (maxDate && newDate > new Date(maxDate.setHours(0, 0, 0, 0))) return;

        onSelect(newDate);
        onClose();
    };

    const renderCalendar = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        let firstDay = new Date(year, month, 1).getDay();
        // Convert to Mon start: Sun(0)->6, Mon(1)->0 ...
        firstDay = firstDay === 0 ? 6 : firstDay - 1;

        const weeks = [];
        let dayCounter = 1;

        for (let i = 0; i < 6; i++) { // 6 weeks max
            const week = [];
            for (let j = 0; j < 7; j++) {
                if (i === 0 && j < firstDay) {
                    week.push(null);
                } else if (dayCounter > daysInMonth) {
                    week.push(null);
                } else {
                    week.push(dayCounter);
                    dayCounter++;
                }
            }
            weeks.push(week);
            if (dayCounter > daysInMonth) break;
        }

        return weeks.map((week, wIndex) => (
            <View key={wIndex} style={styles.weekRow}>
                {week.map((day, dIndex) => {
                    if (!day) return <View key={dIndex} style={styles.dayCell} />;

                    const currentDate = new Date(year, month, day);
                    const isSelected = selectedDate &&
                        currentDate.toDateString() === selectedDate.toDateString();
                    const isToday = new Date().toDateString() === currentDate.toDateString();
                    const isDisabled = (minDate && currentDate < new Date(minDate.setHours(0, 0, 0, 0))) ||
                        (maxDate && currentDate > new Date(maxDate.setHours(0, 0, 0, 0)));

                    return (
                        <TouchableOpacity
                            key={dIndex}
                            style={[
                                styles.dayCell,
                                isSelected && styles.selectedDay,
                                isDisabled && styles.disabledDay
                            ]}
                            onPress={() => !isDisabled && handleDatePress(day)}
                            disabled={!!isDisabled}
                        >
                            <Text style={[
                                styles.dayText,
                                isSelected && styles.selectedDayText,
                                isDisabled && styles.disabledDayText
                            ]}>
                                {day}
                            </Text>
                            {isToday && !isSelected && <View style={styles.dot} />}
                        </TouchableOpacity>
                    );
                })}
            </View>
        ));
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
                <View style={styles.container} onStartShouldSetResponder={() => true}>

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Select Date</Text>
                        <View style={styles.monthSelector}>
                            <TouchableOpacity onPress={() => changeMonth(-1)}>
                                <Ionicons name="chevron-back" size={20} color="white" />
                            </TouchableOpacity>
                            <Text style={styles.monthText}>{months[viewDate.getMonth()]} {viewDate.getFullYear()}</Text>
                            <TouchableOpacity onPress={() => changeMonth(1)}>
                                <Ionicons name="chevron-forward" size={20} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Weekdays */}
                    <View style={styles.weekHeader}>
                        {days.map((d, i) => (
                            <Text key={i} style={styles.weekText}>{d}</Text>
                        ))}
                    </View>

                    {/* Grid */}
                    <View style={styles.calendarBody}>
                        {renderCalendar()}
                    </View>

                    {/* Footer / Cancel */}
                    <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>

                </View>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        padding: 20
    },
    container: {
        backgroundColor: '#0a0e17', // Dark Blue/Black
        borderRadius: 20,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white'
    },
    monthSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },
    monthText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white'
    },
    weekHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10
    },
    weekText: {
        width: 40,
        textAlign: 'center',
        color: COLORS.primary, // Teal
        fontWeight: 'bold',
        fontSize: 14
    },
    calendarBody: {
        gap: 10
    },
    weekRow: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    dayCell: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12
    },
    dayText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500'
    },
    selectedDay: {
        backgroundColor: '#FF9800', // ORANGE
        borderRadius: 12,
        shadowColor: '#FF9800',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
        elevation: 4
    },
    selectedDayText: {
        color: 'white',
        fontWeight: 'bold'
    },
    disabledDay: {
        opacity: 0.3
    },
    disabledDayText: {
        color: '#666'
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.primary,
        position: 'absolute',
        bottom: 6
    },
    cancelButton: {
        marginTop: 20,
        alignSelf: 'center',
        paddingVertical: 10
    },
    cancelText: {
        color: '#888',
        fontSize: 14
    }
});
