
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    Easing,
    FadeInDown,
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

// 🎨 Palette - Matches Landing Page
const COLORS = {
    primary: '#00695c',
    primaryLight: '#4db6ac',
    secondary: '#80cbc4',
    bg: '#e0f2f1',
    surface: '#ffffff',
    text: '#004d40',
    textSecondary: '#546e7a',
    glass: 'rgba(255, 255, 255, 0.85)',
    glassBorder: 'rgba(255, 255, 255, 0.9)',
    cardShadow: 'rgba(0, 105, 92, 0.1)',
    white: '#ffffff'
};

const { width } = Dimensions.get('window');

// 🌀 Anti-Gravity Floating Item
const FloatingItem = ({ children, delay = 0, duration = 4000, distance = 8 }: any) => {
    const translateY = useSharedValue(0);

    useEffect(() => {
        translateY.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(-distance, { duration: duration, easing: Easing.inOut(Easing.sin) }),
                    withTiming(0, { duration: duration, easing: Easing.inOut(Easing.sin) })
                ),
                -1,
                true
            )
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }]
    }));

    return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};

// 🧼 Breathing Background Blob
const BreathingBlob = ({ color, size, top, left, delay = 0 }: any) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        scale.value = withDelay(delay, withRepeat(
            withSequence(
                withTiming(1.2, { duration: 5000, easing: Easing.inOut(Easing.quad) }),
                withTiming(1, { duration: 5000, easing: Easing.inOut(Easing.quad) })
            ), -1, true
        ));
        opacity.value = withDelay(delay, withRepeat(
            withSequence(
                withTiming(0.4, { duration: 4000 }),
                withTiming(0.2, { duration: 4000 })
            ), -1, true
        ));
    }, []);

    const style = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value
    }));

    return (
        <Animated.View
            style={[
                styles.blob,
                style,
                { backgroundColor: color, width: size, height: size, borderRadius: size / 2, top, left }
            ]}
        />
    );
};

export default function ExploreScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            {/* Ambient Background */}
            <View style={StyleSheet.absoluteFillObject}>
                <BreathingBlob color={COLORS.primaryLight} size={350} top={-60} left={-60} delay={0} />
                <BreathingBlob color="#b2dfdb" size={300} top={100} right={-80} delay={2000} />
                <BreathingBlob color={COLORS.secondary} size={320} bottom={-50} left={-50} delay={1000} />
                <View style={styles.glassOverlay} />
            </View>

            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Header Section */}
                    <Animated.View entering={FadeInDown.duration(800)} style={styles.header}>
                        <View>
                            <Text style={styles.headerSubtitle}>Welcome to</Text>
                            <Text style={styles.headerTitle}>MediTrack Explore</Text>
                        </View>
                        <TouchableOpacity style={styles.profileBtn}>
                            <Ionicons name="person-circle-outline" size={36} color={COLORS.primary} />
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Search Bar */}
                    <FloatingItem distance={4} duration={3000}>
                        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.searchContainer}>
                            <Ionicons name="search" size={20} color={COLORS.primary} />
                            <TextInput
                                placeholder="Search health services..."
                                placeholderTextColor={COLORS.textSecondary}
                                style={styles.searchInput}
                            />
                            <View style={styles.searchMic}>
                                <Ionicons name="mic" size={18} color={COLORS.white} />
                            </View>
                        </Animated.View>
                    </FloatingItem>

                    {/* Primary Modules Grid */}
                    <View style={styles.sectionTitleRow}>
                        <Text style={styles.sectionTitle}>Main Services</Text>
                    </View>

                    <View style={styles.moduleGrid}>
                        <ModuleCard icon="calendar" label="Appointments" delay={300} color="#e0f7fa" />
                        <ModuleCard icon="document-text" label="Prescriptions" delay={400} color="#e8f5e9" />
                        <ModuleCard icon="medkit" label="Inventory" delay={500} color="#fff3e0" />
                        <ModuleCard icon="warning" label="Emergency" delay={600} color="#ffebee" />
                        <ModuleCard icon="bar-chart" label="Reports" delay={700} color="#f3e5f5" />
                        <ModuleCard icon="scan" label="Scan Meds" delay={800} color="#e3f2fd" />
                    </View>

                    {/* Content Section: Health Updates */}
                    <View style={[styles.sectionTitleRow, { marginTop: 32 }]}>
                        <Text style={styles.sectionTitle}>Your Health Overview</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAllText}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    <FloatingItem distance={6} duration={4000} delay={500}>
                        <InfoCard
                            title="Annual Checkup"
                            subtitle="Due in 3 days. Book a slot now."
                            icon="alarm-outline"
                            color={COLORS.primaryLight}
                            delay={600}
                        />
                    </FloatingItem>

                    <FloatingItem distance={6} duration={4500} delay={700}>
                        <InfoCard
                            title="Prescription Refill"
                            subtitle="Paracetamol 500mg stock low."
                            icon="flask-outline"
                            color="#e57373"
                            delay={700}
                        />
                    </FloatingItem>

                    <FloatingItem distance={6} duration={5000} delay={900}>
                        <InfoCard
                            title="Wellness Tip"
                            subtitle="Drink 8 glasses of water today."
                            icon="water-outline"
                            color="#64b5f6"
                            delay={800}
                        />
                    </FloatingItem>

                    <View style={{ height: 100 }} />
                </ScrollView>

                {/* Floating Assistant Bubble */}
                <AssistantBubble />
            </SafeAreaView>
        </View>
    );
}

// ─── 🧩 Module Components ───

const ModuleCard = ({ icon, label, delay, color }: any) => {
    // Micro interaction scale
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

    const onPressIn = () => { scale.value = withSpring(0.92); };
    const onPressOut = () => { scale.value = withSpring(1); };

    return (
        <Animated.View entering={FadeInUp.delay(delay).springify()}>
            <TouchableOpacity
                activeOpacity={1}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                style={styles.moduleCardWrapper}
            >
                <Animated.View style={[styles.moduleCard, { backgroundColor: color }, animatedStyle]}>
                    <Ionicons name={icon as any} size={28} color={COLORS.primary} />
                </Animated.View>
                <Text style={styles.moduleLabel}>{label}</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

const InfoCard = ({ title, subtitle, icon, color, delay }: any) => (
    <Animated.View entering={FadeInUp.delay(delay).springify()} style={styles.infoCard}>
        <View style={[styles.infoIconBox, { backgroundColor: color + '20' }]}>
            <Ionicons name={icon} size={24} color={color} />
        </View>
        <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>{title}</Text>
            <Text style={styles.infoSubtitle}>{subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} style={{ opacity: 0.5 }} />
    </Animated.View>
);

const AssistantBubble = () => {
    const scale = useSharedValue(1);

    useEffect(() => {
        scale.value = withRepeat(
            withSequence(
                withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

    return (
        <TouchableOpacity activeOpacity={0.9} style={styles.fabContainer}>
            <Animated.View style={[styles.fab, animatedStyle]}>
                <Ionicons name="chatbubble-ellipses" size={26} color={COLORS.surface} />
                <Text style={styles.fabText}>Help?</Text>
            </Animated.View>
        </TouchableOpacity>
    );
};

// ─── 🎨 Styles ───

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    // Background
    blob: {
        position: 'absolute',
        zIndex: 0,
        opacity: 0.4
    },
    glassOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.65)', // Stronger blur
        // backdropFilter: 'blur(30px)', // Web Only
    },
    scrollContent: {
        padding: 24,
        paddingTop: 10
    },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        paddingTop: 10
    },
    headerSubtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontWeight: '500',
        marginBottom: 2
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: COLORS.text,
        letterSpacing: -0.5
    },
    profileBtn: {
        padding: 4,
        backgroundColor: COLORS.glass,
        borderRadius: 50,
        borderWidth: 1,
        borderColor: COLORS.surface
    },

    // Search
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.glass,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 4
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        color: COLORS.text
    },
    searchMic: {
        backgroundColor: COLORS.primaryLight,
        padding: 8,
        borderRadius: 12,
        marginLeft: 8
    },

    // Modules
    sectionTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text
    },
    seeAllText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.primaryLight
    },
    moduleGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 16 // Web support
    },
    moduleCardWrapper: {
        width: (width - 48 - 24) / 3, // 3 Columns
        alignItems: 'center',
        marginBottom: 20
    },
    moduleCard: {
        width: 70,
        height: 70,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        shadowColor: COLORS.cardShadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 4
    },
    moduleLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textSecondary,
        textAlign: 'center'
    },

    // Info Cards
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        padding: 16,
        borderRadius: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        shadowColor: COLORS.cardShadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2
    },
    infoIconBox: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 2
    },
    infoSubtitle: {
        fontSize: 13,
        color: COLORS.textSecondary
    },

    // FAB
    fabContainer: {
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
        zIndex: 100
    },
    fab: {
        flexDirection: 'row',
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 32,
        alignItems: 'center',
        gap: 8,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 8
    },
    fabText: {
        color: COLORS.surface,
        fontSize: 16,
        fontWeight: '700'
    }
});
