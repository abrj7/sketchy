"use client";

import { useState, useRef, useEffect } from "react";
import { LogOut, User } from "lucide-react";
import { getCurrentUser, signOut, User as UserType } from "@/lib/auth";
import styles from "./UserProfile.module.css";

interface UserProfileProps {
    onLogout?: () => void;
}

export default function UserProfile({ onLogout }: UserProfileProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<UserType | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setUser(getCurrentUser());
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await signOut();
        setIsOpen(false);
        if (onLogout) {
            onLogout();
        }
    };

    // Get initials from user name
    const getInitials = (name: string): string => {
        const parts = name.trim().split(" ");
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    if (!user) {
        return null;
    }

    return (
        <div className={styles.container} ref={dropdownRef}>
            <button
                className={styles.avatarButton}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="User profile"
            >
                {getInitials(user.name)}
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    <div className={styles.userInfo}>
                        <div className={styles.avatarLarge}>
                            {getInitials(user.name)}
                        </div>
                        <div className={styles.userDetails}>
                            <span className={styles.userName}>{user.name}</span>
                            <span className={styles.userEmail}>{user.email}</span>
                        </div>
                    </div>

                    <div className={styles.divider} />

                    <button className={styles.logoutButton} onClick={handleLogout}>
                        <LogOut size={18} />
                        <span>Log out</span>
                    </button>
                </div>
            )}
        </div>
    );
}
