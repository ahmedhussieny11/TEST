import { NavLink } from 'react-router-dom';
import { useStaffClinicBranding } from '@/hooks/useClinicBranding';
import ClinicBrand from '@/components/Branding/ClinicBrand';
import { useAuthStore } from '@/store/authStore';
import { UserRole } from '@/types';
import {
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  Pill,
  FlaskConical,
  Receipt,
  Settings,
  UserCog,
  LogOut,
  Clock,
} from 'lucide-react';

const menuItems = [
  {
    name: 'لوحة التحكم',
    path: '/app',
    icon: LayoutDashboard,
    roles: [UserRole.DOCTOR, UserRole.ADMIN],
  },
  {
    name: 'المواعيد',
    path: '/app/appointments',
    icon: Calendar,
    roles: [UserRole.DOCTOR, UserRole.RECEPTION, UserRole.ADMIN],
  },
  {
    name: 'طابور الانتظار',
    path: '/app/queue',
    icon: Clock,
    roles: [UserRole.DOCTOR, UserRole.RECEPTION, UserRole.ADMIN],
  },
  {
    name: 'المرضى',
    path: '/app/patients',
    icon: Users,
    roles: [UserRole.DOCTOR, UserRole.RECEPTION, UserRole.ADMIN],
  },
  {
    name: 'الروشتات',
    path: '/app/prescriptions',
    icon: Pill,
    roles: [UserRole.DOCTOR, UserRole.ADMIN],
  },
  {
    name: 'التحاليل',
    path: '/app/lab-tests',
    icon: FlaskConical,
    roles: [UserRole.DOCTOR, UserRole.ADMIN],
  },
  {
    name: 'الفواتير',
    path: '/app/invoices',
    icon: Receipt,
    roles: [UserRole.RECEPTION, UserRole.ADMIN],
  },
  {
    name: 'المصروفات',
    path: '/app/expenses',
    icon: Receipt,
    roles: [UserRole.RECEPTION, UserRole.ADMIN],
  },
  {
    name: 'التقارير',
    path: '/app/reports',
    icon: FileText,
    roles: [UserRole.ADMIN, UserRole.DOCTOR],
  },
  {
    name: 'المستخدمين',
    path: '/app/users',
    icon: UserCog,
    roles: [UserRole.ADMIN],
  },
  {
    name: 'الإعدادات',
    path: '/app/settings',
    icon: Settings,
    roles: [UserRole.ADMIN, UserRole.DOCTOR],
  },
];

export default function Sidebar() {
  const { user, logout, hasPermission } = useAuthStore();
  const { branding } = useStaffClinicBranding();

  const filteredMenuItems = menuItems.filter((item) =>
    hasPermission(item.roles)
  );

  return (
    <aside className="w-64 bg-white shadow-lg flex flex-col">
      <div className="p-5 border-b">
        <ClinicBrand branding={branding} to="/app/dashboard" />
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 mb-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-100 text-primary-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center gap-3 px-4 py-2 mb-2">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-primary-600 font-semibold">
              {user?.name.charAt(0)}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-gray-500">
              {user?.role === UserRole.DOCTOR && 'دكتور'}
              {user?.role === UserRole.RECEPTION && 'استقبال'}
              {user?.role === UserRole.ADMIN && 'مشرف'}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}

