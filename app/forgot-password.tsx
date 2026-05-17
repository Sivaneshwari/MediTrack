
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from "react-native-reanimated";
import { SafeAreaView } from 'react-native-safe-area-context';

import { BASE_URL } from "../constants/Config";

const { width } = Dimensions.get('window');

import { COLORS } from '../constants/colors';

export default function ForgotPassword() {
    const { userType } = useLocalSearchParams<{ userType?: string }>();
    const [identifier, setIdentifier] = useState("");
    const [loading, setLoading] = useState(false);

    // Animations
    const blob1Scale = useSharedValue(0);
    const blob2Scale = useSharedValue(0);
    const contentOpacity = useSharedValue(0);

    useEffect(() => {
        blob1Scale.value = withSpring(1, { damping: 14 });
        blob2Scale.value = withDelay(200, withSpring(1, { damping: 14 }));
        contentOpacity.value = withTiming(1, { duration: 800 });
    }, []);

    const blob1Style = useAnimatedStyle(() => ({ transform: [{ scale: blob1Scale.value }] }));
    const blob2Style = useAnimatedStyle(() => ({ transform: [{ scale: blob2Scale.value }] }));
    const containerStyle = useAnimatedStyle(() => ({ opacity: contentOpacity.value }));

    const sendCode = async () => {
        if (!identifier) {
            Alert.alert("Error", "Please enter your email address");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${BASE_URL}/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ identifier, userType: userType || "student" }),
            });

            const data = await res.json();

            if (!res.ok) {
                Alert.alert("Failed", data.message || "Something went wrong");
                return;
            }

            // Handle Dev Mode / OTP
            const otpMessage = data.devOtp ? `\n(Dev Mode: ${data.devOtp})` : "";

            if (Platform.OS === 'web') {
                alert(`Verification Code Sent! ${otpMessage}`);
                router.push({
                    pathname: "/verify-code",
                    params: { email: identifier, userType: userType || "student" }
                } as any);
            } else {
                Alert.alert("Success", `Verification code sent to your email.${otpMessage}`, [
                    {
                        text: "Enter Code",
                        onPress: () => router.push({
                            pathname: "/verify-code",
                            params: { email: identifier, userType: userType || "student" }
                        } as any)
                    }
                ]);
            }

        } catch (err) {
            Alert.alert("Error", "Unable to connect to server");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={{ flex: 1 }}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                >
                    <Animated.View style={[styles.content, containerStyle]}>

                        {/* Header */}
                        <View style={styles.header}>
                            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                                <Ionicons name="arrow-back" size={24} color={COLORS.midnightGreen} />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>Reset Password</Text>
                            <View style={{ width: 44 }} />
                        </View>

                        {/* Glass Card */}
                        <View style={styles.card}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="mail-open-outline" size={40} color={COLORS.midnightGreen} />
                            </View>

                            <Text style={styles.title}>Forgot Password?</Text>
                            <Text style={styles.subtitle}>
                                Don't worry! It happens. Please enter the email address associated with your account.
                            </Text>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Email Address</Text>
                                <View style={styles.inputWrapper}>
                                    <Ionicons name="mail-outline" size={20} color={COLORS.airForceBlue} style={styles.inputIcon} />
                                    <TextInput
                                        placeholder="Enter your email address"
                                        placeholderTextColor={COLORS.ashGray}
                                        style={styles.input}
                                        value={identifier}
                                        onChangeText={setIdentifier}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                    />
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.submitBtn}
                                onPress={sendCode}
                                disabled={loading}
                                activeOpacity={0.9}
                            >
                                <Text style={styles.submitBtnText}>{loading ? "Sending..." : "Send Verification Code"}</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity onPress={() => router.back()} style={styles.footerLink}>
                            <Text style={styles.footerText}>Remember Password? <Text style={styles.link}>Login</Text></Text>
                        </TouchableOpacity>

                    </Animated.View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.mintHealth,
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 30,
        position: 'absolute',
        top: Platform.OS === 'android' ? 50 : 20,
        left: 20,
        right: 20,
        zIndex: 10,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.ashGray,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: COLORS.richBlack,
        opacity: 0,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 32,
        padding: 32,
        borderWidth: 1,
        borderColor: COLORS.ashGray,
        shadowColor: COLORS.richBlack,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 5,
        alignItems: 'center',
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(18, 69, 89, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: COLORS.ashGray,
    },
    title: {
        fontSize: 26,
        fontWeight: '900',
        color: COLORS.richBlack,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: COLORS.airForceBlue,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 22,
        fontWeight: '500'
    },
    inputGroup: {
        width: '100%',
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.richBlack,
        marginBottom: 8,
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 18,
        paddingHorizontal: 16,
        height: 56,
        borderWidth: 1,
        borderColor: COLORS.ashGray,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: 16,
        color: COLORS.richBlack,
        fontWeight: '600'
    },
    submitBtn: {
        width: '100%',
        backgroundColor: COLORS.midnightGreen,
        paddingVertical: 18,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: COLORS.midnightGreen,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    submitBtnText: {
        color: COLORS.mintHealth,
        fontSize: 16,
        fontWeight: '900',
    },
    footerLink: {
        marginTop: 24,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        color: COLORS.airForceBlue,
        fontWeight: '600'
    },
    link: {
        color: COLORS.midnightGreen,
        fontWeight: '900',
    },
});
