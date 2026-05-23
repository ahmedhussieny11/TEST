import { useMemo, useState } from 'react';
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';
import { useQuery, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { usersApi } from '@/api/users';
import { useAuthStore } from '@/store/authStore';
import { User, UserRole } from '@/types';
import UserFormModal from '@/components/Users/UserFormModal';

const roleLabels: Record<UserRole, string> = {
  [UserRole.DOCTOR]: 'طبيب',
  [UserRole.RECEPTION]: 'استقبال',
  [UserRole.ADMIN]: 'مشرف',
  [UserRole.PATIENT]: 'مريضة',
};

export default function Users() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalUser, setModalUser] = useState<User | null | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: users = [], isLoading } = useQuery('users', () =>
    usersApi.list().then((r) => r.data)
  );

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone ?? '').includes(q)
    );
  }, [searchQuery, users]);

  const refresh = () => queryClient.invalidateQueries('users');

  const handleDelete = async (user: User) => {
    if (user.id === currentUser?.id) {
      toast.error('لا يمكنك حذف حسابك');
      return;
    }
    if (
      !window.confirm(
        `هل تريدين حذف المستخدم «${user.name}»؟\nلا يمكن التراجع عن هذا الإجراء.`
      )
    ) {
      return;
    }
    setDeletingId(user.id);
    try {
      await usersApi.remove(user.id);
      toast.success('تم حذف المستخدم');
      refresh();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string | string[] } } })?.response?.data
          ?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || 'تعذر حذف المستخدم');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">المستخدمين</h1>
          <p className="text-gray-600 mt-1">إدارة حسابات فريق العيادة</p>
        </div>
        <button
          type="button"
          onClick={() => setModalUser(null)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          إضافة مستخدم
        </button>
      </div>

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

      {isLoading ? (
        <p className="text-gray-500">جاري التحميل...</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">الاسم</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">البريد</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">الهاتف</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">الدور</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 w-28">
                  إجراءات
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 font-medium">
                    {user.name}
                    {user.id === currentUser?.id && (
                      <span className="text-xs text-gray-400 mr-2">(أنت)</span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-gray-600" dir="ltr">
                    {user.email}
                  </td>
                  <td className="py-4 px-4 text-gray-600" dir="ltr">
                    {user.phone || '—'}
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-xs px-2 py-1 rounded-full bg-primary-50 text-primary-700">
                      {roleLabels[user.role as UserRole] ?? user.role}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => setModalUser(user)}
                        className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="تعديل"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(user)}
                        disabled={deletingId === user.id || user.id === currentUser?.id}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-center py-8 text-gray-500">لا يوجد مستخدمون</p>
          )}
        </div>
      )}

      {modalUser !== undefined && (
        <UserFormModal
          user={modalUser}
          onClose={() => setModalUser(undefined)}
          onSaved={refresh}
        />
      )}
    </div>
  );
}
