// PUT /api/admin/borrow/[id] - Approve or reject borrow request, or toggle follow-up
import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/lib/session';
import { updateBorrowRequest, syncEquipmentAvailability } from '@/lib/db';
import type { SessionData } from '@/types';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    if (!session.isLoggedIn || session.role !== 'admin') {
      return NextResponse.json({ error: 'ไม่มีสิทธิ์เข้าถึง' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { action, adminNotes, isFollowingUp } = body;

    const adminName = session.fullname || 'แอดมิน';

    if (action === 'followUp') {
      const updated = updateBorrowRequest(id, {
        isFollowingUp: !!isFollowingUp,
        followedByAdminName: isFollowingUp ? adminName : null,
        followedAt: isFollowingUp ? new Date().toISOString() : null,
      });
      return NextResponse.json({ success: true, borrowRequest: updated });
    }

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'กรุณาระบุ action (approve/reject/followUp)' }, { status: 400 });
    }

    const status = action === 'approve' ? 'APPROVED' : 'REJECTED';
    const updated = updateBorrowRequest(id, {
      status,
      adminNotes: adminNotes || null,
      approvedByAdminName: adminName,
    });

    if (!updated) {
      return NextResponse.json({ error: 'ไม่พบรายการยืม' }, { status: 404 });
    }

    if (action === 'approve') {
      const equipment = syncEquipmentAvailability(updated.equipmentId);
      if (!equipment) {
        return NextResponse.json({ error: 'ไม่พบอุปกรณ์สำหรับปรับปรุงสต็อก' }, { status: 404 });
      }
    }

    return NextResponse.json({ success: true, borrowRequest: updated });
  } catch {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในระบบ' }, { status: 500 });
  }
}
