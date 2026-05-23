import { useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { io } from 'socket.io-client';
import {
  Clock,
  Users,
  Stethoscope,
  CheckCircle2,
  Car,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { patientPortalApi } from '@/api/patientPortal';
import PatientSiteHeader from '../components/PatientSiteHeader';

const SOCKET_URL =
  import.meta.env.VITE_WS_URL ||
  (import.meta.env.DEV ? 'http://localhost:4000' : window.location.origin);

export default function PatientLiveQueue() {
  const { data, isLoading, refetch, isFetching } = useQuery(
    'patient-queue-status',
    () => patientPortalApi.queueStatus().then((r) => r.data),
    { refetchInterval: 20_000 }
  );

  const load = useCallback(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    const socket = io(`${SOCKET_URL}/queue`, { transports: ['websocket'] });
    socket.on('queue.updated', load);
    return () => {
      socket.disconnect();
    };
  }, [load]);

  const status = data?.status ?? 'no_appointment';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-primary-50/30">
      <PatientSiteHeader />
      <div className="max-w-lg mx-auto px-4 py-8">
        <Link
          to="/patient/dashboard"
          className="inline-flex items-center gap-2 text-sm text-primary-600 mb-6"
        >
          <ArrowRight className="w-4 h-4" />
          رجوع للوحة المتابعة
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">متتبع الدور الحي</h1>
          <p className="text-gray-600 mt-2 text-sm">
            انتظري في سيارتك أو مقهى قريب — نُحدّث الأرقام تلقائياً
          </p>
          <button
            type="button"
            onClick={() => load()}
            disabled={isFetching}
            className="mt-3 text-sm text-primary-600 inline-flex items-center gap-1"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            تحديث
          </button>
        </div>

        {isLoading ? (
          <p className="text-center text-gray-500">جاري التحميل...</p>
        ) : status === 'waiting' && data ? (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl shadow-lg border border-primary-100 p-8 text-center">
              <p className="text-sm text-gray-500 mb-2">رقمك في الطابور</p>
              <p className="text-7xl font-black text-primary-600 tabular-nums">
                {data.queueNumber}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
                <Users className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <p className="text-3xl font-bold text-gray-900">{data.aheadCount}</p>
                <p className="text-xs text-gray-500 mt-1">حالات قبلك</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
                <Clock className="w-8 h-8 text-primary-500 mx-auto mb-2" />
                <p className="text-3xl font-bold text-gray-900">{data.estimatedMinutes}</p>
                <p className="text-xs text-gray-500 mt-1">دقيقة تقريباً</p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
              <Car className="w-6 h-6 text-amber-600 shrink-0" />
              <p className="text-sm text-amber-900 leading-relaxed">{data.message}</p>
            </div>
          </div>
        ) : status === 'in_exam' ? (
          <div className="bg-blue-50 border border-blue-200 rounded-3xl p-8 text-center">
            <Stethoscope className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-blue-900">دورك الآن</h2>
            <p className="text-blue-800 mt-2">{data?.message}</p>
          </div>
        ) : status === 'done' ? (
          <div className="bg-green-50 border border-green-200 rounded-3xl p-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-green-900">تم الانتهاء</h2>
            <p className="text-green-800 mt-2">{data?.message}</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-3xl p-8 text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-700">{data?.message}</p>
            {data?.appointmentTime && (
              <p className="text-sm text-gray-500 mt-2">موعدك: {data.appointmentTime}</p>
            )}
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-8">
          التحديث كل 20 ثانية أو فور تغيير الطابور
        </p>
      </div>
    </div>
  );
}
