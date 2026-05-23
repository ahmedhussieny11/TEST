import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  Bell,
  Search,
  FlaskConical,
  Calendar,
  Clock,
  Users,
  ChevronLeft,
} from 'lucide-react';
import { dashboardApi } from '@/api/dashboard';
import { labsApi } from '@/api/labs';
import { queueApi } from '@/api/queue';
import { notificationsApi } from '@/api/notifications';
import { LabStatus } from '@/types';

type NotificationItem = {
  id: string;
  title: string;
  description?: string;
  href: string;
  icon: typeof Bell;
  dbId?: string;
};

export default function Header() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const { data: stats } = useQuery('header-dashboard', () =>
    dashboardApi.summary().then((r) => r.data),
    { refetchInterval: 60_000 }
  );

  const { data: pendingLabs = [] } = useQuery('header-pending-labs', () =>
    labsApi.list().then((r) => r.data)
  );

  const { data: queue = [] } = useQuery('header-queue', () =>
    queueApi.today().then((r) => r.data)
  );

  const { data: dbNotifs, refetch: refetchDbNotifs } = useQuery(
    'header-db-notifications',
    () => notificationsApi.list().then((r) => r.data),
    { refetchInterval: 30_000 }
  );

  const waitingCount = (queue as { status: string }[]).filter(
    (q) => q.status === 'waiting_room'
  ).length;

  const labsPending = pendingLabs.filter(
    (lab) =>
      lab.status === LabStatus.REQUESTED ||
      lab.status === LabStatus.IN_PROGRESS ||
      String(lab.status) === 'requested' ||
      String(lab.status) === 'in_progress'
  );

  const notifications = useMemo<NotificationItem[]>(() => {
    const items: NotificationItem[] = [];

    const unreadDb = (dbNotifs?.items ?? []).filter((n) => !n.read);
    unreadDb.forEach((n) => {
      items.push({
        id: `db-${n.id}`,
        dbId: n.id,
        title: n.title,
        description: n.body ?? undefined,
        href: n.link || '/app/lab-tests',
        icon: n.type === 'lab_upload' ? FlaskConical : Bell,
      });
    });

    if (waitingCount > 0) {
      items.push({
        id: 'queue',
        title: `${waitingCount} مريضة في صالة الانتظار`,
        description: 'افتحي الطابور لبدء الكشف',
        href: '/app/queue',
        icon: Clock,
      });
    }

    if (labsPending.length > 0) {
      if (labsPending.length <= 3) {
        labsPending.forEach((lab) => {
          const patient = (lab as { patient?: { name: string } }).patient;
          items.push({
            id: `lab-${lab.id}`,
            title: patient?.name ? `تحليل: ${patient.name}` : 'تحليل معلق',
            description: lab.testName,
            href: '/app/lab-tests',
            icon: FlaskConical,
          });
        });
      } else {
        items.push({
          id: 'labs-summary',
          title: `${labsPending.length} تحليل يحتاج متابعة`,
          description: 'رفع النتائج أو متابعة الطلبات',
          href: '/app/lab-tests',
          icon: FlaskConical,
        });
      }
    }

    if (stats && stats.overdueFollowUps > 0) {
      items.push({
        id: 'overdue',
        title: `${stats.overdueFollowUps} موعد متأخر`,
        description: 'مواعيد مجدولة لم تُنفَّذ بعد موعدها',
        href: '/app/appointments',
        icon: Calendar,
      });
    }

    if (stats && stats.todayAppointments > 0 && items.length < 4) {
      items.push({
        id: 'today-apt',
        title: `${stats.todayAppointments} موعد اليوم`,
        description: 'عرض جدول مواعيد اليوم',
        href: '/app/appointments',
        icon: Users,
      });
    }

    return items.slice(0, 10);
  }, [stats, waitingCount, labsPending, dbNotifs]);

  const unreadCount =
    (dbNotifs?.unreadCount ?? 0) +
    notifications.filter((n) => !n.dbId).length;

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  return (
    <header className="bg-white shadow-sm border-b px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="بحث عن مريضة، موعد، أو رقم ملف..."
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div className="relative shrink-0" ref={panelRef}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="الإشعارات"
            aria-expanded={open}
          >
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 left-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute left-0 top-full mt-2 w-80 max-h-[min(24rem,70vh)] overflow-y-auto bg-white rounded-xl shadow-lg border border-gray-200 z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">الإشعارات</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  تنبيهات مباشرة من نشاط العيادة اليوم
                </p>
              </div>

              {notifications.length === 0 ? (
                <p className="px-4 py-8 text-sm text-gray-500 text-center">
                  لا توجد تنبيهات جديدة
                </p>
              ) : (
                <ul className="py-1">
                  {notifications.map((n) => {
                    const Icon = n.icon;
                    return (
                      <li key={n.id}>
                        <Link
                          to={n.href}
                          onClick={() => {
                            setOpen(false);
                            if (n.dbId) {
                              notificationsApi.markRead(n.dbId).then(() => refetchDbNotifs());
                            }
                          }}
                          className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                        >
                          <span className="p-2 rounded-lg bg-primary-50 text-primary-600 shrink-0">
                            <Icon className="w-4 h-4" />
                          </span>
                          <span className="flex-1 min-w-0 text-right">
                            <span className="block text-sm font-medium text-gray-900">
                              {n.title}
                            </span>
                            {n.description && (
                              <span className="block text-xs text-gray-500 mt-0.5 truncate">
                                {n.description}
                              </span>
                            )}
                          </span>
                          <ChevronLeft className="w-4 h-4 text-gray-400 shrink-0 mt-1" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
