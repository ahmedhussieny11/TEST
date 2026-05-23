import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { patientPortalApi, PatientSession } from '@/api/patientPortal';
import { setPatientToken } from '@/api/client';

type AuthStage = 'idle' | 'authenticated';

interface PatientProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

function mapPatient(p: PatientSession['patient']): PatientProfile {
  return {
    id: p.id,
    name: p.name,
    phone: p.phone,
    email: p.email ?? undefined,
  };
}

function applySession(
  set: (
    partial:
      | Partial<PatientAuthState>
      | ((state: PatientAuthState) => Partial<PatientAuthState>)
  ) => void,
  data: PatientSession
) {
  setPatientToken(data.token);
  set({
    patient: mapPatient(data.patient),
    token: data.token,
    stage: 'authenticated',
    isAuthenticated: true,
    error: null,
  });
}

interface PatientAuthState {
  patient: PatientProfile | null;
  stage: AuthStage;
  isAuthenticated: boolean;
  error?: string | null;
  token: string | null;
  startRegistration: (
    name: string,
    phone: string,
    email?: string,
    age?: number,
    address?: string
  ) => Promise<boolean>;
  startLogin: (phone: string) => Promise<boolean>;
  logout: () => void;
  resetError: () => void;
}

export const usePatientAuthStore = create<PatientAuthState>()(
  persist(
    (set) => ({
      patient: null,
      stage: 'idle',
      isAuthenticated: false,
      token: null,
      error: null,
      startRegistration: async (name, phone, email, age, address) => {
        try {
          const { data } = await patientPortalApi.register({
            name,
            phone,
            email,
            age,
            address,
          });
          applySession(set, data);
          return true;
        } catch {
          set({ error: 'تعذر إنشاء الحساب — قد يكون الرقم مسجلاً مسبقاً' });
          return false;
        }
      },
      startLogin: async (phone) => {
        try {
          const { data } = await patientPortalApi.login(phone);
          applySession(set, data);
          return true;
        } catch {
          set({ error: 'لا يوجد حساب بهذا الرقم' });
          return false;
        }
      },
      logout: () => {
        setPatientToken(null);
        set({
          patient: null,
          token: null,
          stage: 'idle',
          isAuthenticated: false,
          error: null,
        });
      },
      resetError: () => set({ error: null }),
    }),
    {
      name: 'patient-auth-storage',
      partialize: (state) => ({
        patient: state.patient,
        token: state.token,
        stage: state.stage,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          setPatientToken(state.token);
        }
      },
    }
  )
);
