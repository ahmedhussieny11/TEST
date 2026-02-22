import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  registerPatient,
  verifyPatientOtp,
  findPatientByPhone,
  resendPatientOtp,
} from '@/data/mockData';

type AuthStage = 'idle' | 'register' | 'login' | 'pendingOtp' | 'authenticated';

interface PatientProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

interface PatientAuthState {
  patient: PatientProfile | null;
  accountId: string | null;
  pendingPhone: string | null;
  pendingName: string | null;
  pendingEmail: string | null;
  stage: AuthStage;
  isAuthenticated: boolean;
  lastOtp?: string | null;
  otpExpiresAt?: string | null;
  error?: string | null;
  startRegistration: (name: string, phone: string, email?: string) => { otp: string; expiresAt: string };
  startLogin: (phone: string) => boolean;
  verifyOtp: (code: string) => boolean;
  resendOtp: () => string | null;
  logout: () => void;
  resetError: () => void;
}

export const usePatientAuthStore = create<PatientAuthState>()(
  persist(
    (set, get) => ({
      patient: null,
      accountId: null,
      pendingPhone: null,
      pendingName: null,
      pendingEmail: null,
      stage: 'idle',
      isAuthenticated: false,
      lastOtp: null,
      otpExpiresAt: null,
      error: null,
      startRegistration: (name, phone, email) => {
        const result = registerPatient({ name, phone, email });
        set({
          pendingPhone: phone,
          pendingName: name,
          pendingEmail: email ?? null,
          stage: 'pendingOtp',
          lastOtp: result.otp,
          otpExpiresAt: result.expiresAt,
          error: null,
        });
        return { otp: result.otp, expiresAt: result.expiresAt };
      },
      startLogin: (phone) => {
        const existing = findPatientByPhone(phone);
        if (!existing) {
          set({
            error: 'لا يوجد حساب مرتبط بهذا الرقم، الرجاء التسجيل أولاً.',
            stage: 'login',
          });
          return false;
        }
        const resend = resendPatientOtp(phone);
        set({
          pendingPhone: phone,
          pendingName: existing.patient.name,
          pendingEmail: existing.patient.email ?? null,
          stage: 'pendingOtp',
          lastOtp: resend?.otp ?? null,
          otpExpiresAt: resend?.expiresAt ?? null,
          error: null,
        });
        return true;
      },
      verifyOtp: (code) => {
        const { pendingPhone } = get();
        if (!pendingPhone) {
          set({ error: 'لا يوجد طلب تسجيل أو دخول قائم.' });
          return false;
        }
        const result = verifyPatientOtp(pendingPhone, code);
        if (!result.success) {
          const reasonMap: Record<string, string> = {
            not_found: 'لم يتم العثور على حساب لهذا الرقم.',
            invalid_code: 'رمز التحقق غير صحيح.',
            expired: 'انتهت صلاحية الرمز، الرجاء طلب رمز جديد.',
          };
          set({
            error: reasonMap[result.reason] || 'تعذر التحقق من الرمز.',
            stage: 'pendingOtp',
          });
          return false;
        }
        if (!result.patient) {
          set({
            error: 'تعذر تحميل ملف المريضة.',
            stage: 'pendingOtp',
          });
          return false;
        }
        set({
          patient: {
            id: result.patient.id,
            name: result.patient.name,
            phone: result.patient.phone,
            email: result.patient.email,
          },
          accountId: result.account.id,
          pendingPhone: null,
          pendingName: null,
          pendingEmail: null,
          stage: 'authenticated',
          isAuthenticated: true,
          lastOtp: null,
          otpExpiresAt: null,
          error: null,
        });
        return true;
      },
      resendOtp: () => {
        const { pendingPhone, pendingName } = get();
        if (!pendingPhone) return null;
        const resend = resendPatientOtp(pendingPhone);
        if (!resend) {
          set({
            error: 'تعذر إرسال الرمز حالياً.',
          });
          return null;
        }
        set({
          stage: 'pendingOtp',
          lastOtp: resend.otp,
          otpExpiresAt: resend.expiresAt,
          error: null,
          pendingName: pendingName,
        });
        return resend.otp;
      },
      logout: () => {
        set({
          patient: null,
          accountId: null,
          pendingPhone: null,
          pendingName: null,
          pendingEmail: null,
          stage: 'idle',
          isAuthenticated: false,
          lastOtp: null,
          otpExpiresAt: null,
          error: null,
        });
      },
      resetError: () => set({ error: null }),
    }),
    {
      name: 'patient-auth-storage',
    }
  )
);

