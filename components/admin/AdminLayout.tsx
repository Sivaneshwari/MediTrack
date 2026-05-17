import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import React, { useState } from "react";
import {
    Dimensions,
    Image,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    useWindowDimensions,
    View
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS as GLOBAL_COLORS } from "../../constants/colors";
import { useAdminProfile } from "../../context/AdminProfileContext";

interface AdminLayoutProps {
    children?: React.ReactNode;
    title: string;
    showBackButton?: boolean;
    showSearch?: boolean;
    searchPlaceholder?: string;
    onSearchChange?: (text: string) => void;
    showNotifications?: boolean;
}

interface SidebarItemProps {
    icon: any;
    label: string;
    route: string;
    active: boolean;
}

// Palette mapped to global theme
const COLORS = {
    bg: GLOBAL_COLORS.backgroundAlt || '#F8FAFC',
    primary: GLOBAL_COLORS.primary || '#133C55',
    secondary: GLOBAL_COLORS.secondary || '#386FA4',
    activeBg: GLOBAL_COLORS.primaryLight || '#D0E1EA',
    border: GLOBAL_COLORS.border || '#E2E8F0',
    white: GLOBAL_COLORS.white || '#FFFFFF',
    text: GLOBAL_COLORS.text || '#133C55',
    textLight: GLOBAL_COLORS.textLight || '#386FA4',
    muted: GLOBAL_COLORS.muted || '#59A5D8',
};

const SidebarItem = ({ label, route, active, onPress }: { label: string; route: string; active: boolean; onPress: () => void }) => (
    <TouchableOpacity
        style={[styles.sidebarItem, active && styles.sidebarItemActive]}
        onPress={onPress}
    >
        <Text style={[styles.sidebarText, active && styles.sidebarTextActive]}>{label}</Text>
    </TouchableOpacity>
);

const SidebarContent = ({ pathname, router, setIsMobileMenuOpen }: { pathname: string; router: any; setIsMobileMenuOpen: (val: boolean) => void }) => {
    const { profile } = useAdminProfile();
    const initials = profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <View style={styles.sidebarInner}>
            {/* Logo Section (Matches Image) */}
            <View style={styles.logoContainer}>
                <View style={styles.logoIcon}>
                    <Ionicons name="heart" size={28} color="#DC2626" />
                    <Ionicons name="pulse" size={16} color={COLORS.white} style={{ position: 'absolute' }} />
                </View>
                <View>
                    <Text style={styles.logoText}>MedNurse</Text>
                    <Text style={styles.logoSubtext}>Admin Portal</Text>
                </View>
            </View>

            {/* Navigation Section */}
            <View style={{ flex: 1, marginTop: 40 }}>
                <Text style={styles.navHeader}>NAVIGATION</Text>
                <SidebarItem
                    label="Dashboard"
                    route="/admin-home"
                    active={pathname === "/admin-home"}
                    onPress={() => { router.push("/admin-home"); setIsMobileMenuOpen(false); }}
                />
                <SidebarItem
                    label="Student Visits"
                    route="/admin/student-appointments"
                    active={pathname.includes("student-appointments")}
                    onPress={() => { router.push("/admin/student-appointments"); setIsMobileMenuOpen(false); }}
                />
                <SidebarItem
                    label="Staff Visits"
                    route="/admin/staff-appointments"
                    active={pathname.includes("staff-appointments")}
                    onPress={() => { router.push("/admin/staff-appointments"); setIsMobileMenuOpen(false); }}
                />
                <SidebarItem
                    label="Inventory"
                    route="/admin/inventory"
                    active={pathname.includes("inventory")}
                    onPress={() => { router.push("/admin/inventory"); setIsMobileMenuOpen(false); }}
                />
                <SidebarItem
                    label="Blood Bank"
                    route="/admin/blood-groups"
                    active={pathname.includes("blood-groups")}
                    onPress={() => { router.push("/admin/blood-groups"); setIsMobileMenuOpen(false); }}
                />
            </View>

            {/* User Profile Card (Dynamic) */}
            <TouchableOpacity
                style={styles.userProfile}
                onPress={() => router.push("/admin/profile")}
                activeOpacity={0.7}
            >
                <View style={[styles.avatar, { overflow: 'hidden' }]}>
                    {profile.profileImg ? (
                        <Image source={{ uri: profile.profileImg }} style={{ width: '100%', height: '100%' }} />
                    ) : (
                        <Text style={styles.avatarText}>{initials}</Text>
                    )}
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.userName} numberOfLines={1}>{profile.name}</Text>
                    <Text style={styles.userRole} numberOfLines={1}>{profile.role}</Text>
                </View>
                <TouchableOpacity onPress={() => router.replace("/")}>
                    <Ionicons name="log-out-outline" size={20} color={COLORS.muted} />
                </TouchableOpacity>
            </TouchableOpacity>
        </View>
    );
};

export default function AdminLayout({
    children,
    title,
    showBackButton = false,
    showSearch = false,
    searchPlaceholder = "Search...",
    onSearchChange,
    showNotifications = true
}: AdminLayoutProps) {
    const pathname = usePathname();
    const { width } = useWindowDimensions();
    const isDesktop = width > 1024;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>

                {/* DESKTOP SIDEBAR */}
                {isDesktop && (
                    <View style={styles.sidebar}>
                        <SidebarContent pathname={pathname} router={router} setIsMobileMenuOpen={setIsMobileMenuOpen} />
                    </View>
                )}

                {/* MOBILE SIDEBAR MODAL */}
                <Modal visible={isMobileMenuOpen} transparent animationType="fade" onRequestClose={() => setIsMobileMenuOpen(false)}>
                    <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setIsMobileMenuOpen(false)}>
                        <TouchableWithoutFeedback>
                            <View style={styles.mobileSidebar}>
                                <SidebarContent pathname={pathname} router={router} setIsMobileMenuOpen={setIsMobileMenuOpen} />
                            </View>
                        </TouchableWithoutFeedback>
                    </TouchableOpacity>
                </Modal>

                {/* MAIN CONTENT AREA */}
                <View style={styles.mainContent}>
                    {/* Header */}
                    <View style={[styles.header, isDesktop && { paddingHorizontal: 30 }, !isDesktop && { height: 70 }]}>
                        <View style={styles.headerLeft}>
                            {showBackButton ? (
                                <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                                    <Ionicons name="arrow-back" size={22} color={COLORS.text} />
                                </TouchableOpacity>
                            ) : (
                                !isDesktop && (
                                    <TouchableOpacity onPress={() => setIsMobileMenuOpen(true)} style={styles.iconBtn}>
                                        <Ionicons name="menu" size={26} color={COLORS.text} />
                                    </TouchableOpacity>
                                )
                            )}

                            {showSearch ? (
                                <View style={[styles.searchBar, !isDesktop && { height: 42, borderRadius: 12 }]}>
                                    <Ionicons name="search" size={18} color={COLORS.muted} />
                                    <TextInput
                                        placeholder={searchPlaceholder}
                                        style={[styles.searchInput, !isDesktop && { fontSize: 13 }]}
                                        placeholderTextColor={COLORS.muted}
                                        onChangeText={onSearchChange}
                                    />
                                </View>
                            ) : (
                                <Text style={[styles.headerTitle, !isDesktop && { fontSize: 18 }]} numberOfLines={1}>{title}</Text>
                            )}
                        </View>

                        <View style={styles.headerRight}>
                            {showNotifications && (
                                <TouchableOpacity
                                    style={[styles.iconCircle, !isDesktop && { width: 38, height: 38 }]}
                                    onPress={() => router.push("/admin/notifications")}
                                >
                                    <Ionicons name="notifications-outline" size={18} color={COLORS.text} />
                                    <View style={[styles.badge, !isDesktop && { top: 10, right: 10 }]} />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* PAGE CONTENT */}
                    <View style={[styles.contentScroll, isDesktop && { padding: 30 }]}>
                        {children}
                    </View>
                </View>
            </View>
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.bg
    },
    container: {
        flex: 1,
        flexDirection: 'row',
    },
    sidebar: {
        width: 280,
        backgroundColor: COLORS.white,
        borderRightWidth: 1,
        borderRightColor: COLORS.border,
    },
    sidebarInner: {
        flex: 1,
        padding: 24,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        gap: 16,
    },
    logoIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoText: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1E293B',
        letterSpacing: -0.5,
    },
    logoSubtext: {
        fontSize: 14,
        color: COLORS.textLight,
        fontWeight: '500',
    },
    navHeader: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.muted,
        marginBottom: 16,
        paddingLeft: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    sidebarItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 8,
        gap: 12,
    },
    sidebarItemActive: {
        backgroundColor: COLORS.activeBg,
        borderWidth: 1,
        borderColor: GLOBAL_COLORS.secondary || '#386FA4',
    },
    sidebarText: {
        fontSize: 16,
        color: COLORS.textLight,
        fontWeight: '600',
    },
    sidebarTextActive: {
        color: COLORS.primary,
        fontWeight: '700',
    },
    userProfile: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: COLORS.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        gap: 12,
        marginBottom: 10,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: GLOBAL_COLORS.primaryLight || '#D0E1EA',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: 16,
    },
    userName: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
    },
    userRole: {
        fontSize: 13,
        color: COLORS.textLight,
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        flexDirection: 'row',
    },
    mobileSidebar: {
        width: 280,
        height: '100%',
        backgroundColor: COLORS.white,
        borderTopRightRadius: 24,
        borderBottomRightRadius: 24,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    mainContent: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    header: {
        height: 80,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        backgroundColor: COLORS.bg,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        flex: 1,
    },
    iconBtn: {
        padding: 8,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        height: 48,
        borderRadius: 24,
        paddingHorizontal: 16,
        flex: 1,
        maxWidth: 400,
        gap: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: COLORS.text,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.text,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    badge: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#EF4444',
        borderWidth: 1.5,
        borderColor: COLORS.white,
    },
    headerProfile: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    avatarSmall: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: GLOBAL_COLORS.primaryLight || '#D0E1EA',
        alignItems: 'center',
        justifyContent: 'center',
    },
    contentScroll: {
        flex: 1,
    },
});
