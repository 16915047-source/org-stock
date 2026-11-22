// POST /api/auth/login
import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/lib/session';
import { findUserByStudentId, updateUser } from '@/lib/db';
import type { SessionData } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { fullname, studentId, phone } = await req.json();

    if (!fullname || !studentId) {
      return NextResponse.json({ error: 'กรุณากรอกชื่อ-นามสกุล และรหัสนักศึกษา' }, { status: 400 });
    }

    const user = findUserByStudentId(studentId);
    if (!user) {
      return NextResponse.json({ error: 'ไม่พบบัญชีผู้ใช้ กรุณาสมัครสมาชิกก่อน' }, { status: 401 });
    }

    const adminNameAliases = new Set([
      'แอดมิน',
      'แอดมิน ระบบ',
      'admin',
    ]);
    const isAdminLogin = user.role === 'admin';
    const nameMatches = user.fullname.trim() === fullname.trim();
    const adminNameMatches = isAdminLogin && adminNameAliases.has(fullname.trim());

    if (!isAdminLogin && !nameMatches) {
      return NextResponse.json({ error: 'ชื่อ-นามสกุลไม่ตรงกับรหัสนักศึกษา' }, { status: 401 });
    }

    if (isAdminLogin) {
      const adminDisplayName = fullname.trim();
      if (!adminDisplayName.startsWith('แอดมิน')) {
        return NextResponse.json({ error: 'กรุณาใช้ชื่อแอดมินในรูปแบบ “แอดมิน” ตามด้วยชื่อของคุณ' }, { status: 401 });
      }
      updateUser(user.id, { fullname: adminDisplayName });
      user.fullname = adminDisplayName;
    }

    // If phone is provided or missing in record, update it
    if (phone && phone.trim() && (!user.phone || user.phone !== phone.trim())) {
      updateUser(user.id, { phone: phone.trim() });
      user.phone = phone.trim();
    }

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
        phone: user.phone || '',
        role: user.role,
        profilePhoto: user.profilePhoto,
        termsAccepted: user.termsAccepted,
        adminTitle: user.adminTitle,
      },
    });
  } catch {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในระบบ' }, { status: 500 });
  }
}
