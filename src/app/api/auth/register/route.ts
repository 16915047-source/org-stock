// POST /api/auth/register
import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/lib/session';
import { findUserByStudentId, createUser } from '@/lib/db';
import type { SessionData } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { fullname, studentId, phone } = await req.json();

    if (!fullname || !studentId || !phone) {
      return NextResponse.json({ error: 'กรุณากรอกชื่อ-นามสกุล รหัสนักศึกษา และเบอร์โทรศัพท์ที่ติดต่อได้จริง' }, { status: 400 });
    }

    const existing = findUserByStudentId(studentId);
    if (existing) {
      return NextResponse.json({ error: 'รหัสนักศึกษานี้ถูกใช้งานแล้ว' }, { status: 409 });
    }

    const user = createUser(fullname, studentId, phone);

    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    session.userId = user.id;
    session.role = user.role;
    session.fullname = user.fullname;
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        fullname: user.fullname,
        studentId: user.studentId,
        phone: user.phone,
        role: user.role,
        termsAccepted: user.termsAccepted,
        profilePhoto: user.profilePhoto,
        adminTitle: user.adminTitle,
      },
    });
  } catch {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในระบบ' }, { status: 500 });
  }
}
