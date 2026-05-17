
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from "react-native";
import AdminLayout from "../components/admin/AdminLayout";
import { COLORS } from "../constants/colors";
import { BASE_URL } from "../constants/Config";
import { LinearGradient } from 'expo-linear-gradient';

export default function AdminHome() {
    const { width } = useWindowDimensions();
    const isSmallDevice = width < 380;
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalStaff: 0,
        pendingAppointments: 0,
        lowStockItems: 0
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchingStudent, setSearchingStudent] = useState(false);
    const [studentResult, setStudentResult] = useState<any>(null);

    // Mock Data for search functionality
    const MOCK_DATA = [
        { id: 1, type: 'student', name: 'SIVAN', rollNo: '22CS001', dept: 'CSE', blood: 'O+', phone: '9876543210', visits: 5, lastVisit: '20-Mar-2026' },
        { id: 2, type: 'student', name: 'ARUN KUMAR', rollNo: '22EE045', dept: 'EEE', blood: 'B+', phone: '8765432109', visits: 2, lastVisit: '15-Mar-2026' },
        { id: 3, type: 'staff', name: 'DR. RAJESH', staffId: 'MT001', dept: 'Cardiology', blood: 'A+', phone: '9998887770', visits: 12, lastVisit: '21-Mar-2026' },
        { id: 4, type: 'staff', name: 'SARAH', staffId: 'MT012', dept: 'General', blood: 'B-', phone: '8887776660', visits: 3, lastVisit: '18-Mar-2026' }
    ];

    const menuItems = [
        { title: 'Student Visits', sub: 'Approve and track appointments', route: '/admin/student-appointments', icon: 'calendar', color: COLORS.secondary, bg: '#EFF6FF', progress: '85%' },
        { title: 'Staff Visits', sub: 'Clinical records for employees', route: '/admin/staff-appointments', icon: 'medkit', color: '#10B981', bg: '#ECFDF5', progress: '40%' },
        { title: 'User Management', sub: 'Access control and staff profiles', route: '/admin/manage-users', icon: 'people', color: '#22C55E', bg: '#F0FDF4', progress: '100%' },
        { title: 'Pharmacy Stock', sub: 'Medicine inventory tracking', route: '/admin/inventory', icon: 'cube', color: '#F59E0B', bg: '#FFFBEB', status: 'Check Low Stock', statusColor: COLORS.warning },
        { title: 'Blood Bank', sub: 'Manage donors and stock levels', route: '/admin/blood-groups', icon: 'water', color: '#EF4444', bg: '#FEF2F2', status: 'Urgent Needs', statusColor: COLORS.danger }
    ];

    const filteredMenuItems = menuItems.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sub.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (query.trim().length > 0) {
            const found = MOCK_DATA.find(item => 
                item.name.toLowerCase().includes(query.toLowerCase()) || 
                (item.type === 'student' && item.rollNo?.toLowerCase().includes(query.toLowerCase())) ||
                (item.type === 'staff' && item.staffId?.toLowerCase().includes(query.toLowerCase()))
            );
            if (found) {
                setStudentResult(found);
                setSearchingStudent(true);
            } else {
                setStudentResult(null);
                setSearchingStudent(false);
            }
        } else {
            setStudentResult(null);
            setSearchingStudent(false);
        }
    };

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch(`${BASE_URL}/admin/dashboard/stats`);
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fetchData])
    );

    if (loading && !refreshing) {
        return (
            <AdminLayout title="Dashboard">
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Home" showSearch={false}>
            <StatusBar style="dark" />

            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => { setRefreshing(true); fetchData(); }}
                        colors={[COLORS.primary]}
                        tintColor={COLORS.primary}
                    />
                }
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header Section */}
                <View style={styles.headerCardContainer}>
                    <LinearGradient
                        colors={[COLORS.primary, COLORS.secondary]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.headerGradient, isSmallDevice && { padding: 20, paddingBottom: 50 }]}
                    >
                        <View style={styles.headerContent}>
                            <View style={styles.headerTextSide}>
                                <Text style={[styles.greetingText, isSmallDevice && { fontSize: 20 }]}>Hello, Admin</Text>
                                <Text style={[styles.welcomeSubtitle, isSmallDevice && { fontSize: 13, maxWidth: 160 }]} numberOfLines={2}>
                                    Keep the institution healthy and organized.
                                </Text>
                            </View>
                            <View style={[styles.headerIconContainer, isSmallDevice && { width: 60, height: 60 }]}>
                                <Ionicons name="medical" size={isSmallDevice ? 40 : 50} color="rgba(255,255,255,0.2)" />
                            </View>
                        </View>
                    </LinearGradient>

                    {/* Search Bar Overlay */}
                    <View style={[styles.searchOverlay, isSmallDevice && { left: 15, right: 15 }]}>
                        <View style={styles.searchContainer}>
                            <Ionicons name="search" size={20} color={COLORS.muted} />
                            <TextInput 
                                style={styles.searchInput}
                                placeholder="Search Name or Roll No..."
                                placeholderTextColor={COLORS.muted}
                                value={searchQuery}
                                onChangeText={handleSearch}
                                autoCapitalize="none"
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => handleSearch("")}>
                                    <Ionicons name="close-circle" size={20} color={COLORS.muted} />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>

                {/* Search Result Display */}
                {searchingStudent && studentResult && (
                    <View style={styles.resultSection}>
                        <View style={styles.resultHeader}>
                            <Text style={styles.resultLabel}>{studentResult.type.toUpperCase()} RECORD FOUND</Text>
                            <TouchableOpacity onPress={() => { setSearchingStudent(false); setStudentResult(null); setSearchQuery(""); }}>
                                <Text style={styles.doneBtn}>DONE</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.resultCard}>
                            <View style={styles.resultTop}>
                                <View style={styles.resultAvatar}>
                                    <Text style={styles.avatarTxt}>{studentResult.name.charAt(0)}</Text>
                                </View>
                                <View style={{ flex: 1, marginLeft: 16 }}>
                                    <Text style={styles.resName}>{studentResult.name}</Text>
                                    <Text style={styles.resInfo}>
                                        {studentResult.type === 'student' ? studentResult.rollNo : studentResult.staffId} • {studentResult.dept}
                                    </Text>
                                </View>
                                <View style={styles.bloodBadge}>
                                    <Text style={styles.bloodTxt}>{studentResult.blood}</Text>
                                </View>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.resGrid}>
                                <View style={styles.resItem}>
                                    <Text style={styles.itemLabel}>Visits</Text>
                                    <Text style={styles.itemVal}>{studentResult.visits}</Text>
                                </View>
                                <View style={styles.resItem}>
                                    <Text style={styles.itemLabel}>Last Visit</Text>
                                    <Text style={styles.itemVal}>{studentResult.lastVisit}</Text>
                                </View>
                                <View style={styles.resItem}>
                                    <Text style={styles.itemLabel}>Dept</Text>
                                    <Text style={styles.itemVal}>{studentResult.dept}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                )}

                {/* Global Stats */}
                <View style={styles.statsSection}>
                    <Text style={styles.sectionTitle}>Global Statistics</Text>
                    <View style={styles.statsGrid}>
                        <View style={[styles.statCard, { backgroundColor: '#F0F7FF' }]}>
                            <Text style={styles.statNum}>{stats.totalStudents}</Text>
                            <Text style={styles.statLabel}>Students</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: '#F0FDF4' }]}>
                            <Text style={styles.statNum}>{stats.totalStaff}</Text>
                            <Text style={styles.statLabel}>Staff</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: '#FFFBEB' }]}>
                            <Text style={styles.statNum}>{stats.pendingAppointments}</Text>
                            <Text style={styles.statLabel}>Pending</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: '#FEF2F2' }]}>
                            <Text style={[styles.statNum, { color: '#EF4444' }]}>{stats.lowStockItems}</Text>
                            <Text style={styles.statLabel}>Low Stock</Text>
                        </View>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActionsSection}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.quickActionsGrid}>
                        <TouchableOpacity
                            style={[styles.quickActionBtn, { backgroundColor: '#E0F2FE' }]}
                            onPress={() => router.push({ pathname: '/admin/manage-users', params: { action: 'add', type: 'student' } } as any)}
                        >
                            <View style={[styles.actionIconCircle, { backgroundColor: '#0369A1' }]}>
                                <Ionicons name="person-add" size={20} color="#fff" />
                            </View>
                            <Text style={[styles.actionText, { color: '#0369A1' }]}>Add Student</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.quickActionBtn, { backgroundColor: '#F0FDF4' }]}
                            onPress={() => router.push({ pathname: '/admin/manage-users', params: { action: 'add', type: 'staff' } } as any)}
                        >
                            <View style={[styles.actionIconCircle, { backgroundColor: '#15803D' }]}>
                                <Ionicons name="people-circle" size={20} color="#fff" />
                            </View>
                            <Text style={[styles.actionText, { color: '#15803D' }]}>Add Staff</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Administrative Tasks */}
                <View style={styles.tasksContainer}>
                    <View style={styles.tasksHeader}>
                        <Text style={styles.taskTitleMain}>Administrative Tasks</Text>
                        <TouchableOpacity style={styles.filterBtn}>
                            <Ionicons name="options-outline" size={20} color={COLORS.primary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.taskList}>
                        {filteredMenuItems.map((item, index) => (
                            <TouchableOpacity 
                                key={index} 
                                style={styles.taskCardItem}
                                onPress={() => router.push(item.route as any)}
                            >
                                <View style={styles.taskRow}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.itemTitle}>{item.title}</Text>
                                        <Text style={styles.itemSub}>{item.sub}</Text>
                                        
                                        {item.progress ? (
                                            <View style={styles.progressWrap}>
                                                <View style={[styles.progressBar, { width: item.progress as any, backgroundColor: item.color }]} />
                                                <View style={styles.progressBg} />
                                            </View>
                                        ) : (
                                            <View style={styles.statusRow}>
                                                <View style={[styles.dot, { backgroundColor: item.statusColor }]} />
                                                <Text style={[styles.statusTxt, { color: item.statusColor }]}>{item.status}</Text>
                                            </View>
                                        )}
                                    </View>
                                    <View style={styles.chevronCircle}>
                                        <Ionicons name="chevron-forward" size={18} color={COLORS.primary} />
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </AdminLayout>
    );
}

const styles = StyleSheet.create({
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    scrollContent: { paddingBottom: 40 },
    headerCardContainer: { marginBottom: 35 },
    headerGradient: { padding: 25, paddingBottom: 55, borderRadius: 28, marginHorizontal: 4 },
    headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerTextSide: { flex: 1 },
    greetingText: { fontSize: 24, fontWeight: '900', color: '#FFF' },
    welcomeSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
    headerIconContainer: { width: 60, height: 60, alignItems: 'center', justifyContent: 'center' },
    searchOverlay: { position: 'absolute', bottom: -22, left: 20, right: 20, zIndex: 10 },
    searchContainer: { backgroundColor: '#FFF', height: 52, borderRadius: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, elevation: 4, gap: 12 },
    searchInput: { flex: 1, fontSize: 14, color: COLORS.text, height: '100%' },
    resultSection: { paddingHorizontal: 20, marginBottom: 25 },
    resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    resultLabel: { fontSize: 12, fontWeight: '800', color: COLORS.muted },
    doneBtn: { color: COLORS.primary, fontWeight: '800', fontSize: 14 },
    resultCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, elevation: 3 },
    resultTop: { flexDirection: 'row', alignItems: 'center' },
    resultAvatar: { width: 48, height: 48, borderRadius: 12, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
    avatarTxt: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
    resName: { fontSize: 18, fontWeight: '800', color: COLORS.text },
    resInfo: { fontSize: 13, color: COLORS.muted, marginTop: 2 },
    bloodBadge: { backgroundColor: '#FEF2F2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    bloodTxt: { color: '#EF4444', fontWeight: '800', fontSize: 12 },
    divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 15 },
    resGrid: { flexDirection: 'row', justifyContent: 'space-between' },
    resItem: { alignItems: 'center' },
    itemLabel: { fontSize: 11, color: COLORS.muted, fontWeight: '700' },
    itemVal: { fontSize: 14, color: COLORS.text, fontWeight: '700', marginTop: 3 },
    statsSection: { paddingHorizontal: 20, marginBottom: 25 },
    sectionTitle: { fontSize: 16, fontWeight: '900', color: COLORS.primary, marginBottom: 15 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 5 },
    statCard: { width: '48%', paddingVertical: 24, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    statNum: { fontSize: 28, fontWeight: '900', color: '#1E293B' },
    statLabel: { fontSize: 13, color: COLORS.primary, marginTop: 6, fontWeight: '800' },
    
    // Quick Actions
    quickActionsSection: { paddingHorizontal: 20, marginBottom: 25 },
    quickActionsGrid: { flexDirection: 'row', gap: 12 },
    quickActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 20, gap: 12 },
    actionIconCircle: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    actionText: { fontSize: 14, fontWeight: '800' },

    tasksContainer: { paddingHorizontal: 20, marginTop: 15 },
    tasksHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    taskTitleMain: { fontSize: 20, fontWeight: '900', color: COLORS.text },
    filterBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
    taskList: { gap: 15 },
    taskCardItem: { backgroundColor: '#FFF', borderRadius: 18, padding: 16, elevation: 2 },
    taskRow: { flexDirection: 'row', alignItems: 'center' },
    itemTitle: { fontSize: 17, fontWeight: '800', color: COLORS.text },
    itemSub: { fontSize: 13, color: COLORS.muted, marginTop: 2 },
    progressWrap: { height: 4, marginTop: 15, borderRadius: 2, overflow: 'hidden' },
    progressBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#F1F5F9', zIndex: -1 },
    progressBar: { height: '100%', borderRadius: 2 },
    statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
    dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
    statusTxt: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
    chevronCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', marginLeft: 10 },

    // 🕒 Recent Records
    recentSection: { marginBottom: 25 },
    recentScroll: { paddingHorizontal: 20, gap: 15 },
    smallResCard: { width: 110, backgroundColor: '#FFF', borderRadius: 20, padding: 15, alignItems: 'center', elevation: 2, borderWidth: 1, borderColor: '#F1F5F9' },
    smallAvatar: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    smallAvatarTxt: { fontSize: 18, fontWeight: '800' },
    smallName: { fontSize: 13, fontWeight: '800', color: COLORS.text, textAlign: 'center' },
    smallType: { fontSize: 9, fontWeight: '900', color: COLORS.muted, marginTop: 4, letterSpacing: 0.5 }
});
