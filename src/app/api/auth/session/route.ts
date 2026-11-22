// GET /api/auth/session - Get current session
import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/lib/session';
import { findUserById } from '@/lib/db';
import type { SessionData } from '@/types';

export async function GET() {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ isLoggedIn: false });
    }

    const user = findUserById(session.userId);
    if (!user) {
      session.destroy();
      return NextResponse.json({ isLoggedIn: false });
    }

    return NextResponse.json({
      isLoggedIn: true,
      user: {
        id: user.id,
        fullname: user.fullname,
        studentId: user.studentId,
        phone: user.phone || '',
        role: user.role,
        profilePhoto: user.profilePhoto,
        termsAccepted: user.termsAccepted,
        adminTitle: user.adminTitle,
      },
    });
  } catch {
    return NextResponse.json({ isLoggedIn: false });
  }
}

export async function DELETE() {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    session.destroy();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}
