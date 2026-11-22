// GET /api/equipment?departmentId=xxx
// POST /api/equipment - Add new equipment (with photo & location)
// PUT /api/equipment - Update equipment (location, photo, etc.)
import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/lib/session';
import { getEquipmentByDepartment, createEquipment, updateEquipment, deleteEquipment } from '@/lib/db';
import type { SessionData, Equipment } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const departmentId = req.nextUrl.searchParams.get('departmentId');
    if (!departmentId) {
      return NextResponse.json({ error: 'กรุณาระบุรหัสฝ่าย' }, { status: 400 });
    }
    const equipment = getEquipmentByDepartment(departmentId);
    return NextResponse.json(equipment);
  } catch {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    if (!session.isLoggedIn || session.role !== 'admin') {
      return NextResponse.json({ error: 'ไม่มีสิทธิ์เข้าถึง (ต้องเป็นแอดมิน)' }, { status: 403 });
    }

    const { departmentId, name, code, totalQty, location, image } = await req.json();

    if (!departmentId || !name || !code) {
      return NextResponse.json({ error: 'กรุณาระบุข้อมูลอุปกรณ์ให้ครบถ้วน' }, { status: 400 });
    }

    const qty = Math.max(1, parseInt(totalQty) || 1);
    const newEq = createEquipment(
      departmentId,
      name.trim(),
      code.trim(),
      qty,
      location?.trim() || 'ห้องพัสดุหลัก',
      image || ''
    );

    return NextResponse.json({ success: true, equipment: newEq });
  } catch {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการเพิ่มอุปกรณ์' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    if (!session.isLoggedIn || session.role !== 'admin') {
      return NextResponse.json({ error: 'ไม่มีสิทธิ์เข้าถึง (ต้องเป็นแอดมิน)' }, { status: 403 });
    }

    const { id, name, code, location, image, totalQty, departmentId } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'กรุณาระบุรหัสอุปกรณ์' }, { status: 400 });
    }

    const updates: Partial<Equipment> = {};
    if (name !== undefined && name.trim()) updates.name = name.trim();
    if (code !== undefined && code.trim()) updates.code = code.trim();
    if (location !== undefined) updates.location = location.trim();
    if (image !== undefined) updates.image = image;
    if (totalQty !== undefined) updates.totalQty = Math.max(1, parseInt(totalQty) || 1);
    if (departmentId !== undefined) updates.departmentId = departmentId;

    const updated = updateEquipment(id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'ไม่พบอุปกรณ์' }, { status: 404 });
    }

    return NextResponse.json({ success: true, equipment: updated });
  } catch {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการแก้ไขอุปกรณ์' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    if (!session.isLoggedIn || session.role !== 'admin') {
      return NextResponse.json({ error: 'ไม่มีสิทธิ์เข้าถึง (ต้องเป็นแอดมิน)' }, { status: 403 });
    }

    let id = req.nextUrl.searchParams.get('id');
    if (!id) {
      try {
        const body = await req.json();
        id = body?.id;
      } catch {
        // no body
      }
    }

    if (!id) {
      return NextResponse.json({ error: 'กรุณาระบุรหัสอุปกรณ์ที่ต้องการลบ' }, { status: 400 });
    }

    const result = deleteEquipment(id);
    if (!result.success) {
      return NextResponse.json({ error: result.error || 'ไม่สามารถลบอุปกรณ์ได้' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'ลบอุปกรณ์เรียบร้อยแล้ว' });
  } catch {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการลบอุปกรณ์' }, { status: 500 });
  }
}