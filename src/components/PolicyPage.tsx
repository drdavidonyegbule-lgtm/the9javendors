import type { ReactNode } from "react";

import { SiteLayout } from "@/components/SiteLayout";

export function PolicyPage({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: string;
  sections: { heading: string; body: ReactNode }[];
}) {
  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-3xl px-5 py-16">
        <h1 className="text-3xl font-extrabold sm:text-4xl">{title}</h1>
        <p className="mt-4 text-sm text-muted-foreground sm:text-base">{intro}</p>

        <div className="mt-10 flex flex-col gap-8">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-lg font-bold">{section.heading}</h2>
              <div className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {section.body}
              </div>
            </section>
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}
