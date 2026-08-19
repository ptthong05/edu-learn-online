// Auth utilities - read/write auth state from cookies and local/session storage
import { getCookie, setCookie, eraseCookie } from './cookies';

export function getAuthToken(): string | null {
  const cookieToken = getCookie('token');
  if (cookieToken) return cookieToken;
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }
  return null;
}

export function saveAuth(token: string, user: any, remember: boolean = false): void {
  setCookie('token', token, remember);
  setCookie('user', JSON.stringify(user), remember);
  setCookie('remember_me', remember ? 'true' : 'false', remember);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(user));
    } catch {}
  }
}

export function clearAuth(): void {
  eraseCookie('token');
  eraseCookie('user');
  eraseCookie('remember_me');
  
  // Clean up localStorage/sessionStorage
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
    } catch {}
  }
}

export function getSavedUser(): any | null {
  const userStr = getCookie('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {}
  }
  if (typeof window !== 'undefined') {
    try {
      const lsUser = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (lsUser) return JSON.parse(lsUser);
    } catch {}
  }
  return null;
}

