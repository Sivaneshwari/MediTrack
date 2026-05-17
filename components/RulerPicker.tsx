import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, FlatList, NativeScrollEvent, NativeSyntheticEvent, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/colors';

const ITEM_WIDTH = 10;
const INITIAL_WIDTH = Dimensions.get('window').width - 48; // Fallback

interface RulerPickerProps {
    min?: number;
    max?: number;
    value: string | number;
    onValueChange: (val: string) => void;
    unit?: string;
}

export default function RulerPicker({ min = 0, max = 250, value, onValueChange, unit = 'cm' }: RulerPickerProps) {
    const range = useMemo(() => Array.from({ length: max - min + 1 }, (_, i) => min + i), [min, max]);
    const flatListRef = useRef<FlatList>(null);
    const [containerWidth, setContainerWidth] = useState(INITIAL_WIDTH);

    // Parse numeric value safely
    const numericValue = useMemo(() => {
        const parsed = parseInt(String(value), 10);
        return isNaN(parsed) ? min : Math.max(min, Math.min(max, parsed));
    }, [value, min, max]);

    // Calculate padding to center the items
    // We want the Item Center to align with Viewport Center.
    // Padding = (ViewportWidth - ItemWidth) / 2
    const paddingHorizontal = (containerWidth - ITEM_WIDTH) / 2;

    useEffect(() => {
        if (containerWidth > 0 && flatListRef.current) {
            const index = numericValue - min;
            // Scroll to the index. With consistent padding logic: Offset = index * ITEM_WIDTH
            flatListRef.current.scrollToOffset({ offset: index * ITEM_WIDTH, animated: false });
        }
    }, [containerWidth]); // Run when layout is ready

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        // Index calculation: index = offsetX / ITEM_WIDTH
        let index = Math.round(offsetX / ITEM_WIDTH);

        if (index < 0) index = 0;
        if (index >= range.length) index = range.length - 1;

        const newValue = range[index];
        if (newValue !== undefined && newValue !== numericValue) {
            onValueChange(String(newValue));
        }
    };

    return (
        <View
            style={styles.container}
            onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
        >
            <View style={styles.valueContainer}>
                <Text style={styles.valueText}>{numericValue}</Text>
                <Text style={styles.unitText}>{unit}</Text>
            </View>
            <View style={styles.rulerWrapper}>
                <View style={styles.indicator} />
                <FlatList
                    ref={flatListRef}
                    data={range}
                    horizontal
                    keyExtractor={(item) => item.toString()}
                    showsHorizontalScrollIndicator={false}
                    snapToInterval={ITEM_WIDTH}
                    decelerationRate="fast"
                    scrollEventThrottle={16}
                    bounces={false}
                    getItemLayout={(_, index) => ({
                        length: ITEM_WIDTH,
                        offset: ITEM_WIDTH * index,
                        index,
                    })}
                    contentContainerStyle={{ paddingHorizontal }}
                    onScroll={handleScroll}
                    renderItem={({ item }) => {
                        const isMajor = item % 10 === 0;
                        const isMid = item % 5 === 0 && !isMajor;
                        return (
                            <View style={[styles.segmentContainer, { width: ITEM_WIDTH }]}>
                                <View style={[styles.segment, {
                                    height: isMajor ? 24 : (isMid ? 16 : 8),
                                    backgroundColor: isMajor ? COLORS.text : COLORS.muted
                                }]} />
                                {isMajor && (
                                    <View style={styles.textContainer}>
                                        <Text style={styles.segmentText}>{item}</Text>
                                    </View>
                                )}
                            </View>
                        );
                    }}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { alignItems: 'center', marginVertical: 10, width: '100%' },
    valueContainer: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 10 },
    valueText: { fontSize: 32, fontWeight: 'bold', color: COLORS.primary },
    unitText: { fontSize: 16, color: COLORS.textLight, marginLeft: 4 },
    rulerWrapper: { height: 60, alignItems: 'center', justifyContent: 'center' },
    indicator: {
        position: 'absolute',
        top: 0,
        width: 3,
        height: 40,
        backgroundColor: COLORS.danger,
        zIndex: 10,
        pointerEvents: 'none',
        borderRadius: 2
    },
    segmentContainer: { alignItems: 'center', justifyContent: 'flex-start', height: 40 },
    segment: { width: 1, borderRadius: 1 },
    textContainer: { position: 'absolute', top: 26, width: 40, alignItems: 'center', justifyContent: 'center' },
    segmentText: { fontSize: 10, color: COLORS.textLight, textAlign: 'center' }
});
