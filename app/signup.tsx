import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BASE_URL } from "../constants/Config";

const { width, height } = Dimensions.get('window');

import CustomCalendar from "../components/ui/CustomCalendar";
import { COLORS } from '../constants/colors';

// -- Animation State --

export default function SignUp() {
    const router = useRouter(); // Use useRouter from expo-router

    // -- Animation State --
    const blob1Scale = useSharedValue(0);
    const blob2Scale = useSharedValue(0);
    const contentOpacity = useSharedValue(0); // Start hidden
    const cardTranslateY = useSharedValue(50);

    // -- Form State --
    const [role, setRole] = useState("student");
    const [agree, setAgree] = useState(false);
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [dob, setDob] = useState("");
    const [loading, setLoading] = useState(false);
    const [shift, setShift] = useState<"Shift I" | "Shift II" | "">("");
    const [department, setDepartment] = useState("");
    const [departmentOpen, setDepartmentOpen] = useState(false);
    const [bloodGroup, setBloodGroup] = useState("");
    const [bloodGroupOpen, setBloodGroupOpen] = useState(false);

    const [form, setForm] = useState({
        name: "",
        email: "",
        id: "",
    });

    const shiftIDepartments = [
        "Mathematics", "Physics", "Chemistry", "Computer Science",
        "Commerce", "Economics", "English", "Tamil", "History"
    ];

    const shiftIIDepartments = [
        "BCA", "BBA", "Microbiology", "Biochemistry",
        "Visual Communication", "Social Work", "Computer Science (SF)", "Commerce (SF)"
    ];

    const departments = shift === "Shift I" ? shiftIDepartments : (shift === "Shift II" ? shiftIIDepartments : []);
    const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

    useEffect(() => {
        // Organic Entrance Animations
        blob1Scale.value = withSpring(1, { damping: 14 });
        blob2Scale.value = withDelay(200, withSpring(1, { damping: 14 }));
        contentOpacity.value = withTiming(1, { duration: 800 });
        cardTranslateY.value = withSpring(0, { damping: 12 });
    }, []);

    const blob1Style = useAnimatedStyle(() => ({ transform: [{ scale: blob1Scale.value }] }));
    const blob2Style = useAnimatedStyle(() => ({ transform: [{ scale: blob2Scale.value }] }));
    const cardStyle = useAnimatedStyle(() => ({
        opacity: contentOpacity.value,
        transform: [{ translateY: cardTranslateY.value }]
    }));

    const updateForm = (key: string, value: string) => {
        if (key === 'email') {
            setForm(prev => ({ ...prev, [key]: value }));
        } else {
            setForm(prev => ({ ...prev, [key]: value.toUpperCase() }));
        }
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(false);
        setDate(currentDate);
        setDob(currentDate.toISOString().split('T')[0]); // YYYY-MM-DD
    };

    const handleSignUp = async () => {
        if (!agree) {
            Alert.alert("Error", "Please accept the Terms & Conditions");
            return;
        }

        if (!form.name || !form.email || !form.id || !department || !bloodGroup || !dob) {
            Alert.alert("Error", "Please fill all required fields");
            return;
        }

        setLoading(true);

        try {
            console.log("🚀 Attempting signup to:", `${BASE_URL}/signup`);

            // Convert dob (YYYY-MM-DD) to DD/MM/YYYY for backend storage
            let payloadDob = dob;
            if (dob.includes('-')) {
                const parts = dob.split('-');
                if (parts.length === 3) {
                    payloadDob = `${parts[2]}/${parts[1]}/${parts[0]}`;
                }
            }

            const payload = {
                role,
                name: form.name,
                email: form.email,
                id: form.id,
                dob: payloadDob,
                shift,
                department,
                bloodGroup,
            };

            const response = await fetch(`${BASE_URL}/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                Alert.alert("Signup Failed", data.message || "Something went wrong");
                setLoading(false);
                return;
            }

            console.log("✅ Signup successful!");
            Alert.alert("Registered", "Your account has been successfully created.", [
                { text: "Login", onPress: () => router.push("/login") }
            ]);

            setForm({ name: "", email: "", id: "" });
            setDob("");
            setDepartment("");
            setBloodGroup("");
            setAgree(false);
        } catch (error) {
            console.error("❌ Network error:", error);
            Alert.alert("Network Error", "Could not connect to server.");
        } finally {
            setLoading(false);
        }
    };

    const Dropdown = ({ label, value, options, isOpen, onToggle, onSelect }: any) => (
        <View style={{ marginBottom: 16 }}>
            <Text style={styles.inputLabel}>{label}</Text>
            <TouchableOpacity onPress={onToggle} style={styles.inputBox}>
                <Text style={{ flex: 1, color: value ? COLORS.text : '#94A3B8' }}>{value || `Select ${label}`}</Text>
                <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={20} color="#64748B" />
            </TouchableOpacity>
            {isOpen && (
                <View style={styles.dropdownList}>
                    {options.map((opt: string) => (
                        <TouchableOpacity key={opt} style={styles.dropdownItem} onPress={() => onSelect(opt)}>
                            <Text style={styles.dropdownText}>{opt}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );

    const InputItem = (icon: any, placeholder: string, value: string, onChangeText: (text: string) => void) => {
        return (
            <View style={{ marginBottom: 16 }}>
                <Text style={styles.inputLabel}>{placeholder}</Text>
                <View style={styles.inputBox}>
                    <Ionicons name={icon} size={20} color="#64748B" />
                    <TextInput
                        placeholder={`Enter ${placeholder}`}
                        placeholderTextColor="#94A3B8"
                        style={styles.input}
                        value={value}
                        onChangeText={onChangeText}
                        autoCapitalize={placeholder.includes("Email") ? "none" : "characters"}
                    />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* --- MIXED BACKGROUND THEME (Consistent with Home) --- */}
            {/* Background Image - New Theme Removed */}

            <SafeAreaView style={{ flex: 1 }}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* HEADER */}
                        <View style={styles.header}>
                            <View style={styles.logoRow}>
                                {/* Small Logo Icon */}
                                <View style={styles.iconContainer}>
                                    <Ionicons name="heart" size={24} color="#DC2626" />
                                    <Ionicons name="pulse" size={12} color="#FFFFFF" style={{ position: 'absolute' }} />
                                </View>
                                <Text style={styles.headerTitle}>MediTrack</Text>
                            </View>
                        </View>

                        {/* GLASS CARD CONTAINER */}
                        <Animated.View style={[styles.glassCard, cardStyle]}>
                            <Text style={styles.cardTitle}>Create Account</Text>
                            <Text style={styles.cardSubtitle}>Join our community</Text>

                            {/* Role Select */}
                            <View style={styles.sectionContainer}>
                                <Text style={styles.sectionLabel}>Signing up as</Text>
                                <View style={styles.roleRow}>
                                    {["student", "staff"].map(r => (
                                        <TouchableOpacity
                                            key={r}
                                            style={[styles.roleBtn, role === r && styles.activeRole]}
                                            onPress={() => setRole(r)}
                                            activeOpacity={0.8}
                                        >
                                            <Text style={[styles.roleText, role === r && styles.activeRoleText]}>
                                                {r.charAt(0).toUpperCase() + r.slice(1)}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Personal Details */}
                            <View style={styles.sectionContainer}>
                                {InputItem("person-outline", "Full Name", form.name, v => updateForm("name", v))}
                                {InputItem("mail-outline", "Email Address", form.email, v => updateForm("email", v))}

                                <Text style={styles.inputLabel}>Date of Birth</Text>
                                <View style={styles.inputBox}>
                                    <Ionicons name="calendar-outline" size={20} color="#64748B" />
                                    {Platform.OS === 'web' ? (
                                        // @ts-ignore
                                        <input
                                            type="date"
                                            value={dob}
                                            onChange={(e: any) => setDob(e.target.value)}
                                            style={{
                                                flex: 1,
                                                marginLeft: 10,
                                                border: 'none',
                                                outline: 'none',
                                                background: 'transparent',
                                                fontSize: 15,
                                                color: COLORS.text,
                                                fontFamily: 'inherit'
                                            }}
                                            max={new Date().toISOString().split('T')[0]}
                                        />
                                    ) : (
                                        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={{ flex: 1, marginLeft: 10, justifyContent: 'center' }}>
                                            <Text style={{ color: dob ? COLORS.text : '#94A3B8', fontSize: 15 }}>{dob || "YYYY-MM-DD"}</Text>
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
                                            setDob(d.toISOString().split('T')[0]);
                                        }}
                                        selectedDate={date}
                                        minDate={new Date(1950, 0, 1)}
                                    />
                                )}
                                <View style={{ marginBottom: 16 }}></View>

                                {InputItem("card-outline", role === "student" ? "Register Number" : "Staff ID", form.id, v => updateForm("id", v))}

                                <Text style={styles.inputLabel}>Select Shift</Text>
                                <View style={styles.roleRow}>
                                    {["Shift I", "Shift II"].map(s => (
                                        <TouchableOpacity
                                            key={s}
                                            style={[styles.roleBtn, shift === s && styles.activeRole]}
                                            onPress={() => { setShift(s as any); setDepartment(""); }}
                                        >
                                            <Text style={[styles.roleText, shift === s && styles.activeRoleText]}>{s}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <View style={{ marginBottom: 16 }} />

                                {shift !== "" && (
                                    <Dropdown
                                        label="Department"
                                        value={department}
                                        options={departments}
                                        isOpen={departmentOpen}
                                        onToggle={() => { setDepartmentOpen(!departmentOpen); setBloodGroupOpen(false); }}
                                        onSelect={(val: string) => { setDepartment(val); setDepartmentOpen(false); }}
                                    />
                                )}

                                <Dropdown
                                    label="Blood Group"
                                    value={bloodGroup}
                                    options={bloodGroups}
                                    isOpen={bloodGroupOpen}
                                    onToggle={() => { setBloodGroupOpen(!bloodGroupOpen); setDepartmentOpen(false); }}
                                    onSelect={(val: string) => { setBloodGroup(val); setBloodGroupOpen(false); }}
                                    isOpenDown={true} // Just a naming conv, simplified in logic
                                />
                            </View>

                            {/* Terms */}
                            <TouchableOpacity
                                style={styles.termsRow}
                                onPress={() => setAgree(!agree)}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.checkbox, agree && styles.checkboxActive]}>
                                    {agree && <Ionicons name="checkmark" size={14} color="#FFF" />}
                                </View>
                                <Text style={styles.termsText}>
                                    I agree to the <Text style={styles.linkText}>Terms & Conditions</Text>
                                </Text>
                            </TouchableOpacity>

                            {/* Signup Button */}
                            <TouchableOpacity
                                style={[styles.signupBtn, loading && { opacity: 0.7 }]}
                                onPress={handleSignUp}
                                disabled={loading}
                                activeOpacity={0.9}
                            >
                                <Text style={styles.signupBtnText}>{loading ? "Creating Account..." : "Sign Up"}</Text>
                                {!loading && <Ionicons name="arrow-forward" size={20} color="#FFF" style={{ marginLeft: 8 }} />}
                            </TouchableOpacity>

                            {/* Login Footer */}
                            <View style={styles.footer}>
                                <Text style={styles.footerText}>Already have an account? </Text>
                                <TouchableOpacity onPress={() => router.push("/login")}>
                                    <Text style={styles.linkText}>Login</Text>
                                </TouchableOpacity>
                            </View>

                        </Animated.View>
                        <View style={{ height: 40 }} />
                    </ScrollView>
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
    scrollContent: {
        padding: 24,
        paddingTop: 10,
    },
    header: {
        marginBottom: 20,
        alignItems: 'center',
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        backgroundColor: COLORS.white,
        borderRadius: 20,
        shadowColor: COLORS.midnightGreen,
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 2,
    },
    iconContainer: {
        width: 32,
        height: 32,
        backgroundColor: COLORS.midnightGreen,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: COLORS.richBlack,
        letterSpacing: -0.5,
    },
    glassCard: {
        backgroundColor: COLORS.white,
        borderRadius: 32,
        padding: 24,
        shadowColor: COLORS.richBlack,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 5,
        borderWidth: 1,
        borderColor: COLORS.ashGray,
    },
    cardTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: COLORS.richBlack,
        marginBottom: 4,
        textAlign: 'center',
    },
    cardSubtitle: {
        fontSize: 16,
        color: COLORS.airForceBlue,
        marginBottom: 32,
        textAlign: 'center',
        fontWeight: '500'
    },
    sectionContainer: {
        marginBottom: 10,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.airForceBlue,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1
    },
    roleRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 8,
    },
    roleBtn: {
        flex: 1,
        backgroundColor: 'rgba(174, 195, 176, 0.2)',
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: 'center',
    },
    activeRole: {
        backgroundColor: COLORS.midnightGreen,
    },
    roleText: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.airForceBlue,
    },
    activeRoleText: {
        color: COLORS.mintHealth,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.richBlack,
        marginBottom: 8,
        marginLeft: 4,
    },
    inputBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.ashGray,
        borderRadius: 18,
        paddingHorizontal: 16,
        height: 56,
        marginBottom: 16
    },
    input: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: COLORS.richBlack,
        fontWeight: '600',
        height: '100%',
    },
    dropdownList: {
        backgroundColor: COLORS.white,
        borderRadius: 18,
        marginTop: -10,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.ashGray,
        elevation: 5,
        padding: 8,
        shadowColor: COLORS.richBlack,
        shadowOpacity: 0.1,
    },
    dropdownItem: {
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 10,
    },
    dropdownText: {
        fontSize: 15,
        color: COLORS.richBlack,
        fontWeight: '600'
    },
    termsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 16,
        paddingHorizontal: 4,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: COLORS.midnightGreen,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    checkboxActive: {
        backgroundColor: COLORS.midnightGreen,
    },
    termsText: {
        fontSize: 14,
        color: COLORS.richBlack,
        fontWeight: '600'
    },
    signupBtn: {
        backgroundColor: COLORS.midnightGreen,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 18,
        borderRadius: 20,
        shadowColor: COLORS.midnightGreen,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
        marginTop: 10,
    },
    signupBtnText: {
        color: COLORS.mintHealth,
        fontSize: 18,
        fontWeight: '900',
    },
    linkText: {
        color: COLORS.midnightGreen,
        fontWeight: '800',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    footerText: {
        color: COLORS.airForceBlue,
        fontSize: 14,
        fontWeight: '600'
    },
});
