// ============================================
// ORG Stock - Session / Auth Configuration
// ============================================
import { SessionOptions } from 'iron-session';
import type { SessionData } from '@/types';

const sessionPassword = process.env.SESSION_PASSWORD;

if (!sessionPassword || sessionPassword.length < 32) {
  throw new Error('SESSION_PASSWORD must be set to at least 32 characters.');
}

export const sessionOptions: SessionOptions = {
  password: sessionPassword,
  cookieName: 'org-stock-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7, // 1 week
  },
};

export const defaultSession: SessionData = {
  userId: '',
  role: 'student',
  fullname: '',
  isLoggedIn: false,
};
