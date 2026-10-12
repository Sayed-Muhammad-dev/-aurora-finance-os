import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
  ShieldCheck,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
} from "@/components/ui/primitives";
import { auditEvents } from "@/data/finance";
import { cn, timestamp } from "@/lib/format";
import { exportRows } from "@/lib/download";
import type { AuditSeverity } from "@/types";

const severityTone: Record<
  AuditSeverity,
  "neutral" | "info" | "warning" | "critical"
> = {
  info: "neutral",
  notice: "info",
  warning: "warning",
  critical: "critical",
};

const PAGE_SIZE = 8;

export function AuditPage() {
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState<AuditSeverity | "all">("all");
  const [page, setPage] = useState(1);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return auditEvents.filter((event) => {
      if (severity !== "all" && event.severity !== severity) return false;
      if (needle) {
        const haystack = `${event.actor} ${event.action} ${event.target} ${event.detail} ${event.id}`;
        if (!haystack.toLowerCase().includes(needle)) return false;
      }
      return true;
    });
  }, [query, severity]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const counts = useMemo(
    () => ({
      critical: auditEvents.filter((event) => event.severity === "critical")
        .length,
      warning: auditEvents.filter((event) => event.severity === "warning")
        .length,
    }),
    [],
  );

  return (
    <>
      <div className="stat-grid stat-grid-4">
        {[
          ["Events this period", String(auditEvents.length)],
          ["Critical events", String(counts.critical)],
          ["Warnings", String(counts.warning)],
          ["Retention", "Stored locally"],
        ].map(([label, value]) => (
          <div key={label} className="stat-card stat-card-plain">
            <p className="stat-label">{label}</p>
            <p className="stat-value stat-value-sm">{value}</p>
          </div>
        ))}
      </div>

      <div className="notice notice-info">
        <ShieldCheck size={16} />
        <p>
          The audit log is append-only. Entries cannot be edited or deleted by
          the application interface. Retention and backup policies are set by
          the deployment operator; no statutory certification is claimed.
        </p>
      </div>

      <Card>
        <CardHeader
          title="Audit log"
          subtitle="Every privileged action, with actor, target and originating address"
          action={
            <Button
              variant="secondary"
              onClick={() => exportRows(rows, "aurora-audit.csv")}
            >
              <Download size={15} /> Export
            </Button>
          }
        />

        <div className="toolbar">
          <label className="search-wrap">
            <Search size={16} />
            <span className="sr-only">Search the audit log</span>
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Search actor, action, target or reference"
            />
          </label>

          <div className="segmented">
            {(["all", "info", "notice", "warning", "critical"] as const).map(
              (option) => (
                <button
                  key={option}
                  onClick={() => {
                    setSeverity(option);
                    setPage(1);
                  }}
                  aria-pressed={severity === option}
                  className={cn(
                    "segmented-item",
                    severity === option && "segmented-item-active",
                  )}
                >
                  {option === "all" ? "All" : option}
                </button>
              ),
            )}
          </div>
        </div>

        {pageRows.length === 0 ? (
          <EmptyState
            title="No events match this filter"
            body="Try a different severity, or clear the search to see the full log."
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  setQuery("");
                  setSeverity("all");
                }}
              >
                Clear filters
              </Button>
            }
          />
        ) : (
          <>
            <div className="table-scroll">
              <table className="table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Actor</th>
                    <th>Action</th>
                    <th>Target</th>
                    <th>Severity</th>
                    <th>Source</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((event) => (
                    <tr key={event.id}>
                      <td className="mono">{timestamp(event.timestamp)}</td>
                      <td>
                        <span className="strong">{event.actor}</span>
                        <small className="sub">{event.actorRole}</small>
                      </td>
                      <td>
                        <span>{event.action}</span>
                        <small className="sub">{event.detail}</small>
                      </td>
                      <td className="mono">{event.target}</td>
                      <td>
                        <Badge tone={severityTone[event.severity]}>
                          {event.severity}
                        </Badge>
                      </td>
                      <td className="mono">{event.ip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <p>
                Showing {(safePage - 1) * PAGE_SIZE + 1}–
                {Math.min(safePage * PAGE_SIZE, rows.length)} of {rows.length}
              </p>
              <div className="pagination-controls">
                <button
                  className="icon-btn"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={safePage === 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="mono">
                  {safePage} / {pageCount}
                </span>
                <button
                  className="icon-btn"
                  onClick={() =>
                    setPage((current) => Math.min(pageCount, current + 1))
                  }
                  disabled={safePage === pageCount}
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </Card>
    </>
  );
}
