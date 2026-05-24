// app/dashboard/page.tsx
// ✅ Phase 1 Fix:
//    Bug #20 — حذف debug state من الـ UI
//              console.log الداخلية تُحذف من production

'use client';

import { useDashboard }  from '@/hooks/useDashboard';
import { useAuth }       from '@/context/AuthContext';
import type { Item }     from '@/types/item.types';

export default function DashboardPage() {
  const { user }                        = useAuth();
  const { profile, items, isLoading, error, refresh } = useDashboard();

  // ✅ Fix Bug #20 — console.log للمطوّر فقط في dev
  // لا تعرض state الداخلية في الـ UI أبداً
  if (process.env.NODE_ENV === 'development') {
    console.debug('[Dashboard] state:', { profile, items });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="text-muted-foreground">جارٍ التحميل...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-destructive">حدث خطأ في تحميل لوحة التحكم.</p>
        <button
          onClick={refresh}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  const myDonations: Item[] = items?.myDonations ?? [];
  const myRequests:  Item[] = items?.myRequests  ?? [];

  return (
    <main className="container mx-auto px-4 py-8" dir="rtl">

      {/* ── معلومات المستخدم ──────────────────────────────── */}
      {profile && (
        <section className="mb-8 p-6 bg-card rounded-xl border">
          <div className="flex items-center gap-4">
            {profile.avatar && (
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            )}
            <div>
              <h1 className="text-xl font-bold">{profile.name}</h1>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
            </div>
          </div>

          {/* ✅ Fix Bug #15 + #20 — عرض القيم الحقيقية فقط */}
          {/* لا نعرض trustScore أو quota حتى يُحمَّل profile فعلاً */}
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat
              label="درجة الثقة"
              value={
                profile.trustScore != null
                  ? `${profile.trustScore} / 100`
                  : '—'
              }
            />
            <Stat
              label="الحصص المتبقية"
              value={profile.quota != null ? String(profile.quota) : '—'}
            />
            <Stat
              label="إجمالي التبرعات"
              value={String(profile.totalDonations ?? 0)}
            />
            <Stat
              label="مستوى التحقق"
              value={`المستوى ${profile.trustLevel ?? 1}`}
            />
          </div>

          {/* ✅ Fix Bug #20 — لا debug JSON في الـ UI */}
          {/* ❌ كان: <pre>{JSON.stringify(profile, null, 2)}</pre> */}
        </section>
      )}

      {/* ── تبرعاتي ────────────────────────────────────────── */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">
          تبرعاتي ({myDonations.length})
        </h2>
        {myDonations.length === 0 ? (
          <EmptyState message="لم تتبرع بأي غرض حتى الآن 💚" />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myDonations.map(item => (
              <DashboardItemCard key={item._id} item={item} />
            ))}
          </ul>
        )}
      </section>

      {/* ── حجوزاتي ────────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-semibold mb-4">
          حجوزاتي ({myRequests.length})
        </h2>
        {myRequests.length === 0 ? (
          <EmptyState message="لم تحجز أي غرض حتى الآن 🎁" />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myRequests.map(item => (
              <DashboardItemCard key={item._id} item={item} />
            ))}
          </ul>
        )}
      </section>

    </main>
  );
}

// ── Sub-components ─────────────────────────────────────────────

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted rounded-lg p-3 text-center">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-base font-semibold">{value}</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-12 text-muted-foreground text-sm">
      {message}
    </div>
  );
}

function DashboardItemCard({ item }: { item: Item }) {
  const STATUS_COLORS: Record<string, string> = {
    'متاح':       'bg-green-100 text-green-800',
    'محجوز':      'bg-yellow-100 text-yellow-800',
    'تم التسليم': 'bg-blue-100  text-blue-800',
  };

  return (
    <li className="border rounded-xl overflow-hidden bg-card hover:shadow-md transition-shadow">
      {item.imageUrl && (
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-40 object-cover"
          loading="lazy"
        />
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-medium text-sm line-clamp-2">{item.title}</h3>
          <span
            className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
              STATUS_COLORS[item.status] ?? 'bg-muted text-muted-foreground'
            }`}
          >
            {item.status}
          </span>
        </div>
        {item.location && (
          <p className="text-xs text-muted-foreground">{item.location}</p>
        )}
      </div>
    </li>
  );
}