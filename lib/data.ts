// Shared data types and sample data for MEDiTRACK

export interface StudentAppointment {
  id: string;
  name: string;
  email: string;
  phone: string;
  bloodGroup: string;
  date: string;
  time: string;
  reason: string;
  prescription: string;
  status: "completed" | "scheduled" | "cancelled" | "in-progress";
  attendedBy: string;
}

export interface StaffAppointment {
  id: string;
  name: string;
  email: string;
  phone: string;
  bloodGroup: string;
  department: string;
  date: string;
  time: string;
  reason: string;
  prescription: string;
  status: "completed" | "scheduled" | "cancelled" | "in-progress";
  attendedBy: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: "medicine" | "ointment" | "equipment" | "supplies";
  quantity: number;
  unit: string;
  minStock: number;
  expiryDate: string;
  supplier: string;
}

export interface BloodGroupContact {
  id: string;
  name: string;
  type: "student" | "staff";
  bloodGroup: string;
  phone: string;
  email: string;
  department?: string;
}

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

// Sample student appointments
export const studentAppointments: StudentAppointment[] = [
  {
    id: "1",
    name: "Emma Johnson",
    email: "emma.j@school.edu",
    phone: "+91 98765 43210",
    bloodGroup: "A+",
    date: "Jan 9, 2026",
    time: "9:00 AM",
    reason: "Headache & Fever",
    prescription: "Paracetamol 500mg, Rest for 24 hours",
    status: "completed",
    attendedBy: "Dr. Poornima",
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "m.chen@school.edu",
    phone: "+91 98765 43211",
    bloodGroup: "B+",
    date: "Jan 9, 2026",
    time: "10:30 AM",
    reason: "Minor Cut on Hand",
    prescription: "Antiseptic cream, Bandage",
    status: "in-progress",
    attendedBy: "Nurse Sarah",
  },
  {
    id: "3",
    name: "Sarah Williams",
    email: "s.williams@school.edu",
    phone: "+91 98765 43212",
    bloodGroup: "O+",
    date: "Jan 9, 2026",
    time: "11:00 AM",
    reason: "Stomach Ache",
    prescription: "Antacid tablets",
    status: "scheduled",
    attendedBy: "Dr. Poornima",
  },
  {
    id: "4",
    name: "James Brown",
    email: "j.brown@school.edu",
    phone: "+91 98765 43213",
    bloodGroup: "AB-",
    date: "Jan 8, 2026",
    time: "2:00 PM",
    reason: "Allergic Reaction",
    prescription: "Antihistamine, Ice pack",
    status: "completed",
    attendedBy: "Dr. Poornima",
  },
  {
    id: "5",
    name: "Priya Sharma",
    email: "p.sharma@school.edu",
    phone: "+91 98765 43214",
    bloodGroup: "O-",
    date: "Jan 8, 2026",
    time: "3:30 PM",
    reason: "Sprained Ankle",
    prescription: "Ice pack, Compression bandage, Rest",
    status: "completed",
    attendedBy: "Nurse Sarah",
  },
];

// Sample staff appointments
export const staffAppointments: StaffAppointment[] = [
  {
    id: "1",
    name: "Prof. Robert Davis",
    email: "r.davis@school.edu",
    phone: "+91 98765 54321",
    bloodGroup: "A-",
    department: "Mathematics",
    date: "Jan 9, 2026",
    time: "8:30 AM",
    reason: "Blood Pressure Check",
    prescription: "Continue current medication",
    status: "completed",
    attendedBy: "Dr. Poornima",
  },
  {
    id: "2",
    name: "Ms. Linda Martinez",
    email: "l.martinez@school.edu",
    phone: "+91 98765 54322",
    bloodGroup: "B-",
    department: "English",
    date: "Jan 9, 2026",
    time: "1:00 PM",
    reason: "Back Pain",
    prescription: "Ibuprofen 400mg, Heat therapy",
    status: "scheduled",
    attendedBy: "Dr. Poornima",
  },
  {
    id: "3",
    name: "Mr. John Smith",
    email: "j.smith@school.edu",
    phone: "+91 98765 54323",
    bloodGroup: "O+",
    department: "Physical Education",
    date: "Jan 8, 2026",
    time: "3:30 PM",
    reason: "Eye Strain",
    prescription: "Eye drops, Screen break every 20 mins",
    status: "completed",
    attendedBy: "Nurse Sarah",
  },
  {
    id: "4",
    name: "Dr. Anita Kapoor",
    email: "a.kapoor@school.edu",
    phone: "+91 98765 54324",
    bloodGroup: "AB+",
    department: "Science",
    date: "Jan 7, 2026",
    time: "11:00 AM",
    reason: "Routine Health Checkup",
    prescription: "All vitals normal",
    status: "completed",
    attendedBy: "Dr. Poornima",
  },
];

// Sample inventory data
export const inventoryItems: InventoryItem[] = [
  {
    id: "1",
    name: "Paracetamol 500mg",
    category: "medicine",
    quantity: 150,
    unit: "tablets",
    minStock: 50,
    expiryDate: "Dec 2026",
    supplier: "MediSupply Co.",
  },
  {
    id: "2",
    name: "Ibuprofen 400mg",
    category: "medicine",
    quantity: 30,
    unit: "tablets",
    minStock: 40,
    expiryDate: "Mar 2026",
    supplier: "PharmaCare Ltd.",
  },
  {
    id: "3",
    name: "Antiseptic Cream",
    category: "ointment",
    quantity: 12,
    unit: "tubes",
    minStock: 10,
    expiryDate: "Jun 2026",
    supplier: "HealthFirst Inc.",
  },
  {
    id: "4",
    name: "Antihistamine Tablets",
    category: "medicine",
    quantity: 80,
    unit: "tablets",
    minStock: 30,
    expiryDate: "Feb 2026",
    supplier: "MediSupply Co.",
  },
  {
    id: "5",
    name: "Hydrocortisone Ointment",
    category: "ointment",
    quantity: 8,
    unit: "tubes",
    minStock: 5,
    expiryDate: "Sep 2026",
    supplier: "PharmaCare Ltd.",
  },
  {
    id: "6",
    name: "Bandages (Assorted)",
    category: "supplies",
    quantity: 200,
    unit: "pieces",
    minStock: 100,
    expiryDate: "N/A",
    supplier: "HealthFirst Inc.",
  },
];

// Get all blood group contacts for emergency notification
export function getBloodGroupContacts(): BloodGroupContact[] {
  const contacts: BloodGroupContact[] = [];
  
  studentAppointments.forEach(s => {
    if (!contacts.find(c => c.id === `student-${s.id}`)) {
      contacts.push({
        id: `student-${s.id}`,
        name: s.name,
        type: "student",
        bloodGroup: s.bloodGroup,
        phone: s.phone,
        email: s.email,
      });
    }
  });
  
  staffAppointments.forEach(s => {
    if (!contacts.find(c => c.id === `staff-${s.id}`)) {
      contacts.push({
        id: `staff-${s.id}`,
        name: s.name,
        type: "staff",
        bloodGroup: s.bloodGroup,
        phone: s.phone,
        email: s.email,
        department: s.department,
      });
    }
  });
  
  return contacts;
}
