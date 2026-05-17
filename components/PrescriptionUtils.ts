
/**
 * Parses a duration string (e.g. "5 days", "1 week") and returns the number of days.
 * Defaults to 0 if parsing fails.
 */
export function parseDurationToDays(durationStr: string): number {
    if (!durationStr) return 0;
    const lower = durationStr.toLowerCase();
    const num = parseInt(lower, 10);
    if (isNaN(num)) return 0;

    if (lower.includes('week')) {
        return num * 7;
    } else if (lower.includes('month')) {
        return num * 30;
    }
    // Default to days
    return num;
}

/**
 * Checks if a prescription is active based on appointment date and duration.
 */
export function isPrescriptionActive(appointmentDateStr: string, durationStr: any): boolean {
    if (!appointmentDateStr) return false;
    // Handle space separate date-time format for cross-platform compatibility
    const safeDateStr = typeof appointmentDateStr === 'string' ? appointmentDateStr.replace(' ', 'T') : appointmentDateStr;
    const apptDate = new Date(safeDateStr);

    if (isNaN(apptDate.getTime())) return false;

    const days = parseDurationToDays(String(durationStr || ''));

    // expiry date = appointment date + days
    const expiryDate = new Date(apptDate);
    expiryDate.setDate(expiryDate.getDate() + days);

    // Set to end of day for inclusive comparison
    expiryDate.setHours(23, 59, 59, 999);

    const now = new Date();
    return now <= expiryDate;
}

/**
 * Groups a flat list of prescriptions by Appointment ID (or Date/Time if ID missing)
 */
export function groupPrescriptionsByAppointment(prescriptions: any[]) {
    const grouped: any = {};

    prescriptions.forEach(p => {
        // key by appointment_id if available, else date
        const key = p.appointment_id || p.appointment_date;
        if (!grouped[key]) {
            grouped[key] = {
                id: p.appointment_id,
                date: p.appointment_date,
                reason: p.reason,
                nurse_notes: p.nurse_notes,
                items: []
            };
        }
        // Only add if it's a valid prescription (has ID/medicine)
        if (p.id && p.medicine_name) {
            grouped[key].items.push(p);
        }
    });

    // Convert to array and sort by date desc
    return Object.values(grouped).sort((a: any, b: any) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );
}
