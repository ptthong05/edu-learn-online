// Auth utilities - read/write auth state from cookies
import { getCookie, setCookie, eraseCookie } from './cookies';

export function getAuthToken(): string | null {
  return getCookie('token');
}

export function saveAuth(token: string, user: any, remember: boolean = false): void {
  setCookie('token', token, remember);
  setCookie('user', JSON.stringify(user), remember);
  setCookie('remember_me', remember ? 'true' : 'false', remember);
}

export function clearAuth(): void {
  eraseCookie('token');
  eraseCookie('user');
  eraseCookie('remember_me');
  
  // Clean up localStorage/sessionStorage for safety/migration compatibility
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  }
}

export function getSavedUser(): any | null {
  const userStr = getCookie('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

