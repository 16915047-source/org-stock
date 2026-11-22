// GET /api/admin/borrow - Get all borrow requests (admin)
import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/lib/session';
import { getAllBorrowRequests, findUserById, getEquipmentById } from '@/lib/db';
import type { SessionData } from '@/types';

export async function GET() {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    if (!session.isLoggedIn || session.role !== 'admin') {
      return NextResponse.json({ error: 'ไม่มีสิทธิ์เข้าถึง' }, { status: 403 });
    }

    const requests = getAllBorrowRequests();

    // Enrich with user and equipment info
    const enriched = requests.map((r) => {
      const user = findUserById(r.userId);
      const equipment = getEquipmentById(r.equipmentId);
      return {
        ...r,
        userName: user?.fullname || 'ไม่ทราบ',
        userStudentId: user?.studentId || '',
        userPhone: user?.phone || 'ไม่ระบุ',
        equipmentName: equipment?.name || 'ไม่ทราบ',
        equipmentCode: equipment?.code || '',
        equipmentImage: equipment?.image || '',
        departmentId: equipment?.departmentId || '',
      };
    });

    return NextResponse.json(enriched);
  } catch {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}
