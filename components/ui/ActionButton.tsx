import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import { COLORS } from "../../constants/colors";

interface ActionButtonProps {
    title: string;
    subtitle?: string;
    icon?: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    loading?: boolean;
    style?: ViewStyle;
    color?: string;
    textColor?: string;
}

export default function ActionButton({
    title,
    subtitle,
    icon,
    onPress,
    loading = false,
    style,
    color = COLORS.primary,
    textColor = "#FFFFFF"
}: ActionButtonProps) {
    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: color }, style]}
            onPress={onPress}
            activeOpacity={0.8}
            disabled={loading}
        >
            {loading ? (
                <ActivityIndicator color={textColor} />
            ) : (
                <>
                    {icon && (
                        <View style={styles.iconContainer}>
                            <Ionicons name={icon} size={24} color={textColor} />
                        </View>
                    )}
                    <View style={styles.textContainer}>
                        <Text style={[styles.title, { color: textColor }]}>{title}</Text>
                        {subtitle && <Text style={[styles.subtitle, { color: textColor, opacity: 0.8 }]}>{subtitle}</Text>}
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={textColor} style={{ opacity: 0.8 }} />
                </>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20, // Rounded corners as requested
        minHeight: 80, // Substantial height
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center'
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2
    },
    subtitle: {
        fontSize: 12,
        fontWeight: '500'
    }
});
