import { NavLink } from 'react-router-dom';
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
    roles: [UserRole.ADMIN],
  },
];

export default function Sidebar() {
  const { user, logout, hasPermission } = useAuthStore();

  const filteredMenuItems = menuItems.filter((item) =>
    hasPermission(item.roles)
  );

  return (
    <aside className="w-64 bg-white shadow-lg flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold text-primary-600">
          عيادة د. محمد عبدالحكيم
        </h1>
        <p className="text-sm text-gray-500 mt-1">طب النساء والتوليد المتكامل</p>
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

