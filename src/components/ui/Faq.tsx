import { ChevronDown } from "lucide-react";

export interface FaqEntry {
  question: string;
  answer: string;
}

/** Zero-JS accordion built on native <details>/<summary> — accessible by
 * default and doesn't need a client component. */
export function Faq({ items }: { items: FaqEntry[] }) {
  return (
    <div className="divide-y divide-line rounded-2xl border border-line bg-panel">
      {items.map((item) => (
        <details key={item.question} className="group p-5 open:pb-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-ink marker:content-none">
            {item.question}
            <ChevronDown className="size-4 shrink-0 text-slate-soft transition-transform duration-200 group-open:rotate-180" />
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-slate">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
