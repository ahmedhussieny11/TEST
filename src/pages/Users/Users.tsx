import { useMemo, useState } from 'react';
import { Plus, Search, UserCog, Trash2, Edit } from 'lucide-react';
import { UserRole } from '@/types';
import { mockUsers } from '@/data/mockData';

const getRoleText = (role: UserRole) => {
  switch (role) {
    case UserRole.DOCTOR:
      return 'دكتور';
    case UserRole.RECEPTION:
      return 'استقبال';
    case UserRole.ADMIN:
      return 'مشرف';
    default:
      return role;
  }
};

export default function Users() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return mockUsers;
    return mockUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.phone.includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">المستخدمين</h1>
          <p className="text-gray-600 mt-1">إدارة مستخدمي النظام</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          مستخدم جديد
        </button>
      </div>

      {/* شريط البحث */}
      <div className="card">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="بحث عن مستخدم..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* قائمة المستخدمين */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  المستخدم
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  البريد الإلكتروني
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  رقم الهاتف
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  الصلاحية
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  إجراءات
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <UserCog className="w-5 h-5 text-primary-600" />
                      </div>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">{user.email}</td>
                  <td className="py-4 px-4">{user.phone}</td>
                  <td className="py-4 px-4">
                    <span className="text-xs px-3 py-1 bg-primary-100 text-primary-800 rounded-full">
                      {getRoleText(user.role)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button className="btn-secondary text-sm py-1 px-3 flex items-center gap-1">
                        <Edit className="w-4 h-4" />
                        تعديل
                      </button>
                      <button className="btn-danger text-sm py-1 px-3 flex items-center gap-1">
                        <Trash2 className="w-4 h-4" />
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

