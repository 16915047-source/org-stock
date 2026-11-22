'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Camera from '@/components/Camera';
import type { Department, Equipment, BorrowRequest, User, IssueReport } from '@/types';
import {
  IconPackage,
  IconMapPin,
  IconPhone,
  IconShield,
  IconDocument,
  IconPencil,
  IconTrash,
  IconClipboard,
  IconMegaphone,
  IconAlertTriangle,
  IconCheckCircle,
  IconClock,
  IconArrowReturn,
  IconXCircle,
  IconFlag,
  IconCalendar,
  IconSparkles,
  DepartmentIcon,
} from '@/components/Icons';

interface ExtendedBorrowRequest extends BorrowRequest {
  userName?: string;
  userStudentId?: string;
  userPhone?: string;
  equipmentName?: string;
  equipmentCode?: string;
  equipmentImage?: string;
  departmentId?: string;
}

export default function HomePage() {
  // ================= Auth States =================
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authName, setAuthName] = useState('');
  const [authStudentId, setAuthStudentId] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(true);

  // ================= Onboarding States =================
  const [onboardingPhoto, setOnboardingPhoto] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // ================= Navigation States =================
  const [userView, setUserView] = useState<'departments' | 'equipment' | 'borrow' | 'returns' | 'report'>('departments');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [myRequests, setMyRequests] = useState<BorrowRequest[]>([]);
  const [userFabExpanded, setUserFabExpanded] = useState(false);

  // Admin Navigation States
  const [adminTab, setAdminTab] = useState<'stock' | 'borrow' | 'return' | 'unreturned' | 'issues'>('stock');
  const [allRequests, setAllRequests] = useState<ExtendedBorrowRequest[]>([]);
  const [reports, setReports] = useState<IssueReport[]>([]);
  const [adminList, setAdminList] = useState<User[]>([]);
  const [selectedStockDept, setSelectedStockDept] = useState<Department | null>(null);
  const [stockEquipment, setStockEquipment] = useState<Equipment[]>([]);
  const [stockDetailEquipment, setStockDetailEquipment] = useState<Equipment | null>(null);

  // ================= Add Equipment Modal States =================
  const [addEquipmentModalOpen, setAddEquipmentModalOpen] = useState(false);
  const [newEqName, setNewEqName] = useState('');
  const [newEqCode, setNewEqCode] = useState('');
  const [newEqLocation, setNewEqLocation] = useState('');
  const [newEqPhoto, setNewEqPhoto] = useState<string | null>(null);
  const [newEqQty, setNewEqQty] = useState(5);
  const [submittingNewEq, setSubmittingNewEq] = useState(false);

  // Edit Equipment Location in detail modal
  const [editingLocation, setEditingLocation] = useState(false);
  const [updatedLocationText, setUpdatedLocationText] = useState('');
  const [savingLocation, setSavingLocation] = useState(false);

  // Edit Equipment Photo in detail modal
  const [editingPhoto, setEditingPhoto] = useState(false);
  const [updatedPhotoData, setUpdatedPhotoData] = useState<string | null>(null);
  const [savingPhoto, setSavingPhoto] = useState(false);

  // ================= Edit & Delete Equipment States =================
  const [editEquipmentModalOpen, setEditEquipmentModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [editEqName, setEditEqName] = useState('');
  const [editEqCode, setEditEqCode] = useState('');
  const [editEqLocation, setEditEqLocation] = useState('');
  const [editEqPhoto, setEditEqPhoto] = useState<string | null>(null);
  const [editEqQty, setEditEqQty] = useState(1);
  const [submittingEditEq, setSubmittingEditEq] = useState(false);

  // Delete Equipment Confirmation State
  const [deleteConfirmEquipment, setDeleteConfirmEquipment] = useState<Equipment | null>(null);
  const [submittingDeleteEq, setSubmittingDeleteEq] = useState(false);

  // ================= Add Admin Modal States =================
  const [addAdminModalOpen, setAddAdminModalOpen] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminStudentId, setNewAdminStudentId] = useState('');
  const [newAdminPhone, setNewAdminPhone] = useState('');
  const [newAdminTitle, setNewAdminTitle] = useState('');
  const [submittingNewAdmin, setSubmittingNewAdmin] = useState(false);

  // ================= Borrow & Return Modal States =================
  const [selectedBorrowEquipment, setSelectedBorrowEquipment] = useState<Equipment | null>(null);
  const [borrowPhoto, setBorrowPhoto] = useState<string | null>(null);
  const [borrowQty, setBorrowQty] = useState(1);
  const [borrowActivityName, setBorrowActivityName] = useState('');
  const [borrowNote, setBorrowNote] = useState('');
  const [expectedDateInput, setExpectedDateInput] = useState('');
  const [expectedDateTime, setExpectedDateTime] = useState('17:00');
  const [submittingBorrow, setSubmittingBorrow] = useState(false);

  const [selectedReturnRequest, setSelectedReturnRequest] = useState<BorrowRequest | null>(null);
  const [returnPhoto, setReturnPhoto] = useState<string | null>(null);
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [returnResult, setReturnResult] = useState<{ status: string; message: string } | null>(null);

  // ================= Issue Report Modal States =================
  const [reportTitle, setReportTitle] = useState('');
  const [reportDesc, setReportDesc] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  // Photo Preview Modal
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  // Notification Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load Session
  const checkSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      if (data.isLoggedIn && data.user) {
        setCurrentUser(data.user);
        setIsLoggedIn(true);
      } else {
        setCurrentUser(null);
        setIsLoggedIn(false);
      }
    } catch {
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Load Departments
  const loadDepartments = useCallback(async () => {
    try {
      const res = await fetch('/api/departments');
      const data = await res.json();
      if (Array.isArray(data)) {
        setDepartments(data);
        if (!selectedStockDept && data.length > 0) {
          setSelectedStockDept(data[0]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [selectedStockDept]);

  // Load User Requests
  const loadMyRequests = useCallback(async () => {
    try {
      const res = await fetch('/api/borrow');
      const data = await res.json();
      if (Array.isArray(data)) {
        setMyRequests(data);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Load Admin Data
  const loadAdminData = useCallback(async () => {
    try {
      const [borrowRes, reportsRes, adminRes] = await Promise.all([
        fetch('/api/admin/borrow'),
        fetch('/api/reports'),
        fetch('/api/admin/admins'),
      ]);
      const borrowData = await borrowRes.json();
      const reportsData = await reportsRes.json();
      const adminData = await adminRes.json();
      if (Array.isArray(borrowData)) setAllRequests(borrowData);
      if (Array.isArray(reportsData)) setReports(reportsData);
      if (Array.isArray(adminData)) setAdminList(adminData);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Load Stock Equipment for Admin
  const loadStockEquipment = useCallback(async (deptId: string) => {
    try {
      const res = await fetch(`/api/equipment?departmentId=${deptId}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setStockEquipment(data);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (selectedStockDept) {
      loadStockEquipment(selectedStockDept.id);
    }
  }, [selectedStockDept, loadStockEquipment]);

  useEffect(() => {
    if (isLoggedIn) {
      loadDepartments();
      loadMyRequests();
      if (currentUser?.role === 'admin') {
        loadAdminData();
      }
    }
  }, [isLoggedIn, currentUser, loadDepartments, loadMyRequests, loadAdminData]);

  // Handle Select Department for User
  const handleSelectDepartment = async (dept: Department) => {
    setSelectedDept(dept);
    try {
      const res = await fetch(`/api/equipment?departmentId=${dept.id}`);
      const data = await res.json();
      setEquipmentList(Array.isArray(data) ? data : []);
      setUserView('equipment');
    } catch (e) {
      console.error(e);
      showToast('ไม่สามารถโหลดอุปกรณ์ได้', 'error');
    }
  };

  // Open Borrow Screen
  const handleOpenBorrowScreen = (eq: Equipment) => {
    setSelectedBorrowEquipment(eq);
    setBorrowPhoto(null);
    setBorrowQty(1);
    setBorrowActivityName('');
    setBorrowNote('');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setExpectedDateInput(
      `${String(tomorrow.getDate()).padStart(2, '0')}/${String(tomorrow.getMonth() + 1).padStart(2, '0')}/${tomorrow.getFullYear() + 543}`
    );
    setExpectedDateTime('17:00');
    setUserView('borrow');
  };

  // Open Return Screen
  const handleOpenReturnScreen = (req: BorrowRequest) => {
    setSelectedReturnRequest(req);
    setReturnPhoto(null);
    setReturnResult(null);
    setUserView('returns');
  };

  // Handle Login/Register
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!authName.trim() || !authStudentId.trim()) {
      setAuthError('กรุณากรอกชื่อและรหัสนักศึกษา');
      return;
    }
    if (authMode === 'register' && !authPhone.trim()) {
      setAuthError('กรุณากรอกเบอร์โทรศัพท์ที่ติดต่อได้จริง');
      return;
    }

    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullname: authName.trim(),
          studentId: authStudentId.trim(),
          phone: authPhone.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setAuthError(data.error || 'เกิดข้อผิดพลาด');
        return;
      }

      await checkSession();
      showToast(authMode === 'login' ? 'เข้าสู่ระบบสำเร็จ' : 'สมัครสมาชิกสำเร็จ', 'success');
    } catch {
      setAuthError('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้');
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    await fetch('/api/auth/session', { method: 'DELETE' });
    setCurrentUser(null);
    setIsLoggedIn(false);
    setUserView('departments');
    showToast('ออกจากระบบแล้ว', 'info');
  };

  // Handle Onboarding Completion
  const handleCompleteOnboarding = async () => {
    if (!onboardingPhoto) {
      showToast('กรุณาเพิ่มรูปโปรไฟล์', 'error');
      return;
    }
    if (!termsAccepted) {
      showToast('กรุณากดยอมรับเงื่อนไขและข้อบังคับ', 'error');
      return;
    }

    setSavingProfile(true);
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profilePhoto: onboardingPhoto, termsAccepted: true }),
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentUser(data.user);
        showToast('ยอมรับเงื่อนไขและบันทึกโปรไฟล์เรียบร้อย', 'success');
      } else {
        showToast(data.error || 'บันทึกไม่สำเร็จ', 'error');
      }
    } catch {
      showToast('เกิดข้อผิดพลาดในการบันทึก', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Add Equipment (Stock Check Feature with Location & Photo)
  const handleAddEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStockDept) return;
    if (!newEqName.trim() || !newEqCode.trim()) {
      showToast('กรุณากรอกชื่อและรหัสอุปกรณ์', 'error');
      return;
    }
    if (!newEqPhoto) {
      showToast('กรุณาถ่ายรูปอุปกรณ์', 'error');
      return;
    }
    if (!newEqLocation.trim()) {
      showToast('กรุณาระบุตำแหน่งจัดเก็บอุปกรณ์', 'error');
      return;
    }

    setSubmittingNewEq(true);
    try {
      const res = await fetch('/api/equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          departmentId: selectedStockDept.id,
          name: newEqName.trim(),
          code: newEqCode.trim(),
          totalQty: newEqQty || 1,
          location: newEqLocation.trim() || 'ห้องพัสดุหลัก',
          image: newEqPhoto || '',
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(`เพิ่มอุปกรณ์ "${newEqName}" พร้อมรูปและตำแหน่งสำเร็จ!`, 'success');
        setNewEqName('');
        setNewEqCode('');
        setNewEqLocation('');
        setNewEqPhoto(null);
        setNewEqQty(5);
        setAddEquipmentModalOpen(false);
        loadStockEquipment(selectedStockDept.id);
      } else {
        showToast(data.error || 'ไม่สามารถเพิ่มอุปกรณ์ได้', 'error');
      }
    } catch {
      showToast('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้', 'error');
    } finally {
      setSubmittingNewEq(false);
    }
  };

  // Handle Edit Equipment Location
  const handleSaveLocation = async (equipmentId: string) => {
    if (!updatedLocationText.trim()) return;
    setSavingLocation(true);
    try {
      const res = await fetch('/api/equipment', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: equipmentId,
          location: updatedLocationText.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.equipment) {
        setStockDetailEquipment(data.equipment);
        showToast('อัปเดตตำแหน่งจัดเก็บเรียบร้อยแล้ว', 'success');
        setEditingLocation(false);
        if (selectedStockDept) loadStockEquipment(selectedStockDept.id);
      } else {
        showToast('ไม่สามารถอัปเดตตำแหน่งได้', 'error');
      }
    } catch {
      showToast('เกิดข้อผิดพลาด', 'error');
    } finally {
      setSavingLocation(false);
    }
  };

  // Handle Edit Equipment Photo
  const handleSavePhoto = async (equipmentId: string) => {
    if (!updatedPhotoData) {
      showToast('กรุณาถ่ายรูปอุปกรณ์', 'error');
      return;
    }
    setSavingPhoto(true);
    try {
      const res = await fetch('/api/equipment', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: equipmentId,
          image: updatedPhotoData,
        }),
      });
      const data = await res.json();
      if (res.ok && data.equipment) {
        setStockDetailEquipment(data.equipment);
        setEditingPhoto(false);
        setUpdatedPhotoData(null);
        showToast('อัปเดตรูปอุปกรณ์เรียบร้อยแล้ว', 'success');
        if (selectedStockDept) loadStockEquipment(selectedStockDept.id);
      } else {
        showToast(data.error || 'ไม่สามารถอัปเดตรูปอุปกรณ์ได้', 'error');
      }
    } catch {
      showToast('เกิดข้อผิดพลาด', 'error');
    } finally {
      setSavingPhoto(false);
    }
  };

  // Handle Open Edit Equipment Modal
  const handleOpenEditEquipment = (eq: Equipment) => {
    setEditingEquipment(eq);
    setEditEqName(eq.name);
    setEditEqCode(eq.code);
    setEditEqLocation(eq.location || 'ห้องพัสดุหลัก');
    setEditEqQty(eq.totalQty);
    setEditEqPhoto(eq.image || null);
    setEditEquipmentModalOpen(true);
  };

  // Handle Save Edited Equipment
  const handleSaveEditEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEquipment) return;
    if (!editEqName.trim() || !editEqCode.trim()) {
      showToast('กรุณากรอกชื่อและรหัสอุปกรณ์', 'error');
      return;
    }
    if (!editEqLocation.trim()) {
      showToast('กรุณาระบุตำแหน่งจัดเก็บ', 'error');
      return;
    }

    setSubmittingEditEq(true);
    try {
      const res = await fetch('/api/equipment', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingEquipment.id,
          name: editEqName.trim(),
          code: editEqCode.trim(),
          location: editEqLocation.trim(),
          totalQty: editEqQty || 1,
          image: editEqPhoto || '',
        }),
      });

      const data = await res.json();
      if (res.ok && data.equipment) {
        showToast(`แก้ไขข้อมูลอุปกรณ์ "${editEqName}" สำเร็จ!`, 'success');
        setEditEquipmentModalOpen(false);
        if (stockDetailEquipment?.id === editingEquipment.id) {
          setStockDetailEquipment(data.equipment);
        }
        if (selectedStockDept) {
          loadStockEquipment(selectedStockDept.id);
        }
      } else {
        showToast(data.error || 'ไม่สามารถแก้ไขอุปกรณ์ได้', 'error');
      }
    } catch {
      showToast('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์', 'error');
    } finally {
      setSubmittingEditEq(false);
    }
  };

  // Handle Confirm Delete Equipment
  const handleConfirmDeleteEquipment = async () => {
    if (!deleteConfirmEquipment) return;
    setSubmittingDeleteEq(true);
    try {
      const res = await fetch(`/api/equipment?id=${deleteConfirmEquipment.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`ลบอุปกรณ์ "${deleteConfirmEquipment.name}" เรียบร้อยแล้ว`, 'success');
        if (stockDetailEquipment?.id === deleteConfirmEquipment.id) {
          setStockDetailEquipment(null);
        }
        setDeleteConfirmEquipment(null);
        if (selectedStockDept) {
          loadStockEquipment(selectedStockDept.id);
        }
      } else {
        showToast(data.error || 'ไม่สามารถลบอุปกรณ์ได้', 'error');
      }
    } catch {
      showToast('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์', 'error');
    } finally {
      setSubmittingDeleteEq(false);
    }
  };

  // Handle Add Co-Admin
  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminName.trim() || !newAdminStudentId.trim() || !newAdminPhone.trim()) {
      showToast('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
      return;
    }

    setSubmittingNewAdmin(true);
    try {
      const res = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullname: newAdminName.trim(),
          studentId: newAdminStudentId.trim(),
          phone: newAdminPhone.trim(),
          adminTitle: newAdminTitle.trim() || 'แอดมิน',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`เพิ่มแอดมิน "${newAdminName}" สำเร็จ!`, 'success');
        setNewAdminName('');
        setNewAdminStudentId('');
        setNewAdminPhone('');
        setNewAdminTitle('');
        setAddAdminModalOpen(false);
        loadAdminData();
      } else {
        showToast(data.error || 'ไม่สามารถเพิ่มแอดมินได้', 'error');
      }
    } catch {
      showToast('เชื่อมต่อไม่ได้', 'error');
    } finally {
      setSubmittingNewAdmin(false);
    }
  };

  // Submit Borrow Request
  const handleSubmitBorrow = async () => {
    if (!selectedBorrowEquipment) return;
    if (!borrowActivityName.trim()) {
      showToast('กรุณาระบุชื่อกิจกรรมที่จะนำอุปกรณ์ไปใช้', 'error');
      return;
    }
    if (!borrowPhoto) {
      showToast('กรุณาถ่ายรูปอุปกรณ์คู่กับหน้าผู้ใช้', 'error');
      return;
    }
    const rawDate = expectedDateInput.trim();
    const dateParts = rawDate.includes('/')
      ? rawDate.split('/')
      : rawDate.length === 8
        ? [rawDate.slice(0, 2), rawDate.slice(2, 4), rawDate.slice(4)]
        : [];
    if (dateParts.length !== 3 || !dateParts.every((part) => /^\d+$/.test(part))) {
      showToast('กรุณาระบุวันที่ในรูปแบบ วัน/เดือน/ปี เช่น 25/12/2569', 'error');
      return;
    }
    const day = Number(dateParts[0]);
    const month = Number(dateParts[1]);
    const enteredYear = Number(dateParts[2]);
    const year = enteredYear >= 2400 ? enteredYear - 543 : enteredYear;
    const timeParts = expectedDateTime.split(':');
    const hours = Number(timeParts[0]);
    const minutes = Number(timeParts[1]);
    if (
      day < 1 || day > 31 ||
      month < 1 || month > 12 ||
      dateParts[2].length !== 4 ||
      year < 2020 ||
      timeParts.length !== 2 ||
      hours < 0 || hours > 23 ||
      minutes < 0 || minutes > 59
    ) {
      showToast('วันที่หรือเวลาไม่ถูกต้อง กรุณาตรวจสอบวัน/เดือน/ปีและเวลา', 'error');
      return;
    }
    const parsedReturnDate = new Date(year, month - 1, day, hours, minutes, 0);
    if (
      parsedReturnDate.getFullYear() !== year ||
      parsedReturnDate.getMonth() !== month - 1 ||
      parsedReturnDate.getDate() !== day
    ) {
      showToast('รูปแบบวันที่ไม่ถูกต้อง กรุณาใส่ วัน/เดือน/ปี', 'error');
      return;
    }
    const finalExpectedDate = parsedReturnDate.toISOString();

    setSubmittingBorrow(true);
    try {
      const res = await fetch('/api/borrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipmentId: selectedBorrowEquipment.id,
          borrowPhoto,
          expectedReturnDate: finalExpectedDate,
          quantity: borrowQty,
          activityName: borrowActivityName.trim(),
          note: borrowNote.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast('ส่งคำขอยืมสำเร็จ! รอแอดมินอนุมัติ', 'success');
        setBorrowActivityName('');
        setBorrowNote('');
        loadMyRequests();
        if (selectedDept) handleSelectDepartment(selectedDept);
        setUserView('departments');
      } else {
        showToast(data.error || 'เกิดข้อผิดพลาด', 'error');
      }
    } catch {
      showToast('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้', 'error');
    } finally {
      setSubmittingBorrow(false);
    }
  };

  // Submit Return
  const handleSubmitReturn = async () => {
    if (!selectedReturnRequest) return;
    if (!returnPhoto) {
      showToast('กรุณาถ่ายรูปอุปกรณ์ตอนคืน', 'error');
      return;
    }

    setSubmittingReturn(true);
    try {
      const res = await fetch('/api/return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          borrowRequestId: selectedReturnRequest.id,
          returnPhoto,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        const isLate = data.borrowRequest.status === 'RETURNED_LATE';
        setReturnResult({
          status: isLate ? 'ล่าช้า' : 'ตรงเวลา',
          message: isLate ? 'ส่งคืนสำเร็จ (สถานะ: คืนล่าช้า)' : 'ส่งคืนสำเร็จ (สถานะ: คืนตรงเวลา)',
        });
        loadMyRequests();
        if (selectedDept) handleSelectDepartment(selectedDept);
        if (selectedStockDept) loadStockEquipment(selectedStockDept.id);
      } else {
        showToast(data.error || 'เกิดข้อผิดพลาดในการคืน', 'error');
      }
    } catch {
      showToast('เชื่อมต่อไม่ได้', 'error');
    } finally {
      setSubmittingReturn(false);
    }
  };

  // Submit Report
  const handleSubmitReport = async () => {
    if (!reportTitle.trim() || !reportDesc.trim()) {
      showToast('กรุณากรอกหัวข้อและรายละเอียดปัญหา', 'error');
      return;
    }

    setSubmittingReport(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: reportTitle.trim(), description: reportDesc.trim() }),
      });
      if (res.ok) {
        showToast('ส่งรายงานปัญหาเรียบร้อยแล้ว ขอบคุณครับ', 'success');
        setReportTitle('');
        setReportDesc('');
        setUserView('departments');
      } else {
        showToast('เกิดข้อผิดพลาด', 'error');
      }
    } catch {
      showToast('เชื่อมต่อไม่ได้', 'error');
    } finally {
      setSubmittingReport(false);
    }
  };

  // Admin Approve / Reject with Admin Name recording
  const handleAdminAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch(`/api/admin/borrow/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        showToast(
          action === 'approve'
            ? `อนุมัติการยืมเรียบร้อย (โดย: ${currentUser?.fullname})`
            : `ปฏิเสธคำขอแล้ว (โดย: ${currentUser?.fullname})`,
          'success'
        );
        loadAdminData();
        if (selectedStockDept) loadStockEquipment(selectedStockDept.id);
      } else {
        showToast('ดำเนินการไม่สำเร็จ', 'error');
      }
    } catch {
      showToast('เกิดข้อผิดพลาด', 'error');
    }
  };

  // Admin Follow-up with Admin Name recording
  const handleToggleFollowUp = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/borrow/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'followUp', isFollowingUp: !currentStatus }),
      });
      if (res.ok) {
        showToast(
          !currentStatus
            ? `กำลังติดตามโดย: ${currentUser?.fullname}`
            : 'ยกเลิกสถานะกำลังติดตาม',
          'info'
        );
        loadAdminData();
      }
    } catch {
      showToast('เกิดข้อผิดพลาด', 'error');
    }
  };

  // Admin Toggle Issue Resolved
  const handleToggleIssueResolved = async (id: string, currentStatus: 'OPEN' | 'RESOLVED') => {
    const newStatus = currentStatus === 'OPEN' ? 'RESOLVED' : 'OPEN';
    try {
      const res = await fetch(`/api/admin/issues/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        showToast(newStatus === 'RESOLVED' ? 'แก้ไขเรียบร้อยแล้ว' : 'รอการแก้ไข', 'success');
        loadAdminData();
      }
    } catch {
      showToast('เกิดข้อผิดพลาด', 'error');
    }
  };

  // Filter Active & Pending
  const activeBorrows = myRequests.filter((r) => r.status === 'APPROVED');
  const pendingRequests = useMemo(() => allRequests.filter((r) => r.status === 'PENDING'), [allRequests]);
  const returnedRequests = useMemo(() => allRequests.filter((r) => r.status === 'RETURNED_ON_TIME' || r.status === 'RETURNED_LATE'), [allRequests]);
  const unreturnedRequests = useMemo(() => allRequests.filter((r) => r.status === 'APPROVED'), [allRequests]);

  // Group Pending Requests by Activity (Admin)
  const pendingByActivity = useMemo(() => {
    const map = new Map<string, ExtendedBorrowRequest[]>();
    pendingRequests.forEach((req) => {
      const act = req.activityName?.trim() || 'กิจกรรมทั่วไป';
      if (!map.has(act)) map.set(act, []);
      map.get(act)!.push(req);
    });
    return Array.from(map.entries()).map(([activityName, items]) => ({
      activityName,
      items,
      totalQty: items.reduce((sum, i) => sum + (i.quantity || 1), 0),
      users: Array.from(
        new Map(
          items.map((item) => [
            item.userId,
            {
              userId: item.userId,
              userName: item.userName || 'ไม่ทราบ',
              userStudentId: item.userStudentId || '',
              userPhone: item.userPhone || 'ไม่ระบุ',
              note: item.note?.trim() || '',
            },
          ])
        ).values()
      ),
      expectedReturnDate: items[0]?.expectedReturnDate,
    }));
  }, [pendingRequests]);

  // Group Returned Requests by Activity (Admin)
  const returnedByActivity = useMemo(() => {
    const map = new Map<string, ExtendedBorrowRequest[]>();
    allRequests
      .filter((req) => req.status === 'APPROVED' || req.status === 'RETURNED_ON_TIME' || req.status === 'RETURNED_LATE')
      .forEach((req) => {
      const act = req.activityName?.trim() || 'กิจกรรมทั่วไป';
      if (!map.has(act)) map.set(act, []);
      map.get(act)!.push(req);
      });
    return Array.from(map.entries()).map(([activityName, items]) => ({
      activityName,
      items,
      totalQty: items.reduce((sum, i) => sum + (i.quantity || 1), 0),
      returnedCount: items.filter((i) => i.status === 'RETURNED_ON_TIME' || i.status === 'RETURNED_LATE').length,
      returnedQty: items
        .filter((i) => i.status === 'RETURNED_ON_TIME' || i.status === 'RETURNED_LATE')
        .reduce((sum, i) => sum + (i.quantity || 1), 0),
      outstandingCount: items.filter((i) => i.status === 'APPROVED').length,
      onTimeCount: items.filter((i) => i.status === 'RETURNED_ON_TIME').length,
      lateCount: items.filter((i) => i.status === 'RETURNED_LATE').length,
    }));
  }, [allRequests]);

  // Group Unreturned Requests by Activity (Admin)
  const unreturnedByActivity = useMemo(() => {
    const map = new Map<string, ExtendedBorrowRequest[]>();
    unreturnedRequests.forEach((req) => {
      const act = req.activityName?.trim() || 'กิจกรรมทั่วไป';
      if (!map.has(act)) map.set(act, []);
      map.get(act)!.push(req);
    });
    return Array.from(map.entries()).map(([activityName, items]) => ({
      activityName,
      items,
      totalQty: items.reduce((sum, i) => sum + (i.quantity || 1), 0),
      hasOverdue: items.some((i) => new Date() > new Date(i.expectedReturnDate)),
    }));
  }, [unreturnedRequests]);

  // Group User Active Borrows by Activity (User View)
  const userActiveByActivity = useMemo(() => {
    const map = new Map<string, ExtendedBorrowRequest[]>();
    activeBorrows.forEach((req) => {
      const act = req.activityName?.trim() || 'กิจกรรมทั่วไป';
      if (!map.has(act)) map.set(act, []);
      map.get(act)!.push(req as ExtendedBorrowRequest);
    });
    return Array.from(map.entries()).map(([activityName, items]) => ({
      activityName,
      items,
      totalQty: items.reduce((sum, i) => sum + (i.quantity || 1), 0),
      note: items.find((i) => i.note)?.note,
      expectedReturnDate: items[0]?.expectedReturnDate,
    }));
  }, [activeBorrows]);

  // Borrowers for selected equipment in Stock view
  const equipmentBorrowers = useMemo(() => {
    if (!stockDetailEquipment) return [];
    return allRequests.filter((r) => r.equipmentId === stockDetailEquipment.id && r.status === 'APPROVED');
  }, [stockDetailEquipment, allRequests]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#B34453] to-[#78343D]">
        <img src="/aru-student-org.jpg" alt="ARU Student Organization Logo" className="w-20 h-20 mb-4 animate-pulse object-contain rounded-2xl shadow-md" />
        <div className="w-10 h-10 border-4 border-[#E8A9B0] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-[#E8A9B0] text-xs font-semibold tracking-wide">กำลังโหลดระบบ...</p>
      </div>
    );
  }

  // ================= 1. LOGIN / REGISTER SCREEN =================
  if (!isLoggedIn || !currentUser) {
    return (
      <div className="min-h-screen auth-scene bg-gradient-to-br from-[#B34453] via-[#963B48] to-[#78343D] py-10 px-4 flex items-center justify-center font-thai">
        {toast && (
          <div className="fixed top-6 z-50 px-6 py-3 rounded-full shadow-2xl text-xs font-bold bg-[#E8A9B0] text-[#B34453] animate-bounce">
            {toast.message}
          </div>
        )}

        <div className="auth-panel w-full max-w-[420px] bg-white/95 backdrop-blur-xl rounded-[36px] border border-slate-200 shadow-2xl p-8 flex flex-col justify-between">
          <div>
            {/* ARU Student Organization Logo & Branding */}
            <div className="text-center mb-8">
              <div className="brand-emblem w-24 h-24 mx-auto mb-3 transform hover:scale-105 transition-transform">
                <img src="/aru-student-org.jpg" alt="ARU Student Organization" className="w-full h-full object-contain drop-shadow-lg rounded-2xl" />
              </div>
              <h1 className="text-2xl font-extrabold text-[#B34453] tracking-tight inline-flex items-center gap-2">
                <IconSparkles className="w-4 h-4 text-emerald-600" />
                ARU Stock
                <IconSparkles className="w-4 h-4 text-[#B34453]" />
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-1">ระบบยืม-คืนอุปกรณ์และพัสดุ</p>
              <p className="text-[11px] text-emerald-700 font-bold">องค์การบริหาร องค์การนักศึกษา มรภ.พระนครศรีอยุธยา</p>
            </div>

            {/* Mode Switcher */}
            <div className="flex bg-[#F5F6F5] p-1.5 rounded-2xl mb-6">
              <button
                onClick={() => { setAuthMode('login'); setAuthError(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  authMode === 'login' ? 'bg-[#B34453] text-white shadow-md' : 'text-slate-600 hover:text-black'
                }`}
              >
                เข้าสู่ระบบ
              </button>
              <button
                onClick={() => { setAuthMode('register'); setAuthError(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  authMode === 'register' ? 'bg-[#B34453] text-white shadow-md' : 'text-slate-600 hover:text-black'
                }`}
              >
                สมัครสมาชิก
              </button>
            </div>

            {authError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-[#B34453] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5">
                <IconAlertTriangle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">ชื่อ - นามสกุล *</label>
                <input
                  type="text"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  placeholder=""
                  className="w-full bg-slate-50 border-b-2 border-slate-400 focus:border-[#B34453] outline-none px-3 py-2 text-sm font-medium rounded-t-lg transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {authMode === 'login' ? 'รหัสนักศึกษา / รหัสแอดมิน' : 'รหัสนักศึกษา'} <span className="text-slate-400 font-normal">(ใช้เป็นรหัสผ่าน) *</span>
                </label>
                <input
                  type="text"
                  value={authStudentId}
                  onChange={(e) => setAuthStudentId(e.target.value)}
                  placeholder=""
                  className="w-full bg-slate-50 border-b-2 border-slate-400 focus:border-[#B34453] outline-none px-3 py-2 text-sm font-medium rounded-t-lg transition-colors"
                  required
                />
              </div>

              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">เบอร์โทรศัพท์ที่ติดต่อได้จริง *</label>
                  <input
                    type="tel"
                    value={authPhone}
                    onChange={(e) => setAuthPhone(e.target.value)}
                    placeholder=""
                    className="w-full bg-slate-50 border-b-2 border-slate-400 focus:border-[#B34453] outline-none px-3 py-2 text-sm font-medium rounded-t-lg transition-colors"
                    required
                  />
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="auth-primary w-full py-3 rounded-full bg-gradient-to-r from-[#B34453] to-[#78343D] hover:from-[#963B48] hover:to-[#B34453] text-white font-bold text-sm shadow-lg shadow-[#B34453]/20 active:scale-95 transition-all"
                >
                  <span>{authMode === 'login' ? 'Login เข้าสู่ระบบ' : 'สร้างบัญชีผู้ใช้งาน'}</span>
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    );
  }

  // ================= 2. ONBOARDING SCREEN =================
  if (!currentUser.termsAccepted || !currentUser.profilePhoto) {
    return (
      <div className="min-h-screen auth-scene bg-gradient-to-br from-[#B34453] via-[#963B48] to-[#78343D] py-8 px-4 flex items-center justify-center font-thai">
        {toast && (
          <div className="fixed top-6 z-50 px-6 py-3 rounded-full shadow-2xl text-xs font-bold bg-[#E8A9B0] text-[#B34453] animate-bounce">
            {toast.message}
          </div>
        )}

        <div className="w-full max-w-[420px] bg-white rounded-[36px] border border-slate-200 shadow-2xl p-6 flex flex-col justify-between space-y-5">
          <div className="text-center">
            <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 bg-[#B34453]/10 text-[#B34453] rounded-full">
              ขั้นตอนเริ่มต้น
            </span>
            <h2 className="text-lg font-black text-slate-900 mt-2">เพิ่มรูปโปรไฟล์และยอมรับข้อตกลง</h2>
          </div>

          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-[#B34453] mx-auto flex items-center justify-center relative shadow-lg overflow-hidden border-2 border-slate-200">
              {onboardingPhoto ? (
                <img src={onboardingPhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-[#E8A9B0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <p className="text-xs font-bold text-slate-700 mt-2">ถ่ายรูปหน้าผู้ใช้งาน</p>

            <div className="mt-2">
              <Camera label="" onCapture={(dataUrl) => setOnboardingPhoto(dataUrl)} />
            </div>
          </div>

          <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-slate-200 space-y-2">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <IconDocument className="w-4 h-4 text-[#B34453]" />
              <span>กฎการยืมและคืนอุปกรณ์</span>
            </h3>
            <div className="text-[11px] text-slate-600 space-y-1.5 leading-relaxed max-h-36 overflow-y-auto pr-1">
              <p>1. ตรวจสอบสภาพอุปกรณ์ก่อนนำไปใช้งานทุกครั้ง</p>
              <p>2. ใช้งานอุปกรณ์ด้วยความระมัดระวังตามวัตถุประสงค์</p>
              <p>3. ต้องส่งคืนอุปกรณ์ตรงตามวันและเวลาที่ระบุไว้ในระบบ</p>
              <p>4. หากส่งคืนเกินเวลา ระบบจะขึ้นสถานะ <strong>&quot;ล่าช้า&quot;</strong></p>
              <p>5. กรณีชำรุดเสียหาย ผู้ยืมต้องรับผิดชอบตามระเบียบองค์กร</p>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none px-1">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
            />
            <span className="text-xs font-bold text-slate-800">
              ยอมรับเงื่อนไขและข้อบังคับการใช้งาน
            </span>
          </label>

          <div className="pt-2">
            <button
              onClick={handleCompleteOnboarding}
              disabled={savingProfile || !onboardingPhoto || !termsAccepted}
              className={`w-full py-3 rounded-full font-bold text-xs shadow-lg transition-all ${
                onboardingPhoto && termsAccepted && !savingProfile
                  ? 'bg-gradient-to-r from-[#B34453] to-[#78343D] text-white hover:opacity-95 active:scale-95'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {savingProfile ? 'กำลังบันทึกข้อมูล...' : 'ดำเนินการต่อ เข้าสู่ระบบ'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================= 3. ADMIN PORTAL (Modern Red & Slate Theme) =================
  if (currentUser.role === 'admin') {
    return (
      <div className="min-h-screen portal-shell bg-[#F5F6F5] flex flex-col font-thai pb-24">
        {toast && (
          <div className="fixed top-6 right-6 z-50 px-6 py-3 rounded-full shadow-2xl text-xs font-bold bg-[#E8A9B0] text-[#B34453] animate-bounce">
            {toast.message}
          </div>
        )}

        {/* Modern Top Header */}
        <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-slate-200 bg-white p-0.5">
                <img src="/aru-student-org.jpg" alt="ARU Student Organization" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-extrabold text-[#B34453] text-base leading-none">ARU Stock Admin</h1>
                  <span className="bg-[#B34453]/10 text-[#B34453] text-[10px] font-black px-2 py-0.5 rounded-full">
                    {currentUser.adminTitle || 'แอดมิน'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">ระบบควบคุมสต็อกและการอนุมัติยืม-คืน</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-100 py-1.5 px-3 rounded-full border border-slate-200">
                <div className="w-7 h-7 rounded-full bg-[#B34453] text-white text-xs font-bold flex items-center justify-center">
                  {currentUser.fullname.slice(0, 1)}
                </div>
                <div className="hidden sm:block text-left text-xs font-bold text-slate-800">
                  {currentUser.fullname}
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-[#B34453] hover:bg-red-50 rounded-xl transition-colors"
              >
                ออกจากระบบ
              </button>
            </div>
          </div>

          {/* 5 Main Admin Tabs */}
          <div className="max-w-5xl mx-auto px-4 flex gap-2 border-t border-slate-100 overflow-x-auto text-xs font-bold">
            <button
              onClick={() => setAdminTab('stock')}
              className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                adminTab === 'stock'
                  ? 'border-[#B34453] text-[#B34453]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-4 h-4"><path d="M4 7.5h16v11H4zM4 7.5l3-3h10l3 3M8 12h8" /></svg>
                เช็คสต็อก & เพิ่มอุปกรณ์
              </span>
            </button>
            <button
              onClick={() => setAdminTab('borrow')}
              className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                adminTab === 'borrow'
                  ? 'border-[#B34453] text-[#B34453]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="flex items-center gap-1.5"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-4 h-4"><path d="M6 3h9l3 3v15H6zM9 7h6M9 11h6M9 15h4" /></svg>การอนุมัติยืม</span>
              {pendingRequests.length > 0 && (
                <span className="bg-[#B34453] text-white rounded-full px-2 py-0.2 text-[10px] font-bold">
                  {pendingRequests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setAdminTab('return')}
              className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                adminTab === 'return'
                  ? 'border-[#B34453] text-[#B34453]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="flex items-center gap-1.5"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-4 h-4"><path d="M20 12a8 8 0 11-2.3-5.7L20 8M20 4v4h-4" /></svg>การคืน ({returnedRequests.length})</span>
            </button>
            <button
              onClick={() => setAdminTab('unreturned')}
              className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                adminTab === 'unreturned'
                  ? 'border-[#B34453] text-[#B34453]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="flex items-center gap-1.5"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-4 h-4"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>ไม่คืน / ล่าช้า & ติดตาม</span>
              {unreturnedRequests.length > 0 && (
                <span className="bg-amber-500 text-white rounded-full px-2 py-0.2 text-[10px] font-bold">
                  {unreturnedRequests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setAdminTab('issues')}
              className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                adminTab === 'issues'
                  ? 'border-[#B34453] text-[#B34453]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="flex items-center gap-1.5"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-4 h-4"><path d="M12 3l9 16H3l9-16z" /><path d="M12 9v4M12 16v.5" /></svg>รายงานปัญหา ({reports.filter((r) => r.status === 'OPEN').length})</span>
            </button>
          </div>
        </header>

        {/* Admin Main Body */}
        <main className="max-w-5xl mx-auto px-4 py-8 w-full flex-1">
          {/* ================= TAB 1: เช็คสต็อก & เพิ่มอุปกรณ์ (User Request #1) ================= */}
          {adminTab === 'stock' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                <div>
                  <h2 className="text-lg font-black text-slate-900">เช็คสต็อกอุปกรณ์และยอดคงเหลือ</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    เลือกฝ่ายเพื่อดูสต็อกคงเหลือ และสามารถกดปุ่มเพิ่มอุปกรณ์ใหม่ในแต่ละฝ่ายได้ทันที
                  </p>
                </div>

                {/* Add Equipment Button */}
                <button
                  onClick={() => setAddEquipmentModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-[#B34453] text-white text-xs font-bold shadow-[0_8px_24px_rgba(179,68,83,0.16)] hover:bg-[#963B48] active:scale-[0.98] transition-all"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><path d="M12 5v14M5 12h14" /></svg>
                  <span>เพิ่มอุปกรณ์ในฝ่าย {selectedStockDept?.name}</span>
                </button>
              </div>

              {/* Department Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {departments.map((dept) => {
                  const isSelected = selectedStockDept?.id === dept.id;
                  return (
                    <button
                      key={dept.id}
                      onClick={() => setSelectedStockDept(dept)}
                      className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap shadow-sm ${
                        isSelected
                          ? 'bg-[#B34453] text-white shadow-[#B34453]/20'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-base"><DepartmentIcon name={dept.name} id={dept.id} className="w-4 h-4 shrink-0" /></span>
                      <span>{dept.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Equipment Grid with Real-time Remaining Counts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {stockEquipment.map((eq) => {
                  const isOutOfStock = eq.availableQty === 0;
                  const percent = Math.round((eq.availableQty / eq.totalQty) * 100);

                  return (
                    <div
                      key={eq.id}
                      className={`bg-white rounded-3xl p-5 border shadow-sm transition-all flex flex-col justify-between ${
                        isOutOfStock ? 'border-red-300 ring-2 ring-red-100' : 'border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                            {eq.code}
                          </span>
                          {isOutOfStock ? (
                            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-red-100 text-[#B34453] inline-flex items-center gap-1">
                              <IconAlertTriangle className="w-3 h-3" />
                              <span>หมดสต็อก</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              คงเหลือ {eq.availableQty} / {eq.totalQty}
                            </span>
                          )}
                        </div>

                        <div className="flex items-start gap-3 mb-2">
                          {eq.image ? (
                            <img
                              src={eq.image}
                              alt={eq.name}
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewPhoto(eq.image);
                              }}
                              className="w-14 h-14 rounded-2xl object-cover border border-slate-200 cursor-pointer hover:opacity-90 transition-opacity flex-shrink-0"
                              title="คลิกดูภาพขยาย"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
                              <IconPackage className="w-7 h-7" />
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="font-bold text-slate-900 text-sm leading-snug">{eq.name}</h3>
                            {/* Location Badge */}
                            <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-slate-600">
                              <IconMapPin className="w-3.5 h-3.5 text-[#E8A9B0] shrink-0" />
                              <span className="truncate">{eq.location || 'ห้องพัสดุหลัก'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Visual Progress Bar of Remaining Stock */}
                        <div className="mt-4 space-y-1">
                          <div className="flex justify-between text-[11px] font-bold">
                            <span className="text-slate-500">คงเหลือในคลัง:</span>
                            <span className={isOutOfStock ? 'text-[#B34453]' : 'text-slate-800'}>
                              {eq.availableQty} ชิ้น (ยืมไปแล้ว {eq.totalQty - eq.availableQty})
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isOutOfStock ? 'bg-red-500' : percent < 30 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${percent}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons: History, Edit, Delete */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5">
                        <button
                          onClick={() => setStockDetailEquipment(eq)}
                          className="flex-1 py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors inline-flex items-center justify-center gap-1"
                          title="ดูประวัติและรายละเอียดผู้ยืม"
                        >
                          <IconClipboard className="w-3.5 h-3.5" />
                          <span>ประวัติยืม</span>
                        </button>
                        <button
                          onClick={() => handleOpenEditEquipment(eq)}
                          className="py-2 px-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-[#B34453] text-xs font-bold transition-colors inline-flex items-center gap-1 border border-red-200 shadow-sm"
                          title="แก้ไขข้อมูลอุปกรณ์"
                        >
                          <IconPencil className="w-3.5 h-3.5" />
                          <span>แก้ไข</span>
                        </button>
                        <button
                          onClick={() => setDeleteConfirmEquipment(eq)}
                          className="py-2 px-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors inline-flex items-center gap-1 border border-rose-200 shadow-sm"
                          title="ลบอุปกรณ์ออกจากระบบ"
                        >
                          <IconTrash className="w-3.5 h-3.5" />
                          <span>ลบ</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= TAB 2: การอนุมัติยืม (Grouped by Activity) ================= */}
          {adminTab === 'borrow' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900">รายการคำขอยืมที่รอการอนุมัติ</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    จำแนกอุปกรณ์ตามรายกิจกรรม สามารถอนุมัติทั้งกิจกรรมหรือรายชิ้นได้
                  </p>
                </div>
                <span className="bg-[#B34453]/10 text-[#B34453] text-xs font-black px-3 py-1 rounded-full">
                  รออนุมัติ {pendingRequests.length} รายการ
                </span>
              </div>

              {pendingByActivity.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                  <IconCheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-800">ไม่มีคำขอยืมที่รออนุมัติ</p>
                  <p className="text-xs text-slate-400 mt-1">คำขอยืมจากผู้ใช้งานจะเข้ามาแสดงที่นี่</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {pendingByActivity.map((group) => (
                    <div
                      key={group.activityName}
                      className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
                    >
                      {/* Activity Header */}
                      <div className="bg-gradient-to-r from-slate-50 to-red-50/40 p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="p-1.5 rounded-lg bg-[#B34453] text-white">
                              <IconFlag className="w-4 h-4" />
                            </span>
                            <span className="text-xs font-bold text-slate-500">กิจกรรม:</span>
                            <h3 className="text-base font-extrabold text-[#B34453]">{group.activityName}</h3>
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#B34453]/10 text-[#B34453]">
                              รวม {group.items.length} รายการ ({group.totalQty} ชิ้น)
                            </span>
                          </div>
                          <div className="flex flex-col gap-1.5 pt-1">
                            {group.users.map((user) => (
                              <div key={user.userId} className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                                <span className="font-bold text-slate-800">{user.userName}</span>
                                <span className="font-mono text-slate-500">({user.userStudentId})</span>
                                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                                  <IconPhone className="w-3 h-3" />
                                  {user.userPhone}
                                </span>
                                {user.note && (
                                  <span className="text-slate-500">
                                    <strong>หมายเหตุ:</strong> {user.note}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={async () => {
                              for (const item of group.items) {
                                await handleAdminAction(item.id, 'approve');
                              }
                            }}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all inline-flex items-center gap-1.5"
                          >
                            <IconCheckCircle className="w-3.5 h-3.5" />
                            <span>อนุมัติทั้งกิจกรรม ({group.items.length})</span>
                          </button>
                        </div>
                      </div>

                      {/* Equipment List for this Activity */}
                      <div className="p-5 divide-y divide-slate-100 space-y-3">
                        {group.items.map((req) => (
                          <div key={req.id} className="pt-3 first:pt-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                              {req.borrowPhoto ? (
                                <img
                                  src={req.borrowPhoto}
                                  alt="Selfie"
                                  onClick={() => setPreviewPhoto(req.borrowPhoto)}
                                  className="w-16 h-16 rounded-2xl object-cover border-2 border-[#F8E9EB] cursor-pointer hover:opacity-90 transition-opacity shrink-0"
                                  title="คลิกดูภาพถ่ายคู่กับอุปกรณ์"
                                />
                              ) : (
                                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                  <IconPackage className="w-8 h-8" />
                                </div>
                              )}
                              <div className="space-y-1">
                                <h4 className="text-sm font-extrabold text-slate-900">{req.equipmentName}</h4>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                  <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-[11px] font-bold text-slate-700">{req.equipmentCode}</span>
                                  <span>จำนวน: <strong className="text-slate-900">{req.quantity} ชิ้น</strong></span>
                                </div>
                                <p className="text-[11px] text-slate-500">
                                  กำหนดคืน: <strong className="text-slate-700">{new Date(req.expectedReturnDate).toLocaleString('th-TH')}</strong>
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleAdminAction(req.id, 'approve')}
                                className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all inline-flex items-center gap-1 shadow-sm"
                              >
                                <IconCheckCircle className="w-3.5 h-3.5" />
                                <span>อนุมัติ</span>
                              </button>
                              <button
                                onClick={() => handleAdminAction(req.id, 'reject')}
                                className="py-2 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all inline-flex items-center gap-1"
                              >
                                <IconXCircle className="w-3.5 h-3.5" />
                                <span>ปฏิเสธ</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 3: ประวัติการคืน (Grouped by Activity) ================= */}
          {adminTab === 'return' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900">ประวัติการคืนอุปกรณ์ทั้งหมด</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    จำแนกอุปกรณ์ที่ส่งคืนตามรายกิจกรรม พร้อมแสดงสถานะตรงเวลา/ล่าช้า และแอดมินผู้อนุมัติ
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                  ส่งคืนแล้ว {returnedRequests.length} รายการ
                </span>
              </div>

              {returnedByActivity.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-500 text-xs">
                  <IconPackage className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  ยังไม่มีประวัติการส่งคืนอุปกรณ์
                </div>
              ) : (
                <div className="space-y-6">
                  {returnedByActivity.map((group) => (
                    <div key={group.activityName} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="bg-gradient-to-r from-slate-50 to-emerald-50/30 p-4 border-b border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-wrap justify-end">
                          <span className="p-1.5 rounded-lg bg-[#B34453] text-white">
                            <IconFlag className="w-4 h-4" />
                          </span>
                          <span className="text-xs font-bold text-slate-500">กิจกรรม:</span>
                          <h3 className="text-sm font-extrabold text-[#B34453]">{group.activityName}</h3>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            คืนครบ {group.returnedCount}/{group.items.length} รายการ
                          </span>
                          {group.outstandingCount > 0 ? (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                              ยังไม่ครบ {group.outstandingCount} รายการ
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                              ส่งคืนครบทั้งหมด
                            </span>
                          )}
                          <span className="text-[10px] font-bold text-slate-500">
                            ตรงเวลา {group.onTimeCount} · ล่าช้า {group.lateCount}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 divide-y divide-slate-100 space-y-3">
                        {group.items.map((r) => {
                          const isLate = r.status === 'RETURNED_LATE';
                          const isReturned = r.status === 'RETURNED_ON_TIME' || r.status === 'RETURNED_LATE';
                          return (
                            <div key={r.id} className="pt-3 first:pt-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                {r.returnPhoto ? (
                                  <img
                                    src={r.returnPhoto}
                                    alt="Return"
                                    onClick={() => setPreviewPhoto(r.returnPhoto)}
                                    className="w-14 h-14 rounded-2xl object-cover border cursor-pointer hover:opacity-90 shrink-0"
                                    title="รูปถ่ายตอนส่งคืน"
                                  />
                                ) : (
                                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                    <IconPackage className="w-6 h-6" />
                                  </div>
                                )}
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-extrabold text-slate-900">{r.userName} ({r.userStudentId})</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                                      !isReturned
                                        ? 'bg-amber-100 text-amber-800'
                                        : isLate
                                          ? 'bg-red-100 text-[#B34453]'
                                          : 'bg-emerald-100 text-emerald-800'
                                    }`}>
                                      {!isReturned ? <IconClock className="w-3 h-3" /> : isLate ? <IconClock className="w-3 h-3" /> : <IconCheckCircle className="w-3 h-3" />}
                                      <span>{!isReturned ? 'ยังไม่ครบการคืน' : isLate ? 'คืนล่าช้า' : 'คืนตรงเวลา'}</span>
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-700">
                                    อุปกรณ์: <strong>{r.equipmentName}</strong> ({r.equipmentCode}) จำนวน {r.quantity} ชิ้น
                                  </p>
                                  <p className="text-[11px] text-slate-500">
                                    {isReturned
                                      ? `คืนจริงเมื่อ: ${r.actualReturnDate ? new Date(r.actualReturnDate).toLocaleString('th-TH') : '-'}`
                                      : `กำหนดคืน: ${new Date(r.expectedReturnDate).toLocaleString('th-TH')}`}
                                  </p>
                                  {r.approvedByAdminName && (
                                    <p className="text-[11px] font-bold text-slate-600 inline-flex items-center gap-1">
                                      <IconShield className="w-3 h-3 text-[#B34453]" />
                                      <span>แอดมินผู้อนุมัติ: <span className="text-[#B34453]">{r.approvedByAdminName}</span></span>
                                    </p>
                                  )}
                                </div>
                              </div>

                              {r.borrowPhoto && (
                                <div className="text-right flex items-center gap-2 justify-end">
                                  <span className="text-[10px] text-slate-400">รูปตอนยืม:</span>
                                  <img
                                    src={r.borrowPhoto}
                                    alt="Borrow"
                                    onClick={() => setPreviewPhoto(r.borrowPhoto)}
                                    className="w-10 h-10 rounded-xl object-cover border cursor-pointer"
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 4: ไม่คืน / คืนล่าช้า & การติดตาม (Grouped by Activity) ================= */}
          {adminTab === 'unreturned' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900">รายการอุปกรณ์ที่ยังไม่ได้คืน / เกินกำหนด</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    จำแนกตามรายกิจกรรม สามารถกดติดตามเพื่อระบุแอดมินผู้รับผิดชอบได้
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-amber-50 text-amber-800 rounded-full border border-amber-200">
                  ค้างคืน {unreturnedRequests.length} รายการ
                </span>
              </div>

              {unreturnedByActivity.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                  <IconCheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-800">ไม่มีอุปกรณ์ค้างส่งคืน</p>
                  <p className="text-xs text-slate-400 mt-1">ผู้ใช้ทุกคนส่งคืนอุปกรณ์ครบถ้วนแล้ว</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {unreturnedByActivity.map((group) => (
                    <div
                      key={group.activityName}
                      className={`bg-white rounded-3xl border shadow-sm overflow-hidden ${
                        group.hasOverdue ? 'border-red-300 ring-2 ring-red-100' : 'border-slate-200'
                      }`}
                    >
                      <div className="bg-gradient-to-r from-slate-50 to-amber-50/40 p-4 border-b border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-lg bg-[#B34453] text-white">
                            <IconFlag className="w-4 h-4" />
                          </span>
                          <span className="text-xs font-bold text-slate-500">กิจกรรม:</span>
                          <h3 className="text-sm font-extrabold text-[#B34453]">{group.activityName}</h3>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                            ค้างส่ง {group.items.length} รายการ ({group.totalQty} ชิ้น)
                          </span>
                          {group.hasOverdue && (
                            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-red-100 text-[#B34453] inline-flex items-center gap-1 animate-pulse">
                              <IconAlertTriangle className="w-3 h-3" />
                              <span>มีรายการเกินกำหนด</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-4 divide-y divide-slate-100 space-y-3">
                        {group.items.map((req) => {
                          const isOverdue = new Date() > new Date(req.expectedReturnDate);
                          return (
                            <div key={req.id} className="pt-3 first:pt-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex items-start gap-4">
                                {req.borrowPhoto ? (
                                  <img
                                    src={req.borrowPhoto}
                                    alt="Borrow"
                                    onClick={() => setPreviewPhoto(req.borrowPhoto)}
                                    className="w-16 h-16 rounded-2xl object-cover border cursor-pointer hover:opacity-90 shrink-0"
                                    title="รูปถ่ายตอนยืม"
                                  />
                                ) : (
                                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                    <IconPackage className="w-7 h-7" />
                                  </div>
                                )}
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-extrabold text-slate-900">{req.userName}</span>
                                    <span className="text-xs text-slate-500 font-mono">({req.userStudentId})</span>
                                    {isOverdue ? (
                                      <span className="bg-red-100 text-[#B34453] text-[10px] font-black px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                        <IconAlertTriangle className="w-3 h-3" />
                                        <span>เกินกำหนดส่งคืน</span>
                                      </span>
                                    ) : (
                                      <span className="bg-red-50 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                        ยังอยู่ในกำหนด
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-700">
                                    อุปกรณ์: <strong>{req.equipmentName}</strong> ({req.equipmentCode}) จำนวน <strong>{req.quantity} ชิ้น</strong>
                                  </p>
                                  <p className="text-xs text-slate-600">
                                    กำหนดส่งคืน: <strong className={isOverdue ? 'text-[#B34453]' : 'text-slate-800'}>
                                      {new Date(req.expectedReturnDate).toLocaleString('th-TH')}
                                    </strong>
                                  </p>
                                  <div className="pt-1 flex items-center gap-3">
                                    <a
                                      href={`tel:${req.userPhone}`}
                                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-xl text-xs font-bold transition-colors"
                                    >
                                      <IconPhone className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>โทร: {req.userPhone || 'ไม่ระบุ'}</span>
                                    </a>
                                    {req.isFollowingUp && req.followedByAdminName && (
                                      <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                                        <IconMegaphone className="w-3 h-3 text-amber-700" />
                                        <span>ติดตามโดย: {req.followedByAdminName}</span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex md:flex-col gap-2 min-w-36">
                                <button
                                  onClick={() => handleToggleFollowUp(req.id, !!req.isFollowingUp)}
                                  className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all text-center inline-flex items-center justify-center gap-1.5 ${
                                    req.isFollowingUp
                                      ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md'
                                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                                  }`}
                                >
                                  <IconMegaphone className="w-3.5 h-3.5" />
                                  <span>{req.isFollowingUp ? 'กำลังติดตามอยู่' : 'บันทึก: ติดตาม'}</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 5: รายงานปัญหา ================= */}
          {adminTab === 'issues' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-black text-slate-900">รายงานปัญหาการใช้งานเว็บไซต์</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  สามารถกดติ๊กถูกเพื่อเปลี่ยนสถานะเป็นแก้ไขปัญหาสำเร็จแล้ว
                </p>
              </div>

              {reports.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-500 text-xs">
                  ไม่มีรายงานปัญหาในขณะนี้
                </div>
              ) : (
                <div className="space-y-3">
                  {reports.map((rep) => {
                    const isResolved = rep.status === 'RESOLVED';
                    return (
                      <div
                        key={rep.id}
                        className={`bg-white rounded-3xl p-4 border shadow-sm flex items-center justify-between gap-4 ${
                          isResolved ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="shrink-0">{isResolved ? <IconCheckCircle className="w-5 h-5 text-emerald-600" /> : <IconAlertTriangle className="w-5 h-5 text-rose-500" />}</span>
                            <h3 className="font-bold text-slate-900 text-xs">{rep.title}</h3>
                          </div>
                          <p className="text-xs text-slate-600">{rep.description}</p>
                          <span className="text-[10px] text-slate-400 block">
                            แจ้งเมื่อ: {new Date(rep.createdAt).toLocaleString('th-TH')}
                          </span>
                        </div>

                        <button
                          onClick={() => handleToggleIssueResolved(rep.id, rep.status)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap inline-flex items-center gap-1 ${
                            isResolved
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                          }`}
                        >
                          <IconCheckCircle className="w-3.5 h-3.5" />
                          <span>{isResolved ? 'แก้ไขแล้ว' : 'ติ๊กเมื่อแก้แล้ว'}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>

        {/* Floating Action Button for Adding Admin */}
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setAddAdminModalOpen(true)}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-[#B34453] to-[#78343D] text-white text-3xl font-light shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
            title="เพิ่มแอดมินช่วยควบคุมระบบ"
          >
            +
          </button>
        </div>

        {/* ================= MODAL: ADD EQUIPMENT IN DEPARTMENT ================= */}
        {addEquipmentModalOpen && selectedStockDept && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-[28px] max-w-md w-full p-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)] border border-slate-100 space-y-4 my-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">เพิ่มอุปกรณ์ใหม่</h3>
                  <p className="text-xs text-slate-500 mt-1">ฝ่าย{selectedStockDept.name} · รายละเอียดสต็อก</p>
                </div>
                <button
                  onClick={() => setAddEquipmentModalOpen(false)}
                  className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors"
                  aria-label="ปิด"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><path d="M6 6l12 12M18 6L6 18" /></svg>
                </button>
              </div>

              <form onSubmit={handleAddEquipment} className="space-y-4 text-xs">
                {/* 1. Camera / Photo for Equipment */}
                <div>
                  <Camera
                    label="รูปอุปกรณ์"
                    onCapture={(dataUrl) => setNewEqPhoto(dataUrl)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">ชื่ออุปกรณ์ <span className="text-[#B34453]">*</span></label>
                  <input
                    type="text"
                    value={newEqName}
                    onChange={(e) => setNewEqName(e.target.value)}
                    placeholder="เช่น โปรเจคเตอร์ 4K หรือ เต็นท์สนาม"
                    className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none shadow-sm transition-all focus:border-[#B34453] focus:ring-4 focus:ring-red-50"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">รหัส / บาร์โค้ด <span className="text-[#B34453]">*</span></label>
                    <input
                      type="text"
                      value={newEqCode}
                      onChange={(e) => setNewEqCode(e.target.value)}
                      placeholder="เช่น AC-099"
                      className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-900 placeholder:font-normal placeholder:text-slate-400 outline-none shadow-sm transition-all focus:border-[#B34453] focus:ring-4 focus:ring-red-50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">จำนวน <span className="text-[#B34453]">*</span></label>
                    <input
                      type="number"
                      min="1"
                      max="999"
                      value={newEqQty}
                      onChange={(e) => setNewEqQty(parseInt(e.target.value) || 1)}
                      className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-900 outline-none shadow-sm transition-all focus:border-[#B34453] focus:ring-4 focus:ring-red-50"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-2">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-4 h-4 text-[#E8A9B0]"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1116 0z" /><circle cx="12" cy="10" r="2.5" /></svg>
                    ตำแหน่งจัดเก็บ <span className="text-[#B34453]">*</span>
                  </label>
                  <input
                    type="text"
                    value={newEqLocation}
                    onChange={(e) => setNewEqLocation(e.target.value)}
                    placeholder="เช่น ตู้ A-01 ห้องพัสดุ 101 ชั้น 3"
                    className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none shadow-sm transition-all focus:border-[#B34453] focus:ring-4 focus:ring-red-50"
                    required
                  />
                </div>

                <div className="pt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setAddEquipmentModalOpen(false)}
                    className="flex-1 h-11 border border-slate-200 bg-white text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={submittingNewEq}
                    className="flex-1 h-11 bg-[#B34453] hover:bg-[#963B48] text-white rounded-xl font-bold transition-colors disabled:opacity-50 shadow-[0_8px_24px_rgba(179,68,83,0.16)]"
                  >
                    {submittingNewEq ? 'กำลังบันทึก...' : 'บันทึกอุปกรณ์'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= MODAL: ADD CO-ADMIN ================= */}
        {addAdminModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-[32px] max-w-md w-full p-6 shadow-2xl space-y-4 my-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <IconShield className="w-4 h-4 text-[#B34453]" />
                    เพิ่มแอดมินช่วยควบคุมระบบ
                  </h3>
                  <p className="text-xs text-slate-500">แต่งตั้งผู้ช่วยดูแลระบบ</p>
                </div>
                <button
                  onClick={() => setAddAdminModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
                  aria-label="ปิด"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><path d="M6 6l12 12M18 6L6 18" /></svg>
                </button>
              </div>

              <form onSubmit={handleAddAdmin} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">ชื่อ-นามสกุล *</label>
                  <input
                    type="text"
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                    placeholder="เช่น นายนฤดล บริหาร"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium outline-none focus:border-[#B34453]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">รหัสนักศึกษา (รหัสผ่านเข้าสู่ระบบ) *</label>
                  <input
                    type="text"
                    value={newAdminStudentId}
                    onChange={(e) => setNewAdminStudentId(e.target.value)}
                    placeholder="เช่น 6699999999"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium outline-none focus:border-[#B34453]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">เบอร์โทรศัพท์ที่ติดต่อได้จริง *</label>
                  <input
                    type="tel"
                    value={newAdminPhone}
                    onChange={(e) => setNewAdminPhone(e.target.value)}
                    placeholder="เช่น 089-111-2222"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium outline-none focus:border-[#B34453]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">ยศ / ตำแหน่งแอดมิน *</label>
                  <input
                    type="text"
                    value={newAdminTitle}
                    onChange={(e) => setNewAdminTitle(e.target.value)}
                    placeholder="เช่น หัวหน้าฝ่ายพัสดุ, ผู้ช่วยแอดมิน"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium outline-none focus:border-[#B34453]"
                    required
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setAddAdminModalOpen(false)}
                    className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-full font-bold hover:bg-slate-200"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={submittingNewAdmin}
                    className="flex-1 py-2.5 bg-[#B34453] hover:bg-[#963B48] text-white rounded-full font-bold shadow-md"
                  >
                    {submittingNewAdmin ? 'กำลังแต่งตั้ง...' : 'แต่งตั้งแอดมิน'}
                  </button>
                </div>
              </form>

              {/* Existing Admins List */}
              <div className="border-t border-slate-100 pt-3">
                <h4 className="text-xs font-bold text-slate-700 mb-2">แอดมินในระบบ ({adminList.length} ท่าน):</h4>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {adminList.map((adm) => (
                    <div key={adm.id} className="p-2 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{adm.fullname}</p>
                        <p className="text-[10px] text-slate-500">โทร: {adm.phone}</p>
                      </div>
                      <span className="bg-[#B34453]/10 text-[#B34453] font-black px-2 py-0.5 rounded-full text-[10px]">
                        {adm.adminTitle || 'แอดมิน'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= MODAL: VIEW BORROWERS & EDIT LOCATION OF AN EQUIPMENT ================= */}
        {stockDetailEquipment && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-[32px] max-w-lg w-full p-6 shadow-2xl space-y-4 my-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  {stockDetailEquipment.image ? (
                    <img
                      src={stockDetailEquipment.image}
                      alt={stockDetailEquipment.name}
                      onClick={() => setPreviewPhoto(stockDetailEquipment.image)}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-200 cursor-pointer hover:opacity-90 flex-shrink-0"
                      title="คลิกดูภาพขยาย"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-red-50 text-[#B34453] flex items-center justify-center text-3xl font-bold flex-shrink-0">
                      <IconPackage className="w-7 h-7" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-base font-black text-slate-900 leading-snug">
                      {stockDetailEquipment.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">{stockDetailEquipment.code}</p>
                    <p className="text-xs text-[#B34453] font-bold mt-0.5">
                      คงเหลือ: {stockDetailEquipment.availableQty} / {stockDetailEquipment.totalQty} ชิ้น
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setStockDetailEquipment(null);
                    setEditingLocation(false);
                    setEditingPhoto(false);
                    setUpdatedPhotoData(null);
                  }}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
                  aria-label="ปิด"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><path d="M6 6l12 12M18 6L6 18" /></svg>
                </button>
              </div>

              {/* Location Card with Edit Capability */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                {editingLocation ? (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <IconMapPin className="w-4 h-4 text-[#B34453]" />
                      แก้ไขตำแหน่งจัดเก็บ:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={updatedLocationText}
                        onChange={(e) => setUpdatedLocationText(e.target.value)}
                        placeholder="ระบุตำแหน่ง เช่น ตู้ A1 ชั้น 2..."
                        className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-medium outline-none focus:border-[#B34453]"
                      />
                      <button
                        onClick={() => handleSaveLocation(stockDetailEquipment.id)}
                        disabled={savingLocation}
                        className="px-3 py-1.5 bg-[#B34453] text-white rounded-xl text-xs font-bold shadow hover:bg-[#963B48]"
                      >
                        {savingLocation ? 'กำลังบันทึก...' : 'บันทึก'}
                      </button>
                      <button
                        onClick={() => setEditingLocation(false)}
                        className="px-2.5 py-1.5 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                      >
                        ยกเลิก
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <IconMapPin className="w-4 h-4 text-[#B34453]" />
                      <span>ตำแหน่งจัดเก็บ:</span>
                      <span className="text-[#B34453] font-bold">
                        {stockDetailEquipment.location || 'ห้องพัสดุหลัก'}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setUpdatedLocationText(stockDetailEquipment.location || '');
                        setEditingLocation(true);
                      }}
                      className="text-[11px] font-bold text-slate-500 hover:text-[#B34453] underline"
                    >
                      <span className="inline-flex items-center gap-1"><IconPencil className="w-3.5 h-3.5" />เปลี่ยนตำแหน่ง</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Equipment Photo with Edit Capability */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                {editingPhoto ? (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-800">รูปอุปกรณ์ใหม่:</label>
                    <Camera
                      label="ถ่ายรูปอุปกรณ์"
                      onCapture={(dataUrl) => setUpdatedPhotoData(dataUrl)}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSavePhoto(stockDetailEquipment.id)}
                        disabled={savingPhoto || !updatedPhotoData}
                        className="flex-1 px-3 py-2 bg-[#B34453] text-white rounded-xl text-xs font-bold disabled:opacity-50"
                      >
                        {savingPhoto ? 'กำลังบันทึก...' : 'บันทึกรูป'}
                      </button>
                      <button
                        onClick={() => {
                          setEditingPhoto(false);
                          setUpdatedPhotoData(null);
                        }}
                        className="px-3 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                      >
                        ยกเลิก
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">รูปอุปกรณ์</span>
                    <button
                      onClick={() => {
                        setUpdatedPhotoData(null);
                        setEditingPhoto(true);
                      }}
                      className="text-[11px] font-bold text-slate-500 hover:text-[#B34453] underline"
                    >
                      <span className="inline-flex items-center gap-1"><IconPencil className="w-3.5 h-3.5" />เปลี่ยนรูป</span>
                    </button>
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-700 mb-2">รายชื่อผู้ที่กำลังยืมอุปกรณ์นี้:</h4>
                {equipmentBorrowers.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6 bg-slate-50 rounded-2xl">
                    ไม่มีรายการผู้ยืมที่ค้างอยู่ในขณะนี้
                  </p>
                ) : (
                  <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                    {equipmentBorrowers.map((b) => (
                      <div key={b.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {b.borrowPhoto && (
                            <img
                              src={b.borrowPhoto}
                              alt="Selfie"
                              onClick={() => setPreviewPhoto(b.borrowPhoto)}
                              className="w-12 h-12 rounded-xl object-cover border cursor-pointer"
                            />
                          )}
                          <div>
                            <p className="font-bold text-slate-900">{b.userName} ({b.userStudentId})</p>
                            <p className="text-[11px] text-emerald-700 font-bold inline-flex items-center gap-1"><IconPhone className="w-3 h-3" />{b.userPhone}</p>
                            <p className="text-[10px] text-slate-500">
                              กำหนดคืน: {new Date(b.expectedReturnDate).toLocaleString('th-TH')}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] bg-red-100 text-[#B34453] px-2.5 py-0.5 rounded-full font-bold">
                          ยืม {b.quantity} ชิ้น
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons inside Detail Modal: Full Edit & Delete */}
              <div className="pt-3 border-t border-slate-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEditEquipment(stockDetailEquipment)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-[#B34453] hover:bg-[#963B48] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#B34453]/20"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                  <span>แก้ไขข้อมูลทั้งหมด</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteConfirmEquipment(stockDetailEquipment)}
                  className="py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                  <span>ลบอุปกรณ์</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= MODAL: EDIT EQUIPMENT (Full Edit) ================= */}
        {editEquipmentModalOpen && editingEquipment && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-[28px] max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 my-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">แก้ไขข้อมูลอุปกรณ์</h3>
                  <p className="text-xs text-slate-500 mt-0.5">รหัส: {editingEquipment.code}</p>
                </div>
                <button
                  onClick={() => setEditEquipmentModalOpen(false)}
                  className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors"
                  aria-label="ปิด"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><path d="M6 6l12 12M18 6L6 18" /></svg>
                </button>
              </div>

              <form onSubmit={handleSaveEditEquipment} className="space-y-4 text-xs">
                {/* Photo preview and Camera */}
                <div>
                  {editEqPhoto ? (
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 mb-2">
                      <img src={editEqPhoto} alt="Preview" className="w-full h-36 object-cover" />
                      <button
                        type="button"
                        onClick={() => setEditEqPhoto(null)}
                        className="absolute top-2 right-2 px-2.5 py-1 bg-black/70 hover:bg-black text-white text-[10px] font-bold rounded-lg transition-colors"
                      >
                        เปลี่ยนรูปถ่าย
                      </button>
                    </div>
                  ) : (
                    <Camera
                      label="ถ่ายรูปอุปกรณ์ใหม่"
                      onCapture={(dataUrl) => setEditEqPhoto(dataUrl)}
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">ชื่ออุปกรณ์ <span className="text-[#B34453]">*</span></label>
                  <input
                    type="text"
                    value={editEqName}
                    onChange={(e) => setEditEqName(e.target.value)}
                    placeholder="เช่น โปรเจคเตอร์ 4K หรือ เต็นท์สนาม"
                    className="w-full h-11 bg-white border border-slate-200 rounded-xl px-3.5 text-xs font-medium text-slate-900 outline-none shadow-sm transition-all focus:border-[#B34453] focus:ring-4 focus:ring-red-50"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">รหัส / บาร์โค้ด <span className="text-[#B34453]">*</span></label>
                    <input
                      type="text"
                      value={editEqCode}
                      onChange={(e) => setEditEqCode(e.target.value)}
                      placeholder="เช่น AC-099"
                      className="w-full h-11 bg-white border border-slate-200 rounded-xl px-3.5 text-xs font-bold text-slate-900 outline-none shadow-sm transition-all focus:border-[#B34453] focus:ring-4 focus:ring-red-50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">จำนวนทั้งหมด <span className="text-[#B34453]">*</span></label>
                    <input
                      type="number"
                      min={Math.max(1, editingEquipment.totalQty - editingEquipment.availableQty)}
                      max="999"
                      value={editEqQty}
                      onChange={(e) => setEditEqQty(parseInt(e.target.value) || 1)}
                      className="w-full h-11 bg-white border border-slate-200 rounded-xl px-3.5 text-xs font-bold text-slate-900 outline-none shadow-sm transition-all focus:border-[#B34453] focus:ring-4 focus:ring-red-50"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5">
                    <IconMapPin className="w-4 h-4 text-[#B34453]" />
                    ตำแหน่งจัดเก็บ <span className="text-[#B34453]">*</span>
                  </label>
                  <input
                    type="text"
                    value={editEqLocation}
                    onChange={(e) => setEditEqLocation(e.target.value)}
                    placeholder="เช่น ตู้ A-01 ห้องพัสดุ 101 ชั้น 3"
                    className="w-full h-11 bg-white border border-slate-200 rounded-xl px-3.5 text-xs font-medium text-slate-900 outline-none shadow-sm transition-all focus:border-[#B34453] focus:ring-4 focus:ring-red-50"
                    required
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditEquipmentModalOpen(false)}
                    className="flex-1 h-11 border border-slate-200 bg-white text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={submittingEditEq}
                    className="flex-1 h-11 bg-[#B34453] hover:bg-[#963B48] text-white rounded-xl font-bold transition-colors disabled:opacity-50 shadow-md shadow-[#B34453]/20"
                  >
                    {submittingEditEq ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= MODAL: CONFIRM DELETE EQUIPMENT ================= */}
        {deleteConfirmEquipment && (() => {
          const borrowedCount = deleteConfirmEquipment.totalQty - deleteConfirmEquipment.availableQty;
          const isCurrentlyBorrowed = borrowedCount > 0;

          return (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-[28px] max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4 my-8 text-center">
                <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center text-2xl shadow-inner">
                  <IconTrash className="w-6 h-6" />
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">ยืนยันการลบอุปกรณ์</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    คุณต้องการลบอุปกรณ์นี้ออกจากระบบใช่หรือไม่?
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-1">
                  <p className="font-bold text-slate-900 inline-flex items-center gap-1.5"><IconPackage className="w-4 h-4" />{deleteConfirmEquipment.name}</p>
                  <p className="text-slate-500 font-mono text-[11px]">รหัส: {deleteConfirmEquipment.code}</p>
                  <p className="text-slate-600">จำนวนทั้งหมด: {deleteConfirmEquipment.totalQty} ชิ้น (คงเหลือ: {deleteConfirmEquipment.availableQty})</p>
                </div>

                {isCurrentlyBorrowed ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 font-semibold text-left">
                    <IconAlertTriangle className="w-4 h-4 inline-block mr-1 align-text-bottom" />
                    <strong>ไม่สามารถลบได้ในขณะนี้:</strong> มีผู้กำลังยืมอุปกรณ์นี้อยู่ <strong>{borrowedCount} ชิ้น</strong> ต้องรอให้ผู้ยืมนำมาคืนครบทั้งหมดก่อนจึงจะสามารถลบได้
                  </div>
                ) : (
                  <p className="text-[11px] text-rose-600 font-medium">
                    * เมื่อลบแล้ว อุปกรณ์นี้จะไม่ปรากฏในระบบให้ผู้ใช้ยืมอีกต่อไป
                  </p>
                )}

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmEquipment(null)}
                    className="flex-1 h-11 border border-slate-200 bg-white text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors text-xs"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="button"
                    disabled={isCurrentlyBorrowed || submittingDeleteEq}
                    onClick={handleConfirmDeleteEquipment}
                    className="flex-1 h-11 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-rose-600/20 text-xs"
                  >
                    {submittingDeleteEq ? 'กำลังลบ...' : 'ยืนยันการลบ'}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Photo Viewer Modal */}
        {previewPhoto && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setPreviewPhoto(null)}
          >
            <div className="relative max-w-sm w-full">
              <img src={previewPhoto} alt="Zoomed" className="w-full rounded-2xl shadow-2xl border-2 border-white/20" />
              <button
                onClick={() => setPreviewPhoto(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center"
                aria-label="ปิด"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ================= 4. REGULAR STUDENT APP (Modern Crimson & Slate Theme) =================
  return (
    <div className="min-h-screen portal-shell bg-[#F5F6F5] flex flex-col font-thai pb-24">
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-6 py-3 rounded-full shadow-2xl text-xs font-bold bg-[#E8A9B0] text-[#B34453] animate-bounce">
          {toast.message}
        </div>
      )}

      {/* Top Navbar */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setUserView('departments')}
          >
            <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-md shadow-[#B34453]/20 border border-slate-200 bg-white p-0.5">
              <img src="/aru-student-org.jpg" alt="ARU Student Organization" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="font-extrabold text-[#B34453] text-base leading-none">ARU Stock</h1>
              <p className="text-[11px] text-slate-400 mt-0.5">ระบบยืม-คืนอุปกรณ์ มรภ.พระนครศรีอยุธยา</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-100 py-1.5 px-3 rounded-full border border-slate-200">
              <div className="w-7 h-7 rounded-full bg-[#B34453] text-white text-xs font-bold flex items-center justify-center">
                {currentUser.fullname.slice(0, 1)}
              </div>
              <div className="text-left text-xs font-bold text-slate-800">
                {currentUser.fullname}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-[#B34453] hover:bg-red-50 rounded-xl transition-colors"
            >
              ออก
            </button>
          </div>
        </div>
      </header>

      {/* Main Student Body */}
      <main className="max-w-4xl mx-auto px-4 py-8 w-full flex-1">
        {/* ================= VIEW: DEPARTMENTS ================= */}
        {userView === 'departments' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-slate-900">เลือกฝ่ายที่ต้องการยืมอุปกรณ์</h2>
                <p className="text-xs text-slate-500 mt-0.5">คลิกฝ่ายเพื่อตรวจสอบรายการอุปกรณ์คงเหลือและส่งคำขอยืม</p>
              </div>

              {activeBorrows.length > 0 && (
                <button
                  onClick={() => handleOpenReturnScreen(activeBorrows[0])}
                  className="px-5 py-2.5 rounded-full bg-[#B34453] text-white text-xs font-bold shadow-md hover:bg-[#963B48] transition-all"
                >
                  <span className="inline-flex items-center gap-1.5"><IconArrowReturn className="w-4 h-4" />คืนอุปกรณ์ที่ยืมอยู่ ({activeBorrows.length})</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {departments.map((dept) => {
                const activeInDepartment = activeBorrows.filter(
                  (req) => (req as ExtendedBorrowRequest).departmentId === dept.id
                );
                return (
                <div
                  key={dept.id}
                  onClick={() => handleSelectDepartment(dept)}
                  className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-[#B34453] cursor-pointer transition-all group flex flex-col justify-between"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 text-2xl flex items-center justify-center border border-red-100 group-hover:scale-110 transition-transform">
                      <DepartmentIcon name={dept.name} id={dept.id} className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm group-hover:text-[#B34453] transition-colors">
                        ฝ่าย{dept.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{dept.description}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs font-bold">
                    {activeInDepartment.length > 0 ? (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleOpenReturnScreen(activeInDepartment[0]);
                        }}
                        className="flex-1 py-2 rounded-xl bg-[#B34453] text-white hover:bg-[#963B48]"
                      >
                        <span className="inline-flex items-center gap-1.5"><IconArrowReturn className="w-4 h-4" />คืนฝ่ายนี้ ({activeInDepartment.length})</span>
                      </button>
                    ) : (
                      <div className="flex-1 flex items-center justify-between text-[#B34453]">
                        <span>ดูอุปกรณ์</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= VIEW: EQUIPMENT IN DEPARTMENT ================= */}
        {userView === 'equipment' && selectedDept && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setUserView('departments')}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 font-bold"
                >
                  ←
                </button>
                <div>
                  <h2 className="text-lg font-black text-slate-900">อุปกรณ์ฝ่าย{selectedDept.name}</h2>
                  <p className="text-xs text-slate-500">{selectedDept.description}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {equipmentList.map((eq) => {
                const isAvailable = eq.availableQty > 0;
                const activeForEquipment = activeBorrows.filter((req) => req.equipmentId === eq.id);
                return (
                  <div
                    key={eq.id}
                    className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          {eq.code}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-[#B34453]'
                          }`}
                        >
                          {isAvailable ? `คงเหลือ ${eq.availableQty} / ${eq.totalQty}` : 'หมด'}
                        </span>
                      </div>

                      <div className="flex items-start gap-3 my-2">
                        {eq.image ? (
                          <img
                            src={eq.image}
                            alt={eq.name}
                            onClick={() => setPreviewPhoto(eq.image)}
                            className="w-14 h-14 rounded-2xl object-cover border border-slate-200 cursor-pointer hover:opacity-90 transition-opacity flex-shrink-0"
                            title="คลิกดูภาพขยาย"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl flex-shrink-0">
                            <IconPackage className="w-7 h-7 text-slate-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-900 text-sm leading-snug">{eq.name}</h4>
                          <p className="text-[11px] text-slate-500 font-medium mt-1">
                            <span className="inline-flex items-center gap-1"><IconMapPin className="w-3.5 h-3.5 text-[#B34453]" />จุดรับ:</span> <span className="font-bold text-slate-700">{eq.location || 'ห้องพัสดุหลัก'}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {activeForEquipment.length > 0 ? (
                      <div className="mt-4 space-y-2">
                        <button
                          type="button"
                          onClick={() => handleOpenReturnScreen(activeForEquipment[0])}
                          className="w-full py-2.5 rounded-full text-xs font-bold shadow-md bg-[#B34453] hover:bg-[#963B48] text-white active:scale-95"
                        >
                          <span className="inline-flex items-center gap-1.5"><IconArrowReturn className="w-4 h-4" />คืนอุปกรณ์นี้ ({activeForEquipment.reduce((sum, req) => sum + (req.quantity || 1), 0)} ชิ้น)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => isAvailable && handleOpenBorrowScreen(eq)}
                          disabled={!isAvailable}
                          className={`w-full py-2.5 rounded-full text-xs font-bold transition-all ${
                            isAvailable
                              ? 'bg-slate-100 text-[#B34453] border border-slate-300 hover:bg-slate-200'
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          {isAvailable ? 'ขอยืมเพิ่ม' : 'อุปกรณ์หมดสต็อก'}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => isAvailable && handleOpenBorrowScreen(eq)}
                        disabled={!isAvailable}
                        className={`w-full mt-4 py-2.5 rounded-full text-xs font-bold shadow-md transition-all ${
                          isAvailable
                            ? 'bg-[#B34453] hover:bg-[#963B48] text-white active:scale-95 shadow-[#B34453]/20'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {isAvailable ? 'ขอยืมอุปกรณ์นี้' : 'อุปกรณ์หมดสต็อก'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= VIEW: BORROW FORM ================= */}
        {userView === 'borrow' && selectedBorrowEquipment && (
          <div className="max-w-lg mx-auto bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">ขอยืมอุปกรณ์</h3>
                <p className="text-xs text-slate-500">{selectedBorrowEquipment.name} ({selectedBorrowEquipment.code})</p>
              </div>
              <button
                onClick={() => setUserView('equipment')}
                className="text-xs font-bold text-slate-500 hover:text-black"
              >
                ย้อนกลับ
              </button>
            </div>

            <div>
              <Camera
                label="ถ่ายรูปอุปกรณ์คู่กับหน้าผู้ใช้งาน (Verification Photo) *"
                onCapture={(dataUrl) => setBorrowPhoto(dataUrl)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">ชื่อกิจกรรม/โครงการที่ใช้ยืม *</label>
              <input
                type="text"
                value={borrowActivityName}
                onChange={(e) => setBorrowActivityName(e.target.value)}
                placeholder="เช่น กิจกรรมลอยกระทง"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium outline-none focus:border-[#B34453]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">หมายเหตุการยืม</label>
              <textarea
                rows={3}
                value={borrowNote}
                onChange={(e) => setBorrowNote(e.target.value)}
                placeholder="ระบุรายละเอียดการใช้งาน เช่น ใช้จัดกิจกรรมหน้าเวที"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium outline-none focus:border-[#B34453]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">วันและเวลากำหนดคืนอุปกรณ์ *</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  value={expectedDateInput}
                  onChange={(e) => setExpectedDateInput(e.target.value.replace(/[^\d/]/g, '').slice(0, 10))}
                  onBlur={() => {
                    const digits = expectedDateInput.replace(/\D/g, '');
                    if (!expectedDateInput.includes('/') && digits.length === 8) {
                      setExpectedDateInput(`${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`);
                    }
                  }}
                  placeholder="วัน/เดือน/ปี"
                  aria-label="วัน/เดือน/ปี"
                  className="h-11 bg-slate-50 border border-slate-200 rounded-xl px-3 text-center text-xs font-bold text-slate-800 outline-none focus:border-[#B34453]"
                />
                <input
                  type="time"
                  value={expectedDateTime}
                  onChange={(e) => setExpectedDateTime(e.target.value)}
                  aria-label="เวลา"
                  className="h-11 bg-slate-50 border border-slate-200 rounded-xl px-2 text-xs font-bold text-slate-800 outline-none focus:border-[#B34453]"
                />
              </div>
              <p className="mt-1.5 text-[10px] text-slate-400">กรอกวัน/เดือน/ปี พ.ศ. หรือ ค.ศ. เช่น 25/12/2569 · เวลา 17:00</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">จำนวนที่ต้องการยืม</label>
              <input
                type="number"
                min="1"
                max={selectedBorrowEquipment.availableQty}
                value={borrowQty}
                onChange={(e) => setBorrowQty(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 outline-none focus:border-[#B34453]"
              />
            </div>

            <button
              onClick={handleSubmitBorrow}
              disabled={submittingBorrow || !borrowPhoto || !expectedDateInput || !borrowActivityName.trim()}
              className={`w-full py-3 rounded-full font-bold text-xs shadow-md transition-all ${
                borrowPhoto && expectedDateInput && borrowActivityName.trim() && !submittingBorrow
                  ? 'bg-[#B34453] hover:bg-[#963B48] text-white active:scale-95 shadow-[#B34453]/20'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {submittingBorrow ? 'กำลังส่งคำขอ...' : 'ยืนยันขอยืม (รอแอดมินอนุมัติ)'}
            </button>
          </div>
        )}

        {/* ================= VIEW: RETURN FORM ================= */}
        {userView === 'returns' && (
          <div className="max-w-lg mx-auto bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">ส่งคืนอุปกรณ์</h3>
              <button
                onClick={() => setUserView('departments')}
                className="text-xs font-bold text-slate-500 hover:text-black"
              >
                กลับหน้าหลัก
              </button>
            </div>

            {returnResult ? (
              <div className="text-center py-6 space-y-3">
                <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center text-3xl ${
                  returnResult.status === 'ล่าช้า' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                }`}>
                  {returnResult.status === 'ล่าช้า'
                    ? <IconClock className="w-8 h-8" />
                    : <IconCheckCircle className="w-8 h-8" />}
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{returnResult.message}</h4>
                <button
                  onClick={() => {
                    setReturnResult(null);
                    setUserView('departments');
                  }}
                  className="py-2 px-6 rounded-full bg-[#B34453] hover:bg-[#963B48] text-white text-xs font-bold shadow-md"
                >
                  ตกลง
                </button>
              </div>
            ) : activeBorrows.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                ไม่มีอุปกรณ์ที่กำลังยืมอยู่
              </div>
            ) : (
              <div className="space-y-4">
                {userActiveByActivity.map((group) => (
                  <div key={group.activityName} className="border border-slate-200 rounded-2xl overflow-hidden">
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                      <p className="text-[11px] font-bold text-slate-500">กิจกรรม</p>
                      <p className="text-sm font-black text-[#B34453]">{group.activityName}</p>
                      {group.note && (
                        <p className="text-[11px] text-slate-500 mt-1">หมายเหตุ: {group.note}</p>
                      )}
                    </div>
                    <div className="p-3 space-y-2">
                      {group.items.map((req) => (
                        <button
                          type="button"
                          key={req.id}
                          onClick={() => {
                            setSelectedReturnRequest(req);
                            setReturnPhoto(null);
                          }}
                          className={`w-full text-left p-3 rounded-xl border transition-all ${
                            selectedReturnRequest?.id === req.id
                              ? 'border-[#B34453] bg-red-50'
                              : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <p className="text-xs font-bold text-slate-900">
                            {(req as ExtendedBorrowRequest).equipmentName || 'อุปกรณ์'} · จำนวน {req.quantity} ชิ้น
                          </p>
                          <p className="text-[11px] text-slate-500 mt-1">
                            กำหนดคืน: {new Date(req.expectedReturnDate).toLocaleString('th-TH')}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {selectedReturnRequest && (
                  <div className="bg-[#F8E9EB] p-4 rounded-2xl text-xs space-y-1">
                    <p className="font-bold text-slate-900">
                      กำลังคืน: {(selectedReturnRequest as ExtendedBorrowRequest).equipmentName || 'อุปกรณ์'} จำนวน {selectedReturnRequest.quantity} ชิ้น
                    </p>
                    <p className="text-slate-700">
                      กำหนดคืน: {new Date(selectedReturnRequest.expectedReturnDate).toLocaleString('th-TH')}
                    </p>
                  </div>
                )}

                <Camera
                  label="ถ่ายรูปอุปกรณ์ตอนคืนคู่กับหน้าผู้ใช้งาน *"
                  onCapture={(dataUrl) => {
                    setReturnPhoto(dataUrl);
                  }}
                />

                <button
                  onClick={handleSubmitReturn}
                  disabled={submittingReturn || !returnPhoto}
                  className={`w-full py-3 rounded-full font-bold text-xs shadow-md transition-all ${
                    returnPhoto && !submittingReturn
                      ? 'bg-[#B34453] hover:bg-[#963B48] text-white active:scale-95 shadow-[#B34453]/20'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {submittingReturn ? 'กำลังบันทึกการส่งคืน...' : 'ยืนยันการคืนอุปกรณ์'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================= VIEW: REPORT FORM ================= */}
        {userView === 'report' && (
          <div className="max-w-lg mx-auto bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <IconAlertTriangle className="w-4 h-4 text-[#B34453]" />
                แจ้งปัญหาของเว็บไซต์
              </h3>
              <button
                onClick={() => setUserView('departments')}
                className="text-xs font-bold text-slate-500 hover:text-black"
              >
                ย้อนกลับ
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">หัวข้อปัญหา *</label>
              <input
                type="text"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                placeholder="ระบุหัวข้อปัญหา..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium outline-none focus:border-[#B34453]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">รายละเอียดปัญหา *</label>
              <textarea
                rows={4}
                value={reportDesc}
                onChange={(e) => setReportDesc(e.target.value)}
                placeholder="อธิบายสิ่งที่พบ..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium outline-none focus:border-[#B34453]"
                required
              />
            </div>

            <button
              onClick={handleSubmitReport}
              disabled={submittingReport || !reportTitle.trim() || !reportDesc.trim()}
              className={`w-full py-3 rounded-full font-bold text-xs shadow-md transition-all ${
                reportTitle.trim() && reportDesc.trim() && !submittingReport
                  ? 'bg-[#B34453] hover:bg-[#963B48] text-white active:scale-95 shadow-[#B34453]/20'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {submittingReport ? 'กำลังส่งรายงาน...' : 'ส่งรายงานปัญหา'}
            </button>
          </div>
        )}
      </main>

      {/* Floating Action Box Button with Megaphone Popout */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
        {userFabExpanded && (
          <button
            onClick={() => {
              setUserFabExpanded(false);
              setUserView('report');
            }}
            className="w-11 h-11 rounded-full bg-[#E8A9B0] text-[#B34453] flex items-center justify-center text-3xl shadow-xl hover:scale-110 active:scale-95 transition-all animate-bounce"
            title="แจ้งปัญหาเว็บไซต์"
          >
            <IconMegaphone className="w-5 h-5" />
          </button>
        )}

        <button
          onClick={() => {
            if (activeBorrows.length > 0) {
              handleOpenReturnScreen(activeBorrows[0]);
            } else {
              setUserFabExpanded(!userFabExpanded);
            }
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            setUserFabExpanded(!userFabExpanded);
          }}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-[#B34453] to-[#78343D] text-white shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
          title="คลิก: คืนอุปกรณ์ | กดเปิดเมนู: แจ้งปัญหา"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7l8 4v10M4 7v10l8 4" />
          </svg>
        </button>
      </div>

      {/* Photo Zoom Modal */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewPhoto(null)}
        >
          <div className="relative max-w-sm w-full">
            <img src={previewPhoto} alt="Zoomed" className="w-full rounded-3xl shadow-2xl border-2 border-white/20" />
            <button
              onClick={() => setPreviewPhoto(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center"
              aria-label="ปิด"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
