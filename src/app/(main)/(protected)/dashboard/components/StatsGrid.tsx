interface StatsGridProps {
  trustScore?: number;
  quota?: number;
  donationsCount: number;
}

export function StatsGrid({ trustScore = 0, quota = 0, donationsCount }: StatsGridProps) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#edeeef] text-center">
        <p className="text-xs font-bold text-gray-400 mb-4">نقاط الثقة</p>  {/* ← غيّر من "مؤشر الثقة%" */}
        <p className="text-3xl font-black text-primary">{trustScore}</p>     {/* ← حذف % */}
      </div>
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#edeeef] text-center flex flex-col justify-center">
        <p className="text-xs font-bold text-gray-400 mb-2">الكوتا المتاحة</p>
        <p className="text-3xl font-black text-blue-600">{quota} / 2</p>
        <p className="text-[10px] text-blue-400 mt-1">حجوزات نشطة حالياً</p>
      </div>
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#edeeef] text-center flex flex-col justify-center">
        <p className="text-xs font-bold text-gray-400 mb-2">تبرعاتك</p>
        <p className="text-3xl font-black text-primary">{donationsCount}</p>
        <p className="text-[10px] text-secondary mt-1 font-bold">بصمتك في الخير 💚</p>
      </div>
    </section>
  );
}