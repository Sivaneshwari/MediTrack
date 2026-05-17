
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

import CustomCalendar from "../components/ui/CustomCalendar";
import { BASE_URL } from "../constants/Config";

const { width } = Dimensions.get('window');

import { COLORS } from '../constants/colors';

export default function VerifyCode() {
    const { email, userType } = useLocalSearchParams<{ email: string, userType: string }>();
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState(""); // Stores Password or DOB
    const [confirmPassword, setConfirmPassword] = useState(""); // Only for Admin
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Date Picker State
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

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

    // Determines if we are resetting for Admin (Password) or Student/Staff (DOB)
    const isAdmin = userType === 'admin';

    const handleDateChange = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || date;
        if (Platform.OS === 'android') setShowDatePicker(false);
        setDate(currentDate);
        setNewPassword(currentDate.toISOString().split('T')[0]); // YYYY-MM-DD
    };

    const resetPassword = async () => {
        if (!code || !newPassword) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        if (isAdmin) {
            if (!confirmPassword) {
                Alert.alert("Error", "Please confirm your password");
                return;
            }
            if (newPassword !== confirmPassword) {
                Alert.alert("Error", "Passwords do not match");
                return;
            }
            if (newPassword.length < 6) {
                Alert.alert("Error", "Password must be at least 6 characters");
                return;
            }
        }

        setLoading(true);

        try {
            let finalPayloadPassword = newPassword;
            if (!isAdmin && newPassword.includes('-')) {
                const parts = newPassword.split('-'); // YYYY-MM-DD
                if (parts.length === 3) {
                    finalPayloadPassword = `${parts[2]}/${parts[1]}/${parts[0]}`; // DD/MM/YYYY
                }
            }

            const res = await fetch(`${BASE_URL}/forgot-password/reset`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    userType,
                    code,
                    newPassword: finalPayloadPassword,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                Alert.alert("Failed", data.message || "Something went wrong");
                return;
            }

            if (Platform.OS === 'web') {
                alert("Success: Credentials reset successfully");
                router.replace("/login");
            } else {
                Alert.alert("Success", "Credentials reset successfully", [
                    { text: "Login", onPress: () => router.replace("/login") },
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
                            <Text style={styles.headerTitle}></Text>
                            <View style={{ width: 44 }} />
                        </View>

                        {/* Glass Card */}
                        <View style={styles.card}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="shield-checkmark-outline" size={40} color={COLORS.midnightGreen} />
                            </View>

                            <Text style={styles.title}>Verify & Reset</Text>
                            <Text style={styles.subtitle}>
                                Enter the verification code sent to {email}.
                                {isAdmin ? " Create a new password." : " Update your Date of Birth."}
                            </Text>

                            {/* OTP Input */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Verification Code</Text>
                                <View style={styles.inputWrapper}>
                                    <Ionicons name="keypad-outline" size={20} color={COLORS.airForceBlue} style={styles.inputIcon} />
                                    <TextInput
                                        placeholder="Enter 6-digit OTP"
                                        placeholderTextColor={COLORS.ashGray}
                                        style={styles.input}
                                        value={code}
                                        onChangeText={setCode}
                                        keyboardType="number-pad"
                                        maxLength={6}
                                    />
                                </View>
                            </View>

                            {isAdmin ? (
                                /* Admin: Password Fields */
                                <>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>New Password</Text>
                                        <View style={styles.inputWrapper}>
                                            <Ionicons name="lock-closed-outline" size={20} color={COLORS.airForceBlue} style={styles.inputIcon} />
                                            <TextInput
                                                placeholder="New Password"
                                                placeholderTextColor={COLORS.ashGray}
                                                style={styles.input}
                                                value={newPassword}
                                                onChangeText={setNewPassword}
                                                secureTextEntry={!showPassword}
                                                autoCapitalize="none"
                                            />
                                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                                <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color={COLORS.midnightGreen} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Confirm Password</Text>
                                        <View style={styles.inputWrapper}>
                                            <Ionicons name="lock-closed-outline" size={20} color={COLORS.airForceBlue} style={styles.inputIcon} />
                                            <TextInput
                                                placeholder="Confirm Password"
                                                placeholderTextColor={COLORS.ashGray}
                                                style={styles.input}
                                                value={confirmPassword}
                                                onChangeText={setConfirmPassword}
                                                secureTextEntry={true}
                                                autoCapitalize="none"
                                            />
                                        </View>
                                    </View>
                                </>
                            ) : (
                                /* Student/Staff: DOB Picker */
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>New Date of Birth</Text>
                                    <View style={styles.inputWrapper}>
                                        <Ionicons name="calendar-outline" size={20} color={COLORS.airForceBlue} style={styles.inputIcon} />
                                        {Platform.OS === 'web' ? (
                                            <input
                                                type="date"
                                                value={newPassword}
                                                onChange={(e: any) => setNewPassword(e.target.value)}
                                                style={{
                                                    flex: 1,
                                                    border: 'none',
                                                    outline: 'none',
                                                    background: 'transparent',
                                                    fontSize: 16,
                                                    color: COLORS.richBlack,
                                                    fontFamily: 'inherit'
                                                }}
                                                max={new Date().toISOString().split('T')[0]}
                                            />
                                        ) : (
                                            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={{ flex: 1 }}>
                                                <Text style={{ color: newPassword ? COLORS.richBlack : COLORS.ashGray, fontSize: 16 }}>
                                                    {newPassword || "Select Date (YYYY-MM-DD)"}
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                    {showDatePicker && Platform.OS !== 'web' && (
                                        <CustomCalendar
                                            visible={showDatePicker}
                                            onClose={() => setShowDatePicker(false)}
                                            onSelect={(d) => {
                                                setShowDatePicker(false);
                                                setDate(d);
                                                setNewPassword(d.toISOString().split('T')[0]);
                                            }}
                                            selectedDate={date}
                                            maxDate={new Date()}
                                        />
                                    )}
                                </View>
                            )}

                            <TouchableOpacity
                                style={styles.submitBtn}
                                onPress={resetPassword}
                                disabled={loading}
                                activeOpacity={0.9}
                            >
                                <Text style={styles.submitBtnText}>{loading ? "Processing..." : (isAdmin ? "Reset Password" : "Update Credentials")}</Text>
                            </TouchableOpacity>
                        </View>

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
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 32,
        padding: 24,
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
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(184, 195, 176, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: '900',
        color: COLORS.richBlack,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.airForceBlue,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
        fontWeight: '500'
    },
    inputGroup: {
        width: '100%',
        marginBottom: 16,
    },
    label: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.richBlack,
        marginBottom: 6,
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.ashGray,
        height: 52,
        paddingHorizontal: 16,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: COLORS.richBlack,
        fontWeight: '600',
        height: '100%',
    },
    submitBtn: {
        width: '100%',
        backgroundColor: COLORS.midnightGreen,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: COLORS.midnightGreen,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
        marginTop: 10,
    },
    submitBtnText: {
        color: COLORS.mintHealth,
        fontSize: 15,
        fontWeight: '900',
    },
});
