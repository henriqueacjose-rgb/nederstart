import { lessonSearchIndex } from "@nederstart/content";
import { SearchPanel } from "@/components/learning/search-panel";

export default function SearchPage() {
  return (
    <div className="grid gap-6">
      <section>
        <p className="text-sm font-semibold text-brand-accent">Search</p>
        <h1 className="mt-2 text-3xl font-bold text-brand-text">Find lessons and vocabulary</h1>
        <p className="mt-2 text-brand-muted">Search across the complete A0-B2 curriculum.</p>
      </section>
      <SearchPanel lessons={lessonSearchIndex} />
    </div>
  );
}
