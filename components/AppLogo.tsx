import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { COLORS } from '../constants/colors';

interface AppLogoProps {
    size?: number;
    color?: string;
}

export default function AppLogo({ size = 40, color = COLORS.primary }: AppLogoProps) {
    const mainSize = size;
    const plusSize = size * 0.4;

    return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
            {/* Heart + Track (Pulse) */}
            <MaterialCommunityIcons name="heart-pulse" size={mainSize} color={color} />

            {/* Plus overlay */}
            <View style={[styles.plusContainer, {
                top: size * 0.1,
                right: size * 0.05,
                width: plusSize,
                height: plusSize,
                backgroundColor: COLORS.white,
                borderRadius: plusSize / 2,
            }]}>
                <MaterialCommunityIcons name="plus-circle" size={plusSize} color={COLORS.accent} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    plusContainer: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        // White border effect
        borderWidth: 2,
        borderColor: COLORS.white,
    }
});
