import { Suspense } from "react";
import { ResultsView } from "@/components/results-view";

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="container results-shell">
          <div className="panel">Loading results...</div>
        </div>
      }
    >
      <ResultsView />
    </Suspense>
  );
}
