"use client";

import Link from "next/link";
import PageIntro from "@/components/ui/PageIntro";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { useLeaderboard } from "./hooks/useLeaderboard";
import {
  EligibilityNotice,
  LeaderboardEmpty,
  LeaderboardList,
  MyRankCard,
  TopContributors,
} from "./components/LeaderboardSections";

export default function LeaderboardClient() {
  const { platformName } = useSiteConfig();
  const { leaderboard, myRank, rankEligibility, loading } = useLeaderboard();
  const topThree = leaderboard.slice(0, 3);
  const remainingEntries = leaderboard.slice(3);

  return (
    <div className="page-shell pb-20 pt-20 font-body" dir="rtl">
      <div className="site-container space-y-7 md:pt-4">
        <PageIntro
          eyebrow="مجتمع عون · أثر موثّق"
          title="لوحة المتصدرين"
          description={`مساحة تقدير لأكثر أعضاء ${platformName} نشاطًا وثقةً، مبنية على عمليات التبرع المكتملة والتقييمات الموثوقة.`}
          icon="workspace_premium"
          tone="warm"
          actions={<Link href="/dashboard" className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-xs font-black text-white hover:bg-white/16">عرض نشاطي</Link>}
          meta={
            <>
              <span className="data-chip"><span className="material-symbols-outlined text-[15px]">groups</span>{loading ? "جارٍ التحميل" : `${leaderboard.length} عضو في الترتيب`}</span>
              <span className="data-chip"><span className="material-symbols-outlined text-[15px]">verified</span>الترتيب حسب الثقة والعطاء</span>
              {myRank && <span className="data-chip">ترتيبك الحالي #{myRank.rank}</span>}
            </>
          }
        />

        {!loading && myRank && <MyRankCard rank={myRank} />}
        {!loading && rankEligibility === false && <EligibilityNotice />}
        {!loading && <TopContributors entries={topThree} />}
        <LeaderboardList entries={remainingEntries} loading={loading} totalCount={leaderboard.length} />
        {!loading && leaderboard.length === 0 && <LeaderboardEmpty />}
      </div>
    </div>
  );
}
