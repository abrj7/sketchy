/**
 * Authentication Library
 * 
 * Uses MongoDB + Mongoose for user storage with bcrypt password hashing.
 * Session persists in localStorage so users stay logged in after refresh.
 */

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface AuthResponse {
  user: User | null;
  error?: string;
}

const STORAGE_KEY = "webber_user";

// Helper to safely access localStorage (only available in browser)
function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function saveUserToStorage(user: User | null): void {
  if (typeof window === "undefined") return;
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Storage not available
  }
}

// Initialize from localStorage
let currentUser: User | null = null;

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string): Promise<AuthResponse> {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { user: null, error: data.error || "Login failed" };
    }

    currentUser = data.user;
    saveUserToStorage(data.user);
    return { user: data.user };
  } catch (error) {
    console.error("signIn error:", error);
    return { user: null, error: "Network error. Please try again." };
  }
}

/**
 * Sign up with name, email, and password
 * Password requirements: 8+ chars, 1 uppercase, 1 lowercase, 1 special char
 */
export async function signUp(name: string, email: string, password: string): Promise<AuthResponse> {
  try {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { user: null, error: data.error || "Signup failed" };
    }

    currentUser = data.user;
    saveUserToStorage(data.user);
    return { user: data.user };
  } catch (error) {
    console.error("signUp error:", error);
    return { user: null, error: "Network error. Please try again." };
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  currentUser = null;
  saveUserToStorage(null);
}

/**
 * Get the currently logged in user (checks localStorage if not in memory)
 */
export function getCurrentUser(): User | null {
  if (!currentUser) {
    currentUser = getStoredUser();
  }
  return currentUser;
}

/**
 * Set the current user (for manual session management)
 */
export function setCurrentUser(user: User | null): void {
  currentUser = user;
  saveUserToStorage(user);
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

// OAuth providers - not implemented yet
export async function signInWithGoogle(): Promise<AuthResponse> {
  return { user: null, error: "Google OAuth not implemented yet" };
}

export async function signInWithGitHub(): Promise<AuthResponse> {
  return { user: null, error: "GitHub OAuth not implemented yet" };
}

