// GET /api/admin/admins - List all admins
// POST /api/admin/admins - Create new co-admin
import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/lib/session';
import { getAdminUsers, createAdminUser, findUserByStudentId } from '@/lib/db';
import type { SessionData } from '@/types';

export async function GET() {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    if (!session.isLoggedIn || session.role !== 'admin') {
      return NextResponse.json({ error: 'ไม่มีสิทธิ์เข้าถึง' }, { status: 403 });
    }

    const admins = getAdminUsers();
    return NextResponse.json(admins);
  } catch {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    if (!session.isLoggedIn || session.role !== 'admin') {
      return NextResponse.json({ error: 'ไม่มีสิทธิ์เข้าถึง' }, { status: 403 });
    }

    const { fullname, studentId, phone, adminTitle } = await req.json();

    if (!fullname || !studentId || !phone || !adminTitle) {
      return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน (ชื่อ, รหัสนักศึกษา, เบอร์โทร, ยศแอดมิน)' }, { status: 400 });
    }

    const existing = findUserByStudentId(studentId);
    if (existing) {
      return NextResponse.json({ error: 'รหัสนักศึกษานี้ถูกใช้งานแล้วในระบบ' }, { status: 409 });
    }

    const newAdmin = createAdminUser(fullname.trim(), studentId.trim(), phone.trim(), adminTitle.trim());

    return NextResponse.json({ success: true, admin: newAdmin });
  } catch {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการเพิ่มแอดมิน' }, { status: 500 });
  }
}
