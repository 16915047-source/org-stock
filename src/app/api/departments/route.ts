// GET /api/departments
import { NextResponse } from 'next/server';
import { getAllDepartments } from '@/lib/db';

export async function GET() {
  try {
    const departments = getAllDepartments();
    return NextResponse.json(departments);
  } catch {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}
