import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import { usersApi } from '@/api/users';
import { User, UserRole } from '@/types';

const STAFF_ROLES: { value: UserRole; label: string }[] = [
  { value: UserRole.DOCTOR, label: 'طبيب' },
  { value: UserRole.RECEPTION, label: 'استقبال' },
  { value: UserRole.ADMIN, label: 'مشرف' },
];

type Props = {
  user?: User | null;
  onClose: () => void;
  onSaved: () => void;
};

export default function UserFormModal({ user, onClose, onSaved }: Props) {
  const isEdit = !!user;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.RECEPTION);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone ?? '');
    setRole(user.role);
    setPassword('');
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error('الاسم والبريد مطلوبان');
      return;
    }
    if (!isEdit && password.length < 6) {
      toast.error('كلمة المرور 6 أحرف على الأقل');
      return;
    }
    if (isEdit && password && password.length < 6) {
      toast.error('كلمة المرور 6 أحرف على الأقل');
      return;
    }

    setSaving(true);
    try {
      if (isEdit && user) {
        await usersApi.update(user.id, {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          role,
          ...(password ? { password } : {}),
        });
        toast.success('تم تحديث المستخدم');
      } else {
        await usersApi.create({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          password,
          role,
        });
        toast.success('تم إضافة المستخدم');
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string | string[] } } })?.response?.data
          ?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || 'تعذر حفظ المستخدم');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full border border-gray-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center px-5 py-4 border-b sticky top-0 bg-white">
          <h2 className="text-lg font-bold">
            {isEdit ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}
          </h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">الاسم *</label>
            <input
              className="input-field mt-1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">البريد الإلكتروني *</label>
            <input
              type="email"
              className="input-field mt-1"
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">الهاتف</label>
            <input
              type="tel"
              className="input-field mt-1"
              dir="ltr"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01xxxxxxxxx"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">الدور *</label>
            <select
              className="input-field mt-1"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
            >
              {STAFF_ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              كلمة المرور {isEdit ? '(اتركيها فارغة إن لم تُغيّري)' : '*'}
            </label>
            <input
              type="password"
              className="input-field mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isEdit ? '••••••••' : '6 أحرف على الأقل'}
              required={!isEdit}
              minLength={isEdit ? undefined : 6}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              إلغاء
            </button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'جاري الحفظ...' : isEdit ? 'حفظ التعديلات' : 'إضافة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
