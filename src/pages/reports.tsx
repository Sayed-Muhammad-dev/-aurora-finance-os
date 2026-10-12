import { useMemo, useState } from "react";
import {
  Download,
  FileText,
  Loader2,
  Search,
  TriangleAlert,
} from "lucide-react";

import {
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
} from "@/components/ui/primitives";
import { reports } from "@/data/finance";
import { cn, shortDate } from "@/lib/format";
import type { ReportStatus } from "@/types";

const statusTone: Record<
  ReportStatus,
  "positive" | "info" | "neutral" | "critical"
> = {
  ready: "positive",
  generating: "info",
  scheduled: "neutral",
  failed: "critical",
};

const categories = [
  "All",
  "Statutory",
  "Management",
  "Tax",
  "Board",
  "Compliance",
] as const;

export function ReportsPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("All");

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return reports.filter((report) => {
      if (category !== "All" && report.category !== category) return false;
      if (needle) {
        const haystack = `${report.name} ${report.period} ${report.owner}`;
        if (!haystack.toLowerCase().includes(needle)) return false;
      }
      return true;
    });
  }, [query, category]);

  return (
    <>
      <div className="stat-grid stat-grid-4">
        {[
          [
            "Reports available",
            String(reports.filter((r) => r.status === "ready").length),
          ],
          [
            "Currently generating",
            String(reports.filter((r) => r.status === "generating").length),
          ],
          [
            "Scheduled",
            String(reports.filter((r) => r.status === "scheduled").length),
          ],
          [
            "Failed runs",
            String(reports.filter((r) => r.status === "failed").length),
          ],
        ].map(([label, value]) => (
          <div key={label} className="stat-card stat-card-plain">
            <p className="stat-label">{label}</p>
            <p className="stat-value stat-value-sm">{value}</p>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader
          title="Report library"
          subtitle="Statutory, management, tax and board reporting for the current period"
          action={
            <Button onClick={() => window.location.assign("/workspace")}>
              <FileText size={15} /> New report
            </Button>
          }
        />

        <div className="toolbar">
          <label className="search-wrap">
            <Search size={16} />
            <span className="sr-only">Search reports</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search report, period or owner"
            />
          </label>

          <div className="segmented">
            {categories.map((option) => (
              <button
                key={option}
                onClick={() => setCategory(option)}
                aria-pressed={category === option}
                className={cn(
                  "segmented-item",
                  category === option && "segmented-item-active",
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {rows.length === 0 ? (
          <EmptyState
            title="No reports match this filter"
            body="Try another category, or clear the search to see the full library."
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  setQuery("");
                  setCategory("All");
                }}
              >
                Clear filters
              </Button>
            }
          />
        ) : (
          <div className="report-grid">
            {rows.map((report) => (
              <article key={report.id} className="report-card">
                <div className="report-head">
                  <span className="report-icon">
                    {report.status === "generating" ? (
                      <Loader2 size={17} className="spin" />
                    ) : report.status === "failed" ? (
                      <TriangleAlert size={17} />
                    ) : (
                      <FileText size={17} />
                    )}
                  </span>
                  <Badge tone={statusTone[report.status]}>
                    {report.status}
                  </Badge>
                </div>

                <h3 className="report-name">{report.name}</h3>
                <p className="report-meta">
                  {report.category} · {report.period}
                </p>

                <dl className="report-detail">
                  <div>
                    <dt>Owner</dt>
                    <dd>{report.owner}</dd>
                  </div>
                  <div>
                    <dt>Updated</dt>
                    <dd>{shortDate(report.updated)}</dd>
                  </div>
                  <div>
                    <dt>Size</dt>
                    <dd>
                      {report.sizeKb > 0
                        ? `${(report.sizeKb / 1024).toFixed(1)} MB`
                        : "—"}
                    </dd>
                  </div>
                </dl>

                <div className="report-actions">
                  {report.status === "ready" ? (
                    ["CSV"].map((format) => (
                      <button
                        key={format}
                        className="format-btn"
                        onClick={() =>
                          window.location.assign("/api/app/export/departments")
                        }
                      >
                        <Download size={13} /> {format}
                      </button>
                    ))
                  ) : report.status === "failed" ? (
                    <button
                      className="format-btn format-btn-danger"
                      onClick={() => window.location.assign("/workspace")}
                    >
                      Retry run
                    </button>
                  ) : (
                    <span className="report-pending">
                      {report.status === "generating"
                        ? "Generating…"
                        : "Scheduled"}
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}
