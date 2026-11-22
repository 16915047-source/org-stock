// ============================================
// ORG Stock - JSON File Database
// ============================================
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { User, Department, Equipment, BorrowRequest, IssueReport } from '@/types';

interface Database {
  users: User[];
  departments: Department[];
  equipment: Equipment[];
  borrowRequests: BorrowRequest[];
  issueReports: IssueReport[];
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'db.json');

export function getDefaultDepartments(): Department[] {
  return [
    {
      id: 'dept-academic',
      name: 'วิชาการ',
      icon: 'academic',
      description: 'อุปกรณ์สื่อการเรียนการสอน หนังสือ ตำรา เครื่องเขียน',
      color: '#B80000',
    },
    {
      id: 'dept-activity',
      name: 'กิจกรรม',
      icon: 'activity',
      description: 'อุปกรณ์สำหรับจัดกิจกรรม สันทนาการ งานอีเวนต์',
      color: '#B80000',
    },
    {
      id: 'dept-welfare',
      name: 'สวัสดิการ',
      icon: 'welfare',
      description: 'อุปกรณ์ปฐมพยาบาล ยา ของใช้ทั่วไป สวัสดิการนักศึกษา',
      color: '#B80000',
    },
    {
      id: 'dept-venue',
      name: 'สถานที่',
      icon: 'venue',
      description: 'โต๊ะ เก้าอี้ เต็นท์ เครื่องมือช่าง อุปกรณ์สถานที่',
      color: '#B80000',
    },
    {
      id: 'dept-av',
      name: 'สื่อโสต',
      icon: 'av',
      description: 'กล้อง ไมโครโฟน โปรเจคเตอร์ ลำโพง สายเชื่อมต่อ',
      color: '#B80000',
    },
  ];
}

export function getDefaultEquipment(): Equipment[] {
  return [
    // วิชาการ
    { id: 'eq-ac-1', departmentId: 'dept-academic', name: 'หนังสือคู่มือวิชาการ', code: 'AC-001', image: '', location: 'ห้องวิชาการ ชั้น 2 ตู้ A-01', totalQty: 10, availableQty: 10 },
    { id: 'eq-ac-2', departmentId: 'dept-academic', name: 'พอยน์เตอร์เลเซอร์นำเสนองาน', code: 'AC-002', image: '', location: 'ลิ้นชักโต๊ะอาจารย์ ห้อง 201', totalQty: 5, availableQty: 5 },
    { id: 'eq-ac-3', departmentId: 'dept-academic', name: 'กระดานไวท์บอร์ดพกพา', code: 'AC-003', image: '', location: 'ห้องเก็บสื่อการเรียนรู้ 203', totalQty: 4, availableQty: 4 },
    { id: 'eq-ac-4', departmentId: 'dept-academic', name: 'เครื่องคำนวณวิทยาศาสตร์', code: 'AC-004', image: '', location: 'ตู้กระจก ห้องวิชาการ ชั้น 2', totalQty: 8, availableQty: 8 },
    // กิจกรรม
    { id: 'eq-act-1', departmentId: 'dept-activity', name: 'โทรโข่งพกพา', code: 'ACT-001', image: '', location: 'ห้องสโมสรนักศึกษา ตู้ B-12', totalQty: 6, availableQty: 6 },
    { id: 'eq-act-2', departmentId: 'dept-activity', name: 'กลองสันทนาการ', code: 'ACT-002', image: '', location: 'ห้องเก็บของใต้สแตนด์เชียร์', totalQty: 3, availableQty: 3 },
    { id: 'eq-act-3', departmentId: 'dept-activity', name: 'ป้ายไวนิลจัดกิจกรรม', code: 'ACT-003', image: '', location: 'ชั้นวางป้าย อาคารกิจกรรม ชั้น 1', totalQty: 10, availableQty: 10 },
    { id: 'eq-act-4', departmentId: 'dept-activity', name: 'วิทยุสื่อสาร วอล์คกี้ทอล์คกี้', code: 'ACT-004', image: '', location: 'กล่องเก็บวิทยุ ชั้น 2 สโมสร', totalQty: 8, availableQty: 8 },
    // สวัสดิการ
    { id: 'eq-wf-1', departmentId: 'dept-welfare', name: 'กล่องปฐมพยาบาลเบื้องต้น', code: 'WF-001', image: '', location: 'ห้องพยาบาล อาคาร 1 ชั้น 1', totalQty: 12, availableQty: 12 },
    { id: 'eq-wf-2', departmentId: 'dept-welfare', name: 'เครื่องวัดความดันพกพา', code: 'WF-002', image: '', location: 'ตู้ยาห้องพยาบาล', totalQty: 3, availableQty: 3 },
    { id: 'eq-wf-3', departmentId: 'dept-welfare', name: 'ร่มส่วนกลาง', code: 'WF-003', image: '', location: 'ที่วางร่ม หน้าตึกอำนวยการ', totalQty: 25, availableQty: 25 },
    { id: 'eq-wf-4', departmentId: 'dept-welfare', name: 'รถเข็นพยาบาล', code: 'WF-004', image: '', location: 'หน้าห้องพยาบาล ชั้น 1', totalQty: 2, availableQty: 2 },
    // สถานที่
    { id: 'eq-vn-1', departmentId: 'dept-venue', name: 'โต๊ะพับขนาดใหญ่', code: 'VN-001', image: '', location: 'โรงเก็บพัสดุกลาง ช่อง D-03', totalQty: 20, availableQty: 20 },
    { id: 'eq-vn-2', departmentId: 'dept-venue', name: 'เก้าอี้พลาสติกสีขาว', code: 'VN-002', image: '', location: 'โรงเก็บพัสดุกลาง แถว A', totalQty: 100, availableQty: 100 },
    { id: 'eq-vn-3', departmentId: 'dept-venue', name: 'เต็นท์สนาม 3x3 เมตร', code: 'VN-003', image: '', location: 'ห้องเก็บเต็นท์ ข้างโรงอาหาร', totalQty: 5, availableQty: 5 },
    { id: 'eq-vn-4', departmentId: 'dept-venue', name: 'สายพ่วงปลั๊กไฟ 20 เมตร', code: 'VN-004', image: '', location: 'ตู้เครื่องมือช่าง ชั้น 1', totalQty: 10, availableQty: 10 },
    // สื่อโสต
    { id: 'eq-av-1', departmentId: 'dept-av', name: 'กล้อง DSLR Canon EOS', code: 'AV-001', image: '', location: 'ห้องศูนย์สื่อโสต ตู้กันชื้น C-01', totalQty: 3, availableQty: 3 },
    { id: 'eq-av-2', departmentId: 'dept-av', name: 'ไมโครโฟนไร้สาย (คู่)', code: 'AV-002', image: '', location: 'กระเป๋าเก็บไมค์ ห้องคอนโทรล', totalQty: 6, availableQty: 6 },
    { id: 'eq-av-3', departmentId: 'dept-av', name: 'โปรเจคเตอร์ Epson', code: 'AV-003', image: '', location: 'ตู้เก็บโปรเจคเตอร์ ห้องโสตฯ 301', totalQty: 4, availableQty: 4 },
    { id: 'eq-av-4', departmentId: 'dept-av', name: 'ลำโพงล้อลากบลูทูธ', code: 'AV-004', image: '', location: 'ห้องซ้อมดนตรี ชั้น 1', totalQty: 4, availableQty: 4 },
    { id: 'eq-av-5', departmentId: 'dept-av', name: 'ขาตั้งกล้องอลูมิเนียม', code: 'AV-005', image: '', location: 'ชั้นวางขาตั้ง ห้องศูนย์สื่อโสต', totalQty: 5, availableQty: 5 },
  ];
}

function getDefaultData(): Database {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    throw new Error('ADMIN_PASSWORD must be set before the database is initialized.');
  }

  return {
    users: [
      {
        id: uuidv4(),
        fullname: 'แอดมิน',
        studentId: adminPassword,
        phone: '081-234-5678',
        profilePhoto: null,
        termsAccepted: false,
        role: 'admin',
        adminTitle: 'ผู้ดูแลระบบหลัก',
        createdAt: new Date().toISOString(),
      },
    ],
    departments: getDefaultDepartments(),
    equipment: getDefaultEquipment(),
    borrowRequests: [],
    issueReports: [],
  };
}

function ensureDbExists(): void {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(getDefaultData(), null, 2), 'utf-8');
  } else {
    try {
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      const data: Database = JSON.parse(raw);
      // Ensure departments match the 5 from PDF
      const pdfDeptNames = ['วิชาการ', 'กิจกรรม', 'สวัสดิการ', 'สถานที่', 'สื่อโสต'];
      const hasMismatch = data.departments.length !== 5 || !data.departments.every((d) => pdfDeptNames.includes(d.name));
      if (hasMismatch) {
        data.departments = getDefaultDepartments();
        data.equipment = getDefaultEquipment();
      }
      const activeBorrowedQty = new Map<string, number>();
      data.borrowRequests
        .filter((request) => request.status === 'APPROVED')
        .forEach((request) => {
          activeBorrowedQty.set(
            request.equipmentId,
            (activeBorrowedQty.get(request.equipmentId) || 0) + (request.quantity || 1)
          );
        });
      let inventoryChanged = hasMismatch;
      data.equipment = data.equipment.map((equipment) => {
        const availableQty = Math.max(
          0,
          equipment.totalQty - (activeBorrowedQty.get(equipment.id) || 0)
        );
        if (equipment.availableQty !== availableQty) inventoryChanged = true;
        return { ...equipment, availableQty };
      });
      if (inventoryChanged) {
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
      }
    } catch (e) {
      console.error('Migration error:', e);
    }
  }
}

function readDb(): Database {
  ensureDbExists();
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}

function writeDb(data: Database): void {
  ensureDbExists();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// ==================== User Operations ====================
export function findUserByStudentId(studentId: string): User | undefined {
  const db = readDb();
  return db.users.find((u) => u.studentId === studentId);
}

export function findUserById(id: string): User | undefined {
  const db = readDb();
  return db.users.find((u) => u.id === id);
}

export function createUser(fullname: string, studentId: string, phone: string): User {
  const db = readDb();
  const user: User = {
    id: uuidv4(),
    fullname,
    studentId,
    phone,
    profilePhoto: null,
    termsAccepted: false,
    role: 'student',
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  writeDb(db);
  return user;
}

export function createAdminUser(fullname: string, studentId: string, phone: string, adminTitle: string): User {
  const db = readDb();
  const user: User = {
    id: uuidv4(),
    fullname,
    studentId,
    phone,
    profilePhoto: null,
    termsAccepted: false,
    role: 'admin',
    adminTitle: adminTitle || 'แอดมิน',
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  writeDb(db);
  return user;
}

export function getAdminUsers(): User[] {
  const db = readDb();
  return db.users.filter((u) => u.role === 'admin');
}

export function updateUser(id: string, updates: Partial<User>): User | null {
  const db = readDb();
  const idx = db.users.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  db.users[idx] = { ...db.users[idx], ...updates };
  writeDb(db);
  return db.users[idx];
}

export function getAllUsers(): User[] {
  const db = readDb();
  return db.users;
}

// ==================== Department Operations ====================
export function getAllDepartments(): Department[] {
  const db = readDb();
  return db.departments;
}

export function getDepartmentById(id: string): Department | undefined {
  const db = readDb();
  return db.departments.find((d) => d.id === id);
}

// ==================== Equipment Operations ====================
export function getEquipmentByDepartment(departmentId: string): Equipment[] {
  const db = readDb();
  return db.equipment.filter((e) => e.departmentId === departmentId);
}

export function getEquipmentById(id: string): Equipment | undefined {
  const db = readDb();
  return db.equipment.find((e) => e.id === id);
}

export function createEquipment(
  departmentId: string,
  name: string,
  code: string,
  totalQty: number,
  location?: string,
  image?: string
): Equipment {
  const db = readDb();
  const eq: Equipment = {
    id: uuidv4(),
    departmentId,
    name,
    code,
    image: image || '',
    location: location || 'ห้องพัสดุหลัก',
    totalQty,
    availableQty: totalQty,
  };
  db.equipment.push(eq);
  writeDb(db);
  return eq;
}

export function updateEquipment(id: string, updates: Partial<Equipment>): Equipment | null {
  const db = readDb();
  const idx = db.equipment.findIndex((e) => e.id === id);
  if (idx === -1) return null;

  const current = db.equipment[idx];

  // If totalQty is updated, safely adjust availableQty
  if (updates.totalQty !== undefined) {
    const borrowedQty = Math.max(0, current.totalQty - current.availableQty);
    const newTotal = Math.max(borrowedQty, updates.totalQty);
    updates.totalQty = newTotal;
    updates.availableQty = newTotal - borrowedQty;
  }

  db.equipment[idx] = { ...current, ...updates };
  writeDb(db);
  return db.equipment[idx];
}

export function syncEquipmentAvailability(equipmentId: string): Equipment | null {
  const db = readDb();
  const equipment = db.equipment.find((item) => item.id === equipmentId);
  if (!equipment) return null;

  const borrowedQty = db.borrowRequests
    .filter((request) => request.equipmentId === equipmentId && request.status === 'APPROVED')
    .reduce((sum, request) => sum + (request.quantity || 1), 0);

  equipment.availableQty = Math.max(0, equipment.totalQty - borrowedQty);
  writeDb(db);
  return equipment;
}

export function deleteEquipment(id: string): { success: boolean; error?: string } {
  const db = readDb();
  const eqIdx = db.equipment.findIndex((e) => e.id === id);
  if (eqIdx === -1) {
    return { success: false, error: 'ไม่พบอุปกรณ์ที่ต้องการลบ' };
  }

  // Check if any ACTIVE borrow requests exist (APPROVED or PENDING)
  const hasActiveBorrows = db.borrowRequests.some(
    (b) => b.equipmentId === id && (b.status === 'APPROVED' || b.status === 'PENDING')
  );
  if (hasActiveBorrows) {
    return {
      success: false,
      error: 'ไม่สามารถลบอุปกรณ์นี้ได้ เนื่องจากมีรายการที่กำลังถูกยืมอยู่หรือรอการอนุมัติ',
    };
  }

  // Remove the equipment
  db.equipment.splice(eqIdx, 1);
  writeDb(db);
  return { success: true };
}

export function createBorrowRequest(data: Omit<BorrowRequest, 'id'>): BorrowRequest {
  const db = readDb();
  const request: BorrowRequest = { id: uuidv4(), ...data };
  db.borrowRequests.push(request);
  writeDb(db);
  return request;
}

export function getAllBorrowRequests(): BorrowRequest[] {
  const db = readDb();
  return db.borrowRequests;
}

export function getBorrowRequestsByUser(userId: string): BorrowRequest[] {
  const db = readDb();
  return db.borrowRequests.filter((request) => request.userId === userId);
}

export function getBorrowRequestById(id: string): BorrowRequest | undefined {
  const db = readDb();
  return db.borrowRequests.find((request) => request.id === id);
}

export function updateBorrowRequest(id: string, updates: Partial<BorrowRequest>): BorrowRequest | null {
  const db = readDb();
  const idx = db.borrowRequests.findIndex((b) => b.id === id);
  if (idx === -1) return null;
  db.borrowRequests[idx] = { ...db.borrowRequests[idx], ...updates };
  writeDb(db);
  return db.borrowRequests[idx];
}

// ==================== Issue Report Operations ====================
export function createIssueReport(data: Omit<IssueReport, 'id' | 'status'>): IssueReport {
  const db = readDb();
  const report: IssueReport = { id: uuidv4(), status: 'OPEN', ...data };
  db.issueReports.push(report);
  writeDb(db);
  return report;
}

export function getAllIssueReports(): IssueReport[] {
  const db = readDb();
  return db.issueReports;
}

export function updateIssueReport(id: string, updates: Partial<IssueReport>): IssueReport | null {
  const db = readDb();
  const idx = db.issueReports.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  db.issueReports[idx] = { ...db.issueReports[idx], ...updates };
  writeDb(db);
  return db.issueReports[idx];
}
