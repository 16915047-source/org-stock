// PUT /api/users/profile - Update profile photo and terms acceptance
import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/lib/session';
import { updateUser } from '@/lib/db';
import type { SessionData } from '@/types';

export async function PUT(req: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
    }

    const { profilePhoto, termsAccepted } = await req.json();

    const updates: Record<string, unknown> = {};
    if (profilePhoto !== undefined) updates.profilePhoto = profilePhoto;
    if (termsAccepted !== undefined) updates.termsAccepted = termsAccepted;

    const user = updateUser(session.userId, updates);
    if (!user) {
      return NextResponse.json({ error: 'ไม่พบผู้ใช้' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในระบบ' }, { status: 500 });
  }
}
