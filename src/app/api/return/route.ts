// POST /api/return - Return equipment
import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/lib/session';
import { getBorrowRequestById, updateBorrowRequest, syncEquipmentAvailability } from '@/lib/db';
import type { SessionData, BorrowRequest } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
    }

    const { borrowRequestId, returnPhoto } = await req.json();

    if (!borrowRequestId || !returnPhoto) {
      return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' }, { status: 400 });
    }

    const request = getBorrowRequestById(borrowRequestId);
    if (!request) {
      return NextResponse.json({ error: 'ไม่พบรายการยืม' }, { status: 404 });
    }
    if (request.userId !== session.userId) {
      return NextResponse.json({ error: 'ไม่มีสิทธิ์คืนรายการนี้' }, { status: 403 });
    }
    if (request.status !== 'APPROVED') {
      return NextResponse.json({ error: 'รายการนี้ยังไม่ได้อนุมัติหรือถูกคืนไปแล้ว' }, { status: 400 });
    }

    const now = new Date();
    const nowIso = now.toISOString();

    // Get the borrow request to check the expected return date
    const updated = updateBorrowRequest(borrowRequestId, {
      returnPhoto,
      actualReturnDate: nowIso,
    });

    if (!updated) {
      return NextResponse.json({ error: 'ไม่พบรายการยืม' }, { status: 404 });
    }

    // Compare dates to determine on-time or late
    const expectedDate = new Date(updated.expectedReturnDate);
    const isLate = now > expectedDate;
    const finalStatus: BorrowRequest['status'] = isLate ? 'RETURNED_LATE' : 'RETURNED_ON_TIME';

    const finalUpdate = updateBorrowRequest(borrowRequestId, {
      status: finalStatus,
    });

    const equipment = syncEquipmentAvailability(updated.equipmentId);
    if (!equipment) {
      return NextResponse.json({ error: 'ไม่พบอุปกรณ์สำหรับปรับปรุงสต็อก' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      borrowRequest: finalUpdate,
      equipment,
      returnStatus: isLate ? 'ล่าช้า' : 'คืนตรงเวลา',
    });
  } catch {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในระบบ' }, { status: 500 });
  }
}
