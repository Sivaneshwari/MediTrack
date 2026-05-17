
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useWindowDimensions
} from "react-native";
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomCalendar from "../components/ui/CustomCalendar";
import { BASE_URL } from "../constants/Config";
import { COLORS } from '../constants/colors';

export default function LoginScreen() {
    const { width, height } = useWindowDimensions();
    const isWebOrTablet = width > 768;

    const [role, setRole] = useState<'student' | 'staff' | 'admin'>('student');
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [dob, setDob] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [dateSelected, setDateSelected] = useState(false);
    const [dobInput, setDobInput] = useState("");

    const handleLogin = async () => {
        if (!identifier) {
            Alert.alert("Missing Information", "Please enter your ID/Email.");
            return;
        }

        let finalPassword = password;
        if (role !== 'admin') {
            const day = dob.getDate().toString().padStart(2, '0');
            const month = (dob.getMonth() + 1).toString().padStart(2, '0');
            const year = dob.getFullYear();
            finalPassword = `${day}/${month}/${year}`;
        } else {
            if (!password) {
                Alert.alert("Missing Information", "Please enter your password.");
                return;
            }
        }

        setLoading(true);
        try {
            const endpoint = role === 'student' ? '/student/login' : role === 'staff' ? '/staff/login' : '/admin/login';
            const payload = { identifier, password: finalPassword };

            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (response.ok) {
                if (role === 'admin') router.replace("/admin-home");
                else if (role === 'student') router.replace({ pathname: "/student-home", params: { student_id: data.student_id || data.id, name: data.name } });
                else router.replace({ pathname: "/staff-home", params: { staff_id: data.staff_id || data.id, name: data.name } });
            } else {
                Alert.alert("Authentication Failed", data.message || "Invalid credentials provided.");
            }
        } catch (error: any) {
            Alert.alert("Connection Error", `Could not reach server.\n${error.message || error}`);
        } finally {
            setLoading(false);
        }
    };

    const RoleSelector = () => (
        <View style={styles.roleSelectorContainer}>
            {['student', 'staff', 'admin'].map((r) => {
                const isActive = role === r;
                return (
                    <TouchableOpacity
                        key={r}
                        style={[styles.roleOption, isActive && styles.roleOptionActive]}
                        onPress={() => setRole(r as any)}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.roleText, isActive && styles.roleTextActive]}>
                            {r.charAt(0).toUpperCase() + r.slice(1)}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Background Gradient */}
            {/* Background Image - New Theme Removed */}

            <SafeAreaView style={{ flex: 1 }}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                >
                    <Animated.ScrollView
                        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 20 }}
                        showsVerticalScrollIndicator={false}
                        style={{ width: '100%' }}
                    >
                        <Animated.View
                            entering={FadeInDown.duration(600).springify()}
                            style={[
                                styles.content,
                                isWebOrTablet && styles.contentWeb
                            ]}
                        >

                            {/* Header */}
                            <View style={styles.headerContainer}>
                                <View style={styles.logoContainer}>
                                    <View style={styles.logoIcon}>
                                        <Ionicons name="heart" size={40} color="#DC2626" />
                                        <Ionicons name="pulse" size={20} color={COLORS.white} style={{ position: 'absolute' }} />
                                    </View>
                                </View>
                                <Text style={styles.title}>MediTrack</Text>
                                <Text style={styles.subtitle}>Compassionate Campus Care</Text>
                            </View>

                            {/* Section */}
                            <RoleSelector />

                            {/* Form */}
                            <View style={styles.formContainer}>

                                {/* Identifier Input */}
                                <View style={styles.inputGroup}>
                                    <View style={styles.inputWrapper}>
                                        <Ionicons name="person-outline" size={20} color={COLORS.textLight} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder={role === 'admin' ? "Email" : "User ID"}
                                            placeholderTextColor={COLORS.textLight}
                                            value={identifier}
                                            onChangeText={setIdentifier}
                                            autoCapitalize="none"
                                        />
                                    </View>
                                </View>

                                {/* Password / DOB Input */}
                                <View style={styles.inputGroup}>
                                    {role === 'admin' ? (
                                        <View style={styles.inputWrapper}>
                                            <Ionicons name="lock-closed-outline" size={20} color={COLORS.textLight} />
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Password"
                                                value={password}
                                                onChangeText={setPassword}
                                                secureTextEntry={!showPassword}
                                                placeholderTextColor={COLORS.textLight}
                                            />
                                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={COLORS.textLight} />
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        Platform.OS === 'web' ? (
                                            <View style={styles.inputWrapper}>
                                                <Ionicons name="calendar-outline" size={20} color={COLORS.textLight} />
                                                <TextInput
                                                    style={styles.input}
                                                    placeholder="DD/MM/YYYY"
                                                    placeholderTextColor={COLORS.textLight}
                                                    value={dobInput}
                                                    onChangeText={(text) => {
                                                        setDobInput(text);
                                                        if (text.length === 10) {
                                                            const [d, m, y] = text.split('/');
                                                            const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
                                                            if (!isNaN(date.getTime())) {
                                                                setDob(date);
                                                                setDateSelected(true);
                                                            }
                                                        }
                                                    }}
                                                />
                                            </View>
                                        ) : (
                                            <TouchableOpacity style={styles.inputWrapper} onPress={() => setShowDatePicker(true)} activeOpacity={0.8}>
                                                <Ionicons name="calendar-outline" size={20} color={COLORS.textLight} />
                                                <Text style={[styles.input, { textAlignVertical: 'center', paddingTop: 14, color: dateSelected ? COLORS.text : COLORS.textLight }]}>
                                                    {dateSelected ? dob.toLocaleDateString('en-GB') : "Date of Birth (DD/MM/YYYY)"}
                                                </Text>
                                            </TouchableOpacity>
                                        )
                                    )}
                                </View>

                                {/* Forgot Password */}
                                <TouchableOpacity style={styles.forgotBtn} onPress={() => router.push({ pathname: "/forgot-password", params: { userType: role } })}>
                                    <Text style={styles.forgotText}>Forgot Password?</Text>
                                </TouchableOpacity>

                                {/* Submit Button */}
                                <TouchableOpacity
                                    style={styles.submitBtn}
                                    onPress={handleLogin}
                                    disabled={loading}
                                    activeOpacity={0.9}
                                >
                                    {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.submitText}>Continue</Text>}
                                </TouchableOpacity>


                            </View>

                        </Animated.View>
                    </Animated.ScrollView>
                </KeyboardAvoidingView>

                {/* Date Picker Modal - Custom Calendar */}
                {showDatePicker && Platform.OS !== 'web' && (
                    <CustomCalendar
                        visible={showDatePicker}
                        onClose={() => setShowDatePicker(false)}
                        onSelect={(d) => {
                            setShowDatePicker(false);
                            setDob(d);
                            setDateSelected(true);
                        }}
                        selectedDate={dob}
                        minDate={new Date(1950, 0, 1)}
                    />
                )}
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background
    },
    content: {
        padding: 24,
        width: '100%',
    },
    contentWeb: {
        maxWidth: 450,
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 40,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    headerContainer: {
        marginBottom: 32,
        alignItems: 'center'
    },
    logoContainer: {
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 16
    },
    logoIcon: {
        width: 70, height: 70, borderRadius: 16, backgroundColor: COLORS.primary,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10,
    },
    title: { fontSize: 28, fontWeight: 'bold', color: COLORS.text, marginBottom: 4 },
    subtitle: { fontSize: 16, color: COLORS.textLight },

    // Role Selector
    roleSelectorContainer: {
        flexDirection: 'row', backgroundColor: '#F0F0F0', padding: 4, borderRadius: 12, marginBottom: 32,
    },
    roleOption: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
    roleOptionActive: { backgroundColor: COLORS.white, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 5 },
    roleText: { fontSize: 13, fontWeight: '600', color: COLORS.textLight },
    roleTextActive: { color: COLORS.primary },

    // Inputs
    inputWrapper: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white,
        borderRadius: 12, height: 56, paddingHorizontal: 16, gap: 12,
        borderWidth: 1, borderColor: '#DDD',
    },
    input: { flex: 1, height: '100%', fontSize: 16, color: COLORS.text },

    // Form
    formContainer: { width: '100%' },
    inputGroup: { marginBottom: 16 },

    forgotBtn: { alignSelf: 'flex-end', marginBottom: 24 },
    forgotText: { fontSize: 14, fontWeight: '600', color: COLORS.primary },

    submitBtn: {
        height: 56, borderRadius: 12,
        backgroundColor: COLORS.primary,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
    },
    submitText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' },
});
