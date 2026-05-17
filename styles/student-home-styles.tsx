import { StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

export const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.mintHealth },

    // Header
    header: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.ashGray },
    headerLabel: { fontSize: 13, color: COLORS.airForceBlue, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
    headerName: { fontSize: 28, fontWeight: '900', color: COLORS.richBlack, marginTop: 2 },
    headerActions: { flexDirection: 'row', alignItems: 'center' },
    profileAvatarSm: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.midnightGreen, alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.midnightGreen, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4, overflow: 'hidden' },
    avatarImgSm: { width: '100%', height: '100%', borderRadius: 24 },
    avatarTextSm: { color: COLORS.mintHealth, fontWeight: 'bold', fontSize: 20 },
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    notificationBtn: { padding: 8, borderRadius: 12, backgroundColor: 'rgba(89, 131, 146, 0.1)', marginLeft: 12 },
    notificationDot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.danger, borderWidth: 1, borderColor: COLORS.white },

    content: { padding: 20 },

    // Emergency
    emergencyBanner: { backgroundColor: COLORS.cat_rx.bg, padding: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    emergencyText: { flex: 1, marginLeft: 10, color: COLORS.danger, fontWeight: '600' },
    emergencyAction: { backgroundColor: COLORS.white, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
    emergencyActionText: { fontSize: 12, fontWeight: 'bold', color: COLORS.danger },

    // Story/Tip
    storyContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, backgroundColor: COLORS.white, padding: 16, borderRadius: 20, borderWidth: 1, borderColor: COLORS.ashGray },
    storyRing: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: COLORS.airForceBlue, padding: 3, marginRight: 12 },
    storyInner: { flex: 1, backgroundColor: 'rgba(89, 131, 146, 0.1)', borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    wellnessBox: { flex: 1 },
    wellnessTitle: { fontSize: 14, fontWeight: '800', color: COLORS.richBlack },
    wellnessText: { fontSize: 13, color: COLORS.airForceBlue, marginTop: 2 },

    // Actions
    statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    actionButton: { flex: 1, backgroundColor: COLORS.white, padding: 5, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: COLORS.ashGray, shadowColor: COLORS.richBlack, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
    actionIcon: { width: '100%', height: 70, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    actionText: { fontSize: 14, fontWeight: '700', color: COLORS.richBlack },

    // Sections
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.richBlack },
    seeAll: { fontSize: 14, color: COLORS.midnightGreen, fontWeight: '700' },

    emptyContainer: { alignItems: 'center', padding: 24, backgroundColor: COLORS.white, borderRadius: 20, borderWidth: 1, borderColor: COLORS.ashGray, borderStyle: 'dashed' },
    emptyText: { marginTop: 8, color: COLORS.airForceBlue, fontWeight: '600' },

    // Cards
    cleanCard: { backgroundColor: COLORS.white, borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.ashGray, shadowColor: COLORS.richBlack, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 1 },
    apptRow: { flexDirection: 'row', alignItems: 'center' },
    calendarIcon: { width: 50, height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    calDay: { fontSize: 18, fontWeight: '900', color: COLORS.midnightGreen },
    calMonth: { fontSize: 10, fontWeight: '700', color: COLORS.midnightGreen, textTransform: 'uppercase' },
    apptInfo: { flex: 1, marginLeft: 16 },
    apptTitle: { fontSize: 15, fontWeight: '700', color: COLORS.richBlack },
    apptTime: { fontSize: 13, color: COLORS.airForceBlue, marginTop: 2, fontWeight: '500' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusBadgeText: { fontSize: 11, fontWeight: '800' },

    prescHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    prescTitle: { fontSize: 15, fontWeight: '700', color: COLORS.richBlack },
    divider: { height: 1, backgroundColor: COLORS.ashGray, marginBottom: 12 },
    medRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.airForceBlue, marginRight: 10 },
    medName: { flex: 1, fontSize: 14, color: COLORS.richBlack, fontWeight: '600' },
    medDose: { fontSize: 13, color: COLORS.airForceBlue, fontWeight: '500' },

    // Sheet Modal
    sheetOverlay: { flex: 1, backgroundColor: 'rgba(1, 22, 30, 0.6)', justifyContent: 'flex-end' },
    sheetContainer: { backgroundColor: COLORS.white, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, minHeight: 400 },
    sheetHandle: { width: 40, height: 4, backgroundColor: COLORS.ashGray, borderRadius: 2, alignSelf: 'center', marginBottom: 24 },

    sheetHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
    sheetAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.midnightGreen, alignItems: 'center', justifyContent: 'center', marginRight: 16, overflow: 'hidden', position: 'relative' },
    sheetAvatarText: { fontSize: 32, color: COLORS.mintHealth, fontWeight: 'bold' },
    sheetName: { flex: 1, fontSize: 20, fontWeight: '900', color: COLORS.richBlack },
    editToggle: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'rgba(89, 131, 146, 0.1)', borderRadius: 16, borderWidth: 1, borderColor: COLORS.ashGray },
    editToggleText: { fontSize: 12, fontWeight: '700', color: COLORS.midnightGreen },

    formContainer: { gap: 16, marginBottom: 32 },
    inputGroup: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.ashGray },
    inputLabel: { fontSize: 15, color: COLORS.airForceBlue, fontWeight: '600' },
    inputValue: { fontSize: 16, fontWeight: '700', color: COLORS.richBlack },
    cleanInput: { fontSize: 16, fontWeight: '700', color: COLORS.midnightGreen, textAlign: 'right', minWidth: 100, padding: 0 },

    profileActions: { gap: 12 },
    actionRow: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: 'rgba(174, 195, 176, 0.1)', borderRadius: 20 },
    actionIconSm: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    actionRowText: { flex: 1, fontSize: 16, fontWeight: '700', color: COLORS.richBlack },
    outlineBtn: { padding: 16, borderRadius: 20, borderWidth: 1, borderColor: COLORS.ashGray, alignItems: 'center', marginTop: 8 },
    outlineBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.airForceBlue },

    // Tip Modal Styles
    tipOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30
    },
    tipCard: {
        width: '100%',
        backgroundColor: COLORS.white,
        borderRadius: 32,
        padding: 32,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10
    },
    tipIllustration: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: COLORS.mintHealth,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden'
    },
    blob: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        opacity: 0.1,
        transform: [{ scale: 1.5 }]
    },
    tipTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: COLORS.richBlack,
        marginBottom: 12,
        textAlign: 'center'
    },
    tipText: {
        fontSize: 16,
        color: COLORS.airForceBlue,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
        paddingHorizontal: 10,
        fontWeight: '500'
    },
    tipButton: {
        backgroundColor: COLORS.midnightGreen,
        paddingVertical: 16,
        paddingHorizontal: 48,
        borderRadius: 20,
        shadowColor: COLORS.midnightGreen,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6
    },
    tipButtonText: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.mintHealth
    },
    avatarImgLg: { width: '100%', height: '100%', borderRadius: 40 },
    cameraIconBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: COLORS.midnightGreen, padding: 4, borderRadius: 10, borderWidth: 2, borderColor: COLORS.white },
    primaryBtn: { backgroundColor: COLORS.midnightGreen, paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
    primaryBtnText: { color: COLORS.mintHealth, fontSize: 16, fontWeight: '800' },
    editIconBtn: { position: 'absolute', top: 20, right: 20, zIndex: 1, padding: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 50 },
    input: { backgroundColor: 'rgba(174, 195, 176, 0.1)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12, width: 120, textAlign: 'right', fontWeight: 'bold', color: COLORS.richBlack, borderWidth: 1, borderColor: COLORS.ashGray },
});
