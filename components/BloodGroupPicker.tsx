import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants/colors';

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

interface BloodGroupPickerProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (val: string) => void;
    selectedValue: string;
}

export default function BloodGroupPicker({ visible, onClose, onSelect, selectedValue }: BloodGroupPickerProps) {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Select Blood Group</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={COLORS.textLight} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.grid}>
                        {BLOOD_GROUPS.map((item) => (
                            <TouchableOpacity
                                key={item}
                                style={[styles.item, item === selectedValue && styles.selectedItem]}
                                onPress={() => { onSelect(item); onClose(); }}
                            >
                                <Text style={[styles.itemText, item === selectedValue && styles.selectedItemText]}>{item}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    container: { backgroundColor: 'white', borderRadius: 16, padding: 20, alignItems: 'center' },
    header: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 20, alignItems: 'center' },
    title: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
    item: { width: 64, height: 64, borderRadius: 32, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.white },
    selectedItem: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    itemText: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
    selectedItemText: { color: 'white' }
});
