import { Platform } from "react-native";

// ⚠️ UPDATE THIS WITH YOUR COMPUTER'S LOCAL IP ADDRESS
// 1. Run `ipconfig` (Windows) or `ifconfig` (Mac/Linux) in terminal
// 2. Look for "IPv4 Address" under your Wi-Fi adapter
// 3. Replace the address below

export const BASE_URL =
    Platform.OS === "web"
        ? "http://localhost:3000"
        : "http://10.222.98.216:3000"; // Updated based on dynamic IP check

// Comments for debugging:
// - If using a physical device, ensure it's on the same Wi-Fi as your PC.
// - If the IP changes (e.g., reconnecting to Wi-Fi), update this file.
