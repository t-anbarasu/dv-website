import { UserProfile } from './types';
import { DEFAULT_PROFILES } from './data';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: 'user' | 'admin';
  preferredLanguage?: string;
  token?: string;
}

const STORAGE_KEYS = {
  USER: 'eqos_current_user',
  ADMIN_SESSION: 'eqos_admin_session'
};

/**
 * Get currently logged-in user from localStorage
 */
export function getCurrentUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Set current user in localStorage
 */
export function setCurrentUser(user: AuthUser): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } catch (e) {
    console.error('Failed to set current user:', e);
  }
}

/**
 * Sign out current user and clear any active admin session
 */
export function signOutUser(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
  } catch (e) {
    console.error('Failed to sign out user:', e);
  }
}

/**
 * Check if admin session is active
 */
export function getAdminSession(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const val = localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION);
    return val === 'authenticated';
  } catch (e) {
    return false;
  }
}

/**
 * Set admin session
 */
export function setAdminSession(authenticated: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    if (authenticated) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, 'authenticated');
    } else {
      localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
    }
  } catch (e) {
    console.error('Failed to update admin session:', e);
  }
}

/**
 * Check if a user has admin privileges based on role or admin email
 */
export function isUserAdmin(user: AuthUser | null): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.email && (
    user.email.toLowerCase() === 'admin@drishtavidya.com' ||
    user.email.toLowerCase().startsWith('admin@')
  )) {
    return true;
  }
  return false;
}

/**
 * Check overall admin privileges (either active admin session or logged-in admin user)
 */
export function hasAdminPrivileges(user?: AuthUser | null): boolean {
  if (getAdminSession()) return true;
  const u = user !== undefined ? user : getCurrentUser();
  return isUserAdmin(u);
}
