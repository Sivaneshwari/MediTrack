import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View
} from "react-native";
import AdminLayout from "../../components/admin/AdminLayout";
import { BASE_URL } from "../../constants/Config";

// Helper to get Year/Month for display
const formatExpiryDisplay = (dateStr?: string) => {
    if (!dateStr) return "";
    // If YYYY-MM-DD, return YYYY/MM
    if (dateStr.length >= 7) {
        return dateStr.substring(0, 7).replace('-', '/');
    }
    return dateStr;
};

interface InventoryItem {
    id: number;
    item_name: string;
    item_type: string;
    stock_quantity: number;
    unit: string;
    low_stock_threshold: number;
    expiry_date?: string;
    barcode?: string;
}

const FIRST_AID_SUGGESTIONS = [
    "Cotton Roll",
    "Bandages (Small)",
    "Bandages (Large)",
    "Antiseptic Liquid (Dettol/Betadine)",
    "Burn Ointment",
    "Pain Relief Spray",
    "Thermometer",
    "ORS Packets",
    "Paracetamol 500mg",
    "Adhesive Tape"
];

export default function Inventory() {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { width } = useWindowDimensions();
    const isDesktop = width > 768;

    // Scan & Add Item Stats
    const [scanned, setScanned] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredInventory = inventory.filter(item => 
        item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.item_type && item.item_type.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.barcode && item.barcode.includes(searchQuery))
    );

    // Form State
    const [form, setForm] = useState({
        id: null as number | null,
        name: "",
        category: "Medicine",
        quantity: "",
        unit: "units",
        threshold: "10",
        barcode: "",
        expiry: ""
    });

    const stats = {
        total: inventory.length,
        medicines: inventory.filter(i => i.item_type && i.item_type.trim().toLowerCase() === 'medicine').length,
        firstAid: inventory.filter(i => i.item_type && i.item_type.trim().toLowerCase() === 'first aid').length,
        lowStock: inventory.filter(i => i.stock_quantity <= i.low_stock_threshold).length
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            const res = await fetch(`${BASE_URL}/admin/dashboard/inventory`);
            if (res.ok) {
                const data = await res.json();
                setInventory(data);

                // Check for critically low stock to notify admin (Local Alert as requested)
                const critical = data.filter((i: any) => i.stock_quantity === 0);
                if (critical.length > 0) {
                    Alert.alert("Stock Alert", `${critical.length} items are OUT OF STOCK!`);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleBarCodeScanned = async ({ type, data }: any) => {
        setScanned(true);
        setShowCamera(false);

        // 1. Check local inventory first
        try {
            const res = await fetch(`${BASE_URL}/admin/dashboard/inventory/scan`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ barcode: data })
            });
            const result = await res.json();

            if (result.found) {
                const item = result.item;
                Alert.alert("Item Found", `${item.item_name}\nCurrent Stock: ${item.stock_quantity}`, [
                    { text: "Cancel", style: "cancel" },
                    { text: "Update Stock", onPress: () => openModal(item) }
                ]);
            } else {
                // 2. Not found locally? Try "Smart Lookup" (Simulated Google Scan/Open Database)
                let foundName = "";
                try {
                    // Using OpenFoodFacts as a proxy for product lookup demonstration. 
                    // In a real medical app, you'd use FDA or a specific medical DB API.
                    const lookupRes = await fetch(`https://world.openfoodfacts.org/api/v0/product/${data}.json`);
                    const lookupData = await lookupRes.json();
                    if (lookupData.status === 1 && lookupData.product && lookupData.product.product_name) {
                        foundName = lookupData.product.product_name;
                    }
                } catch (e) {
                    console.log("Lookup failed", e);
                }

                Alert.alert("New Item Detected", foundName ? `Identified: ${foundName}` : "Item not in database.", [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Add to Inventory",
                        onPress: () => openModal({
                            item_name: foundName || "",
                            barcode: data,
                            isNew: true
                        })
                    }
                ]);
            }
        } catch (err) {
            Alert.alert("Error", "Failed to scan item");
        }
    };

    const openModal = (item?: any, barcode?: string) => {
        // Default future date for expiry placeholder
        const defaultExpiry = new Date();
        defaultExpiry.setFullYear(defaultExpiry.getFullYear() + 1);
        const expiryStr = `${defaultExpiry.getFullYear()}/${String(defaultExpiry.getMonth() + 1).padStart(2, '0')}`;

        if (item && !item.isNew) {
            // Edit Existing
            setForm({
                id: item.id,
                name: item.item_name,
                category: item.item_type,
                quantity: item.stock_quantity.toString(),
                unit: item.unit,
                threshold: item.low_stock_threshold.toString(),
                barcode: item.barcode || "",
                expiry: formatExpiryDisplay(item.expiry_date) || expiryStr
            });
        } else if (item && item.isNew) {
            // New Scanned Item or Captured
            setForm({
                id: null,
                name: item.item_name,
                category: "Medicine",
                quantity: "",
                unit: "units",
                threshold: "10",
                barcode: item.barcode,
                expiry: item.expiry_date // Already "2027/06" from takePicture
            });
        } else {
            // Manual Add
            setForm({
                id: null,
                name: "",
                category: "Medicine",
                quantity: "",
                unit: "units",
                threshold: "10",
                barcode: barcode || "",
                expiry: expiryStr
            });
        }
        setShowModal(true);
    };

    const saveItem = async () => {
        if (!form.name || !form.quantity) {
            Alert.alert("Error", "Name and Quantity are required");
            return;
        }

        try {
            // Backend now supports VARCHAR expiry, so we send the display format directly (YYYY/MM)
            const expiryToSend = form.expiry;

            // Safety: Ensure integers are parsed correctly
            const qty = parseInt(form.quantity) || 0;
            const thres = parseInt(form.threshold) || 10;

            const res = await fetch(`${BASE_URL}/admin/dashboard/inventory/add`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: form.id,
                    name: form.name,
                    category: form.category,
                    quantity: qty,
                    unit: form.unit,
                    threshold: thres,
                    barcode: form.barcode,
                    expiry: expiryToSend
                })
            });

            if (res.ok) {
                Alert.alert("Success", "Inventory updated");
                setShowModal(false);
                fetchInventory();
            } else {
                const err = await res.json();
                console.error("Save Error:", err);
                Alert.alert("Error", "Failed to save item");
            }
        } catch (err) {
            console.error("Network Error:", err);
            Alert.alert("Error", "Network error");
        }
    };

    const startScan = async () => {
        if (Platform.OS === 'web') {
            Alert.alert("Web Scanner", "Use a physical scanner to input into the barcode field.");
            // Web fallback
        }

        if (!permission?.granted) {
            const { granted } = await requestPermission();
            if (!granted) {
                Alert.alert("Permission Required", "Camera access is required to scan.");
                return;
            }
        }
        setScanned(false);
        setShowCamera(true);
    };

    const handleManualAdd = () => {
        openModal();
    }

    const AddFromSuggestion = (name: string) => {
        // Check if already in inventory
        const exists = inventory.find(i => i.item_name.toLowerCase() === name.toLowerCase());
        if (exists) {
            Alert.alert("Exists", `${name} is already in inventory. Updating stock.`);
            openModal(exists);
        } else {
            openModal();
            setForm(prev => ({ ...prev, name: name, category: name.includes("mg") ? "Medicine" : "First Aid" }));
        }
    };

    // Components
    const StatCard = ({ label, value, color = "#1E293B" }: { label: string, value: number, color?: string }) => (
        <View style={styles.statCard}>
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={[styles.statValue, { color }]}>{value}</Text>
        </View>
    );

    const TableRow = ({ item }: { item: InventoryItem }) => {
        const isLow = item.stock_quantity <= item.low_stock_threshold;

        // ... (rest of logic same) ...

        let expiryStatus = null;
        if (item.expiry_date) {
            // ...
            const today = new Date();
            // Handle YYYY/MM parsing
            let expiry = new Date();
            if (item.expiry_date.includes('/')) {
                const parts = item.expiry_date.split('/');
                expiry = new Date(parseInt(parts[0]), parseInt(parts[1]), 0); // End of month
            } else {
                expiry = new Date(item.expiry_date);
            }
            // ...
            const diffTime = expiry.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays < 0) expiryStatus = "EXPIRED";
            else if (diffDays < 30) expiryStatus = `Expiring in ${diffDays} days`;
        }

        return (
            <View style={[styles.mobileCard, expiryStatus === "EXPIRED" && styles.cardExpired]}>
                <View style={styles.mobileCardHeader}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.tdBold}>{item.item_name}</Text>
                        <View style={styles.catBadge}>
                            <Text style={styles.catText}>{item.item_type}</Text>
                        </View>
                    </View>
                    <View style={[styles.statusBadge, isLow ? styles.statusLow : styles.statusOk]}>
                        <Text style={[styles.statusText, isLow ? { color: '#EF4444' } : { color: '#10B981' }]}>
                            {item.stock_quantity} Left
                        </Text>
                    </View>
                </View>
                <View style={styles.mobileCardContent}>
                    <Text style={styles.td}>Unit: {item.unit} | Min: {item.low_stock_threshold}</Text>
                    {item.barcode && <Text style={styles.tdSub}>Code: {item.barcode}</Text>}

                    {/* Expiry Display */}
                    {item.expiry_date && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                            <Ionicons name="calendar-outline" size={14} color={expiryStatus ? "#EF4444" : "#64748B"} />
                            <Text style={[styles.tdSub, { marginLeft: 4, color: expiryStatus ? "#EF4444" : "#64748B", fontWeight: expiryStatus ? '700' : '400' }]}>
                                Exp: {item.expiry_date} {expiryStatus ? `(${expiryStatus})` : ""}
                            </Text>
                        </View>
                    )}
                </View>
                <View style={styles.mobileCardActions}>
                    <TouchableOpacity onPress={() => openModal(item)} style={styles.actionBtn}>
                        <Ionicons name="create-outline" size={20} color="#3B82F6" />
                        <Text style={{ color: '#3B82F6', fontSize: 12 }}>Edit</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    // Camera & OCR Logic
    const cameraRef = React.useRef<CameraView>(null);
    const [isExtracting, setIsExtracting] = useState(false);


    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                setIsExtracting(true);
                // 1. Capture High-Res Photo (no base64 needed yet)
                const photo = await cameraRef.current.takePictureAsync({
                    base64: false,
                    skipProcessing: true, // Speed up capture
                });

                if (!photo) {
                    throw new Error("Failed to take picture");
                }

                // 2. Resize & Compress
                // Balancing quality and size for the 'helloworld' key limits
                const manipResult = await ImageManipulator.manipulateAsync(
                    photo.uri,
                    [{ resize: { width: 900 } }],
                    { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG, base64: true }
                );

                // 3. Real OCR using OCR.space API (Free Tier)
                const formData = new FormData();
                formData.append("base64Image", `data:image/jpeg;base64,${manipResult.base64}`);
                formData.append("language", "eng");
                formData.append("isOverlayRequired", "false");
                formData.append("scale", "true"); // Helps with low-res images if we resized too much
                formData.append("OCREngine", "2"); // Use Engine 2 for better text/font support
                formData.append("detectOrientation", "true");

                const res = await fetch("https://api.ocr.space/parse/image", {
                    method: "POST",
                    headers: {
                        "apikey": "helloworld",
                    },
                    body: formData,
                });

                if (!res.ok) {
                    throw new Error(`Server Error: ${res.status}`);
                }

                let data;
                try {
                    data = await res.json();
                } catch (jsonError) {
                    // Sometimes the API returns HTML for errors (like 500 or 403)
                    throw new Error("OCR Service Busy. Please try again.");
                }

                if (data.IsErroredOnProcessing) {
                    const errorMsg = data.ErrorMessage?.[0];
                    // Handle specific "File size exceeded" error gracefully if it still happens (unlikely now)
                    if (errorMsg && errorMsg.includes("size")) {
                        throw new Error("Image too large. Try holding camera farther away.");
                    }
                    throw new Error(errorMsg || "OCR Process failed");
                }

                const detectedText = data.ParsedResults?.[0]?.ParsedText || "";
                console.log("OCR Text:", detectedText);

                if (!detectedText) {
                    Alert.alert("No Text Detected", "Try holding the camera steady and closer to the text.");
                    setIsExtracting(false);
                    return;
                }

                // Parse details
                const lines = detectedText.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0);

                // --- 1. FILTER NOISE FIRST ---
                const ignoreWords = [
                    "exp", "expiry", "date", "batch", "lot", "mfg", "mrp", "price", "rs.", "incl", "taxes",
                    "net", "content", "vol", "quantity", "units", "qty",
                    "store", "storage", "keep", "cool", "dry", "place", "reach", "children", "light",
                    "composition", "dosage", "direction", "use", "physician", "warning", "caution", "schedule", "prescription",
                    "india", "manufactured", "marketed", "mkt", "bldg", "road", "dist", "state", "pin", "code",
                    "lic", "no.", "fssai", "regd", "tm", "copyright", "issue",
                    "pvt", "ltd", "laboratories", "pharma", "pharmaceuticals", "healthcare", "life", "sciences", "biotech", "limited", "sons", "company",
                    "contains", "each", "film", "coated", "sugar", "free", "color", "colour", "titanium", "dioxide", "grade"
                ];

                const dateRegex = /\b((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s,.-]*\d{4})|(\d{1,2}[/-]\d{4})|(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b/i;

                const isNoise = (line: string) => {
                    const lower = line.toLowerCase();
                    if (lower.length < 3) return true;
                    if (ignoreWords.some(w => lower.includes(w))) return true;
                    if (/^\d+$/.test(line)) return true;
                    if (line.match(dateRegex) && line.length < 15) return true;
                    if (line.split(" ").length > 6) return true;
                    return false;
                };

                const cleanLines = lines.filter((l: string) => !isNoise(l));

                // --- 2. FIND DOSAGE (Only in clean lines) ---
                // This prevents picking up "Each tablet contains 500mg" if that line is considered noise/composition
                // --- 2. FIND DOSAGE (Relaxed) ---
                // Matches "500mg", "500 mg", "110 m" (if at end), "5 ml"
                const dosageRegex = /\b(\d+(?:\.\d+)?)\s*(mg|g|mcg|ml|m)\b/i;
                let dosage = "";

                for (const line of cleanLines) {
                    const match = line.match(dosageRegex);
                    if (match) {
                        // If it captured 'm', assume 'mg' if it looks like a medicine
                        if (match[2].toLowerCase() === 'm') {
                            dosage = match[1] + "mg";
                        } else {
                            dosage = match[0];
                        }
                        break;
                    }
                }

                // --- 3. FIND DATE ---
                // Check for YYYY or MM/YY patterns
                const dateMatch = detectedText.match(dateRegex);
                let detectedDate = "";
                let formattedExpiry = "";

                if (dateMatch) {
                    const tempDate = dateMatch[0];
                    // Basic cleaning of date string
                    try {
                        // Attempt to standardize to YYYY/MM
                        const parts = tempDate.split(/[-/]/);
                        const cleanParts = parts.filter((p: string) => !isNaN(parseInt(p)));

                        // Heuristic for MM/YYYY or MM/YY
                        if (cleanParts.length >= 2) {
                            let m = parseInt(cleanParts[0]);
                            let y = parseInt(cleanParts[cleanParts.length - 1]);

                            // Swap if month seems to be second (YYYY/MM case or large year first)
                            if (m > 12 && y <= 12) { const t = m; m = y; y = t; }

                            if (y < 100) y += 2000; // Handle YY -> YYYY

                            if (!isNaN(m) && !isNaN(y) && m >= 1 && m <= 12 && y > 2020) {
                                formattedExpiry = `${y}/${String(m).padStart(2, '0')}`;
                                detectedDate = tempDate;
                            }
                        }
                    } catch (e) { console.warn("Date parse error", e); }
                }

                // Strategy: Find the best candidate
                let candidateName = "";

                // Helper: Check if line is just the dosage (e.g. "500 mg") or mostly numbers
                const isJustDosage = (text: string) => {
                    if (!text) return true;
                    // Remove current dosage from text to see what's left
                    let scrubbed = text.toLowerCase();
                    if (dosage) {
                        scrubbed = scrubbed.replace(dosage.toLowerCase(), "").replace(dosage.toLowerCase().replace(" ", ""), "");
                    }
                    scrubbed = scrubbed.replace(/(mg|ml|g|mcg|tablets|capsules|m)/gi, "").replace(/[^a-z]/gi, "");
                    return scrubbed.length < 3;
                };

                // Priority 1: Check for known medicine brand markers (IP, BP, USP) often suffixing the name
                if (!candidateName) {
                    const suffixMarkers = [" ip", " bp", " usp"];
                    for (let l of cleanLines) {
                        const lower = l.toLowerCase();
                        if (suffixMarkers.some(m => lower.includes(m)) && !lower.includes("content") && l.length < 50) {
                            // This line likely contains the name. 
                            // E.g. "PANTOPRAZOLE GASTRO-RESISTANT TABLETS IP"
                            // We want to capture this whole block or the part before IP
                            if (!isJustDosage(l)) {
                                candidateName = l;
                                break;
                            }
                        }
                    }
                }

                // Priority 2: Look for lines immediately preceding Form markers (Tablet, Capsule etc)
                if (!candidateName) {
                    const formMarkers = ["tablet", "capsule", "injection", "syrup", "suspension", "gel", "cream", "ointment"];
                    for (let i = 0; i < lines.length; i++) {
                        const lower = lines[i].toLowerCase();
                        if (formMarkers.some(m => lower.includes(m))) {
                            // Check valid previous line
                            if (i > 0) {
                                const prev = lines[i - 1];
                                if (!isNoise(prev) && !isJustDosage(prev) && prev.length > 3) {
                                    // Heuristic: Medicine names are often ALL CAPS or Title Case
                                    // If current line is "TABLETS IP", prev line is likely name
                                    if (prev.toUpperCase() === prev || prev.length < 20) {
                                        candidateName = prev;
                                        // Specific fix for multi-line names: Check line before that too?
                                        if (i > 1) {
                                            const prevPrev = lines[i - 2];
                                            if (!isNoise(prevPrev) && !isJustDosage(prevPrev) && prevPrev.length > 3 && (prevPrev.toUpperCase() === prevPrev)) {
                                                candidateName = prevPrev + " " + candidateName;
                                            }
                                        }
                                        break;
                                    }
                                }
                            }
                            // Fallback: Check current line if it has substantive text before the marker
                            // e.g. "Dolo-650 Tablet"
                            if (!isNoise(lines[i]) && !isJustDosage(lines[i])) {
                                candidateName = lines[i];
                                break;
                            }
                        }
                    }
                }

                // Priority 3: First prominent line that isn't noise
                if (!candidateName && cleanLines.length > 0) {
                    for (let l of cleanLines) {
                        if (l.toLowerCase().startsWith("ndc")) continue;
                        if (isJustDosage(l)) continue;
                        if (l.toUpperCase() !== l && l.length > 25) continue; // Skip long sentences

                        if (l.length > 3 && l.length < 40) {
                            candidateName = l;
                            break; // Take the first clean, reasonable length line
                        }
                    }
                }

                // Priority 4: Catch-All - Just grab the first non-noise line, even if mixed case
                if (!candidateName && cleanLines.length > 0) {
                    for (let l of cleanLines) {
                        if (isJustDosage(l)) continue;
                        if (l.length > 3 && l.length < 50) {
                            candidateName = l;
                            break;
                        }
                    }
                }

                // Final Cleanup
                if (candidateName) {
                    candidateName = candidateName
                        .replace(/\b(tablets|tab|capsules|cap|injection|syrup|usp|ip|bp|units|coated|film|gastro-resistant)\b/gi, "")
                        .replace(/[^\w\s-]/g, "") // Remove special chars
                        .trim();
                } else {
                    candidateName = "New Medicine";
                }

                const displayName = (candidateName + " " + (dosage || "")).trim();

                setIsExtracting(false);
                setShowCamera(false);

                // Add delay to prevent modal/alert race condition
                setTimeout(() => {
                    Alert.alert("Scan Results", `Name: ${displayName}\nExpiry: ${detectedDate || "Not found"}`, [
                        { text: "Retry", style: "cancel", onPress: () => setShowCamera(true) },
                        {
                            text: "Use detected details",
                            onPress: () => openModal({
                                item_name: displayName,
                                expiry_date: formattedExpiry || "",
                                isNew: true
                            })
                        }
                    ]);
                }, 500);


            } catch (error: any) {
                console.error(error);
                Alert.alert("Error", error.message || "Failed to extract text. Please try again.");
                setIsExtracting(false);
            }
        }
    };

    if (showCamera) {
        return (
            <View style={styles.cameraContainer}>
                <CameraView
                    ref={cameraRef}
                    style={StyleSheet.absoluteFillObject}
                    facing="back"
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                />

                <View style={styles.cameraOverlay}>
                    <TouchableOpacity style={styles.closeCamera} onPress={() => setShowCamera(false)}>
                        <Ionicons name="close" size={30} color="#fff" />
                    </TouchableOpacity>

                    <View style={styles.scanBoxContainer}>
                        <View style={[styles.scanBox, { borderColor: '#10B981', borderWidth: 2 }]}>
                            <Text style={{ color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginTop: '45%' }}>
                                Position Text Here
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.captureBtn} onPress={takePicture} disabled={isExtracting}>
                        <View style={styles.captureBtnInner} />
                    </TouchableOpacity>
                </View>

                {isExtracting && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#fff" />
                        <Text style={{ color: '#fff', marginTop: 10, fontWeight: 'bold' }}>Extracting Text...</Text>
                    </View>
                )}
            </View>
        );
    }

    return (
        <AdminLayout 
            title="Inventory" 
            showBackButton={true} 
            showSearch={true} 
            searchPlaceholder="Search Medicines..." 
            onSearchChange={setSearchQuery} 
            showNotifications={false}
        >
            {/* Header */}
            <View style={styles.topRow}>
                <View style={styles.titleContainer}>
                    <Text style={styles.pageTitle}>Inventory</Text>
                    <Text style={styles.pageSub}>Manage Medicines & First Aid</Text>
                </View>
                <View style={styles.actionButtons}>
                    <TouchableOpacity style={[styles.scanBtn, { backgroundColor: '#334155' }]} onPress={handleManualAdd}>
                        <Ionicons name="add" size={20} color="#fff" />
                        <Text style={styles.scanBtnText}>Add</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.scanBtn} onPress={startScan}>
                        <Ionicons name="scan" size={20} color="#fff" />
                        <Text style={styles.scanBtnText}>Scan</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Stats */}
            <View style={[styles.statsRow, !isDesktop && { flexWrap: 'wrap', gap: 8 }]}>
                <View style={[styles.statCardContainer, !isDesktop && { width: '48%' }]}>
                    <StatCard label="Total Items" value={stats.total} />
                </View>
                <View style={[styles.statCardContainer, !isDesktop && { width: '48%' }]}>
                    <StatCard label="Medicines" value={stats.medicines} color="#3B82F6" />
                </View>
                <View style={[styles.statCardContainer, !isDesktop && { width: '48%' }]}>
                    <StatCard label="First Aid" value={stats.firstAid} color="#10B981" />
                </View>
                <View style={[styles.statCardContainer, !isDesktop && { width: '48%' }]}>
                    <StatCard label="Low Stock" value={stats.lowStock} color="#EF4444" />
                </View>
            </View>

            {/* Suggestions */}
            <View style={styles.suggestionSection}>
                <Text style={styles.sectionTitle}>Recommended First Aid (Tap to Add)</Text>
                <FlatList
                    horizontal
                    data={FIRST_AID_SUGGESTIONS}
                    keyExtractor={(item) => item}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 10, paddingVertical: 10 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.suggestionBadge} onPress={() => AddFromSuggestion(item)}>
                            <Ionicons name="add-circle" size={16} color="#059669" />
                            <Text style={styles.suggestionText}>{item}</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {/* List */}
            <View style={styles.listContainer}>
                {loading ? <ActivityIndicator size="large" color="#2563EB" /> : (
                    <FlatList
                        data={filteredInventory}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => <TableRow item={item} />}
                        contentContainerStyle={styles.listContainer}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', height: 200 }}>
                                <Text style={{ color: '#94A3B8', fontWeight: 'bold' }}>
                                    {searchQuery ? "No matching products found" : "No products in inventory"}
                                </Text>
                            </View>
                        }
                    />
                )}
            </View>

            {/* Add/Edit Modal */}
            <Modal visible={showModal} animationType="slide" transparent>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalCard}>
                            <ScrollView contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
                                <Text style={styles.modalTitle}>{form.id ? "Edit Item" : "Add Inventory"}</Text>

                                <Text style={styles.label}>Item Name (incl. mg)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={form.name}
                                    onChangeText={t => setForm({ ...form, name: t })}
                                    placeholder="e.g. Paracetamol 500mg"
                                />

                                <Text style={styles.label}>Category</Text>
                                <View style={styles.typeRow}>
                                    {["Medicine", "First Aid", "Ointment"].map(type => (
                                        <TouchableOpacity key={type} onPress={() => setForm({ ...form, category: type })}
                                            style={[styles.typeBadge, form.category === type && styles.typeActive]}>
                                            <Text style={[styles.typeText, form.category === type && { color: '#fff' }]}>{type}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.label}>Quantity</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={form.quantity}
                                            onChangeText={t => setForm({ ...form, quantity: t })}
                                            keyboardType="number-pad"
                                            placeholder="0"
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.label}>Low Limit</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={form.threshold}
                                            onChangeText={t => setForm({ ...form, threshold: t })}
                                            keyboardType="number-pad"
                                            placeholder="10"
                                        />
                                    </View>
                                </View>

                                <Text style={styles.label}>Expiry Date (YYYY/MM)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={form.expiry}
                                    onChangeText={t => setForm({ ...form, expiry: t })}
                                    placeholder="YYYY/MM"
                                />

                                <View style={styles.modalActions}>
                                    <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                                        <Text style={styles.cancelText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.saveBtn} onPress={saveItem}>
                                        <Text style={styles.saveText}>Save Stock</Text>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

        </AdminLayout>
    );
}

const styles = StyleSheet.create({
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 15, paddingHorizontal: 20, marginTop: 10 },
    titleContainer: { flex: 1, minWidth: 200 },
    actionButtons: { flexDirection: 'row', gap: 10 },
    pageTitle: { fontSize: 24, fontWeight: '900', color: '#133C55' },
    pageSub: { color: '#64748B', fontSize: 13 },
    scanBtn: { backgroundColor: '#133C55', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 8, elevation: 2 },
    scanBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

    statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20, paddingHorizontal: 20 },
    statCardContainer: { flex: 1 },
    statCard: { backgroundColor: '#fff', padding: 15, borderRadius: 16, alignSelf: 'stretch', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, borderWidth: 1, borderColor: '#F1F5F9' },
    statLabel: { fontSize: 12, fontWeight: '600', color: '#64748B', marginBottom: 4 },
    statValue: { fontSize: 22, fontWeight: '900' },

    suggestionSection: { marginBottom: 20, paddingHorizontal: 20 },
    suggestionBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, gap: 6, borderWidth: 1, borderColor: '#D1FAE5' },
    suggestionText: { fontSize: 13, fontWeight: '600', color: '#065F46' },
    sectionTitle: { fontSize: 14, fontWeight: '800', color: '#1E293B', marginBottom: 8 },

    listContainer: { flex: 1, paddingHorizontal: 20 },
    mobileCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9', elevation: 2 },
    cardExpired: { borderColor: '#FECACA', backgroundColor: '#FFF5F5' },
    mobileCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    mobileCardContent: { marginBottom: 12 },
    mobileCardActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 10, justifyContent: 'flex-end', gap: 15 },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 4 },
    tdBold: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
    td: { fontSize: 13, color: '#475569' },
    tdSub: { fontSize: 11, color: '#64748B' },
    catBadge: { alignSelf: 'flex-start', backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
    catText: { fontSize: 10, fontWeight: '700', color: '#64748B', textTransform: 'uppercase' },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, alignSelf: 'flex-start' },
    statusOk: { backgroundColor: '#DCFCE7' }, 
    statusLow: { backgroundColor: '#FEE2E2' },
    statusText: { fontSize: 11, fontWeight: '800' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '90%' },
    modalTitle: { fontSize: 24, fontWeight: '900', color: '#133C55', marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '700', color: '#475569', marginBottom: 8, marginTop: 10 },
    input: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 14, fontSize: 16, borderWidth: 1, borderColor: '#E2E8F0', color: '#1E293B' },
    typeRow: { flexDirection: 'row', gap: 8, marginTop: 4, flexWrap: 'wrap' },
    typeBadge: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: 'transparent' },
    typeActive: { backgroundColor: '#133C55', borderColor: '#133C55' },
    typeText: { fontSize: 14, fontWeight: '600', color: '#475569' },
    modalActions: { flexDirection: 'row', gap: 12, marginTop: 30 },
    saveBtn: { flex: 2, backgroundColor: '#133C55', padding: 16, borderRadius: 16, alignItems: 'center' },
    saveText: { color: '#fff', fontSize: 16, fontWeight: '800' },
    cancelBtn: { flex: 1, backgroundColor: '#F1F5F9', padding: 16, borderRadius: 16, alignItems: 'center' },
    cancelText: { color: '#475569', fontSize: 16, fontWeight: '700' },

    cameraContainer: { flex: 1, backgroundColor: '#000' },
    cameraOverlay: { flex: 1, backgroundColor: 'transparent', justifyContent: 'space-between', padding: 40 },
    closeCamera: { alignSelf: 'flex-end' },
    scanBoxContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scanBox: { width: 280, height: 200, borderRadius: 12 },
    captureBtn: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#fff', alignSelf: 'center', justifyContent: 'center', alignItems: 'center' },
    captureBtnInner: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: '#000' },
    loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
});
