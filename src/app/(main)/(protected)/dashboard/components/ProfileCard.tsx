interface ProfileCardProps {
  name?: string;
  email?: string;
  trustScore?: number;
}

export function ProfileCard({ name, email, trustScore = 0 }: ProfileCardProps) {
  return (
    <section className="bg-white rounded-3xl p-8 text-center border border-[#edeeef] shadow-sm">
      <div className="w-24 h-24 rounded-full bg-slate-50 mx-auto flex items-center justify-center ring-4 ring-primary/5 mb-4">
        <span className="material-symbols-outlined text-5xl text-primary">account_circle</span>
      </div>
      <h1 className="text-2xl font-black">{name}</h1>
      <p className="text-xs text-on-surface-variant">{email}</p>
      {trustScore >= 90 && (
        <div className="mt-3 inline-flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black border border-blue-100">
          <span className="material-symbols-outlined text-sm">verified</span> عضو موثوق
        </div>
      )}
    </section>
  );
}