// POST /api/borrow - Create a borrow request
// GET /api/borrow - Get user's borrow requests
import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/lib/session';
import { createBorrowRequest, getBorrowRequestsByUser, getEquipmentById } from '@/lib/db';
import type { SessionData } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
    }

    const { equipmentId, borrowPhoto, expectedReturnDate, quantity, activityName, note } = await req.json();

    if (!equipmentId || !borrowPhoto || !expectedReturnDate) {
      return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' }, { status: 400 });
    }

    const equipment = getEquipmentById(equipmentId);
    if (!equipment) {
      return NextResponse.json({ error: 'ไม่พบอุปกรณ์' }, { status: 404 });
    }

    const qty = quantity || 1;
    if (equipment.availableQty < qty) {
      return NextResponse.json({ error: 'อุปกรณ์ไม่เพียงพอ' }, { status: 400 });
    }

    const cleanActivity = activityName?.trim() || 'กิจกรรมทั่วไป';
    const cleanNote = note?.trim() || '';

    const borrowRequest = createBorrowRequest({
      userId: session.userId,
      equipmentId,
      borrowPhoto,
      expectedReturnDate,
      borrowDate: new Date().toISOString(),
      status: 'PENDING',
      returnPhoto: null,
      actualReturnDate: null,
      adminNotes: null,
      quantity: qty,
      activityName: cleanActivity,
      note: cleanNote,
    });

    return NextResponse.json({ success: true, borrowRequest });
  } catch {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในระบบ' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
    }

    const requests = getBorrowRequestsByUser(session.userId);
    const enriched = requests.map((r) => {
      const equipment = getEquipmentById(r.equipmentId);
      return {
        ...r,
        equipmentName: equipment?.name || 'ไม่ทราบชื่ออุปกรณ์',
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
