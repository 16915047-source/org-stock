// ============================================
// ORG Stock - Type Definitions
// ============================================

export interface User {
  id: string;
  fullname: string;
  studentId: string; // also used as password
  phone: string; // เบอร์โทรศัพท์ที่ติดต่อได้จริง
  profilePhoto: string | null;
  termsAccepted: boolean;
  role: 'student' | 'admin';
  adminTitle?: string; // ยศ/ตำแหน่งของแอดมิน
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export interface Equipment {
  id: string;
  departmentId: string;
  name: string;
  code: string;
  image: string;
  location?: string; // ตำแหน่งจัดเก็บอุปกรณ์ เช่น ตู้ A1 ชั้น 2, ห้องพัสดุ 104
  totalQty: number;
  availableQty: number;
}

export interface BorrowRequest {
  id: string;
  userId: string;
  equipmentId: string;
  borrowPhoto: string;
  expectedReturnDate: string;
  borrowDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RETURNED_ON_TIME' | 'RETURNED_LATE';
  returnPhoto: string | null;
  actualReturnDate: string | null;
  adminNotes: string | null;
  quantity: number;
  activityName?: string; // ชื่อกิจกรรม/โครงการที่นำไปใช้ยืม
  note?: string; // หมายเหตุเพิ่มเติมในการยืม
  isFollowingUp?: boolean; // แอดมินกดคลิก 'กำลังติดตาม'
  approvedByAdminName?: string | null; // ชื่อแอดมินผู้อนุมัติหรือปฏิเสธ
  followedByAdminName?: string | null; // ชื่อแอดมินผู้ติดตาม
  followedAt?: string | null; // เวลาที่แอดมินกดติดตาม
}

export interface IssueReport {
  id: string;
  userId: string;
  title: string;
  description: string;
  createdAt: string;
  status: 'OPEN' | 'RESOLVED';
  resolvedAt?: string | null;
}

export interface SessionData {
  userId: string;
  role: 'student' | 'admin';
  fullname: string;
  isLoggedIn: boolean;
}
