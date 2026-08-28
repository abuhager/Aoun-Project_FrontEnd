import type { ReactNode } from "react";
import PageIntro from "@/components/ui/PageIntro";

interface LegalSection {
  title: string;
  content: ReactNode;
}

interface LegalDocumentProps {
  eyebrow: string;
  title: string;
  description: string;
  icon: string;
  updatedAt: string;
  sections: LegalSection[];
}

export default function LegalDocument({
  eyebrow,
  title,
  description,
  icon,
  updatedAt,
  sections,
}: LegalDocumentProps) {
  return (
    <div className="page-shell pt-20" dir="rtl">
      <div className="site-container space-y-6 pb-20 md:pt-4">
        <PageIntro
          eyebrow={eyebrow}
          title={title}
          description={description}
          icon={icon}
          tone="ink"
          meta={<span className="data-chip">آخر تحديث: {updatedAt}</span>}
        />

        <article className="content-panel mx-auto max-w-4xl space-y-8 p-6 md:p-10">
          {sections.map((section) => (
            <section key={section.title} className="space-y-3">
              <h2 className="text-lg font-black text-on-surface">{section.title}</h2>
              <div className="space-y-3 text-sm leading-8 text-on-surface-soft">
                {section.content}
              </div>
            </section>
          ))}
        </article>
      </div>
    </div>
  );
}
