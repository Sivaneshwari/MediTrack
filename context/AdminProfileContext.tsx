
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ProfileData {
    name: string;
    role: string;
    email: string;
    phone: string;
    office: string;
    joiningDate: string;
    profileImg: string | null;
}

interface AdminProfileContextType {
    profile: ProfileData;
    updateProfile: (newData: ProfileData) => void;
}

const defaultProfile: ProfileData = {
    name: "Nurse Admin",
    role: "Head Nurse / Health Administrator",
    email: "admin@medtrack.edu",
    phone: "+91 94438 78547",
    office: "Room 102, Main Block",
    joiningDate: "August 2022",
    profileImg: null
};

const AdminProfileContext = createContext<AdminProfileContextType | undefined>(undefined);

export function AdminProfileProvider({ children }: { children: ReactNode }) {
    const [profile, setProfile] = useState<ProfileData>(defaultProfile);

    const updateProfile = (newData: ProfileData) => {
        setProfile(newData);
    };

    return (
        <AdminProfileContext.Provider value={{ profile, updateProfile }}>
            {children}
        </AdminProfileContext.Provider>
    );
}

export function useAdminProfile() {
    const context = useContext(AdminProfileContext);
    if (context === undefined) {
        throw new Error('useAdminProfile must be used within an AdminProfileProvider');
    }
    return context;
}
