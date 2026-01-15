"use client";

import { useState, useRef, useEffect } from "react";
import { LogOut, User } from "lucide-react";
import { getCurrentUser, getGitHubUser, signOut, User as UserType } from "@/lib/auth";
import styles from "./UserProfile.module.css";

interface UserProfileProps {
    onLogout?: () => void;
}

export default function UserProfile({ onLogout }: UserProfileProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<UserType | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const localUser = getCurrentUser();
        if (localUser) {
            setUser(localUser);
            return;
        }

        const githubUser = getGitHubUser();
        if (githubUser) {
            // Map GitHub user to UserType
            setUser({
                id: String(githubUser.id),
                name: githubUser.name || githubUser.login, // Fallback to login if name is null
                email: githubUser.login, // Use login as display email since we don't have email in cookie
                avatar: githubUser.avatar_url
            });
        }
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

        // Also clear cookies for GitHub auth
        document.cookie = "github_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
        document.cookie = "github_user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";

        setIsOpen(false);
        if (onLogout) {
            onLogout();
        }
        // Force reload to ensure clean state
        window.location.reload();
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
