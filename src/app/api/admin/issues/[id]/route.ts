// PUT /api/admin/issues/[id] - Toggle issue status (OPEN/RESOLVED)
import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/lib/session';
import { updateIssueReport } from '@/lib/db';
import type { SessionData } from '@/types';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    if (!session.isLoggedIn || session.role !== 'admin') {
      return NextResponse.json({ error: 'ไม่มีสิทธิ์เข้าถึง' }, { status: 403 });
    }

    const { id } = await params;
    const { status } = await req.json();

    if (!status || !['OPEN', 'RESOLVED'].includes(status)) {
      return NextResponse.json({ error: 'สถานะไม่ถูกต้อง' }, { status: 400 });
    }

    const updated = updateIssueReport(id, {
      status,
      resolvedAt: status === 'RESOLVED' ? new Date().toISOString() : null,
    });

    if (!updated) {
      return NextResponse.json({ error: 'ไม่พบรายงานปัญหา' }, { status: 404 });
    }

    return NextResponse.json({ success: true, report: updated });
  } catch {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในระบบ' }, { status: 500 });
  }
}
