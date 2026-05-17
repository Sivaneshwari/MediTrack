import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useWindowDimensions
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';

export default function WelcomeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { width, height } = useWindowDimensions();

    const isSmallDevice = width < 375;

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            {/* Background Layer */}
            <View style={styles.bgDecoration}>
                <LinearGradient
                    colors={['#F0F9FF', '#FFFFFF']}
                    style={styles.bgGradient}
                />
            </View>

            <SafeAreaView style={styles.safeArea}>
                <View style={[styles.mainContainer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}>

                    {/* 1. Header Area - Dedicated space at the top */}
                    <Animated.View
                        entering={FadeInUp.delay(200).duration(800)}
                        style={styles.topHeader}
                    >
                        <View style={styles.logoBadge}>
                            <Ionicons name="heart" size={32} color="#FFFFFF" />
                            <Ionicons name="pulse" size={18} color="#FF5252" style={styles.pulseIcon} />
                        </View>
                        <View style={styles.headerText}>
                            <Text style={styles.brandTitle}>MediTrack</Text>
                            <View style={styles.taglineWrapper}>
                                <View style={styles.statusDot} />
                                <Text style={styles.brandTagline}>Smart Medical Platform</Text>
                            </View>
                        </View>
                    </Animated.View>

                    {/* 2. Hero Section - Constrained middle space */}
                    <View style={styles.heroMiddle}>
                        <Animated.View
                            entering={FadeInDown.delay(400).duration(1200).springify().damping(15)}
                            style={styles.imageContainer}
                        >
                            <Image
                                source={require('../assets/images/medical_hero_illustration.png')}
                                style={[styles.heroImage, { height: height * (isSmallDevice ? 0.25 : 0.28) }]}
                                resizeMode="contain"
                            />
                        </Animated.View>
                    </View>

                    {/* 3. Bottom Content & Actions */}
                    <View style={styles.bottomSection}>
                        <Animated.View entering={FadeInDown.delay(600).duration(1000).springify()}>
                            <Text style={styles.title}>
                                Advanced Care{"\n"}
                                <Text style={styles.titleAccent}>For Your Health</Text>
                            </Text>
                            <Text style={styles.description}>
                                The unified medical companion for tracking vitals, appointments, and prescriptions effortlessly.
                            </Text>
                        </Animated.View>

                        <Animated.View
                            entering={FadeInDown.delay(1000).duration(1000).springify()}
                            style={styles.actionArea}
                        >
                            <TouchableOpacity
                                style={styles.primaryBtn}
                                onPress={() => router.push('/login')}
                                activeOpacity={0.9}
                            >
                                <Text style={styles.primaryBtnText}>Get Started</Text>
                                <View style={styles.btnArrow}>
                                    <Ionicons name="arrow-forward" size={20} color={COLORS.primary} />
                                </View>
                            </TouchableOpacity>

                            <View style={styles.footerInfo}>
                                <Ionicons name="lock-closed" size={12} color={COLORS.textLight} />
                                <Text style={styles.footerText}>Secure HIPAA Compliant Platform</Text>
                            </View>
                        </Animated.View>
                    </View>

                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    bgDecoration: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
    },
    bgGradient: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    mainContainer: {
        flex: 1,
        paddingHorizontal: 30,
    },
    // Top Header
    topHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 35,
        gap: 16,
    },
    logoBadge: {
        width: 60,
        height: 60,
        borderRadius: 18,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 8,
    },
    pulseIcon: {
        position: 'absolute',
    },
    headerText: {
        justifyContent: 'center',
    },
    brandTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: COLORS.primary,
        letterSpacing: -1,
    },
    taglineWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: -2,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.success,
    },
    brandTagline: {
        fontSize: 12,
        color: COLORS.textLight,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    // Hero Section
    heroMiddle: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    heroImage: {
        width: '100%',
    },
    // Bottom Section
    bottomSection: {
        flex: 1.5,
        justifyContent: 'flex-end',
        paddingBottom: 10,
        paddingTop: 20,
    },
    title: {
        fontSize: 40,
        fontWeight: '900',
        lineHeight: 46,
        color: COLORS.primaryDark,
        letterSpacing: -1,
    },
    titleAccent: {
        color: COLORS.accent,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        color: COLORS.textLight,
        marginTop: 12,
        fontWeight: '500',
        maxWidth: '95%',
    },
    actionArea: {
        marginTop: 60,
        gap: 20,
    },
    primaryBtn: {
        backgroundColor: COLORS.primary,
        height: 74,
        borderRadius: 26,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 28,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 15,
    },
    primaryBtnText: {
        color: 'white',
        fontSize: 20,
        fontWeight: '900',
    },
    btnArrow: {
        width: 44,
        height: 44,
        borderRadius: 15,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginBottom: 10,
    },
    footerText: {
        color: COLORS.textLight,
        fontSize: 12,
        fontWeight: '600',
    },
});
