import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Download, Search } from "lucide-react";
import { useApp } from "@/app-context";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  Meter,
} from "@/components/ui/primitives";
import { departments, entities, entityMap } from "@/data/finance";
import { cn, money, ratio } from "@/lib/format";
import { exportRows } from "@/lib/download";

type SortKey = "name" | "revenue" | "expense" | "variance" | "headcount";

export function DepartmentsPage() {
  const { currency, canEdit } = useApp();

  const [query, setQuery] = useState("");
  const [entityFilter, setEntityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "over" | "under">(
    "all",
  );
  const [sortKey, setSortKey] = useState<SortKey>("expense");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();

    const filtered = departments.filter((department) => {
      if (needle) {
        const haystack = `${department.name} ${department.owner} ${entityMap[department.entityId].name}`;
        if (!haystack.toLowerCase().includes(needle)) return false;
      }
      if (entityFilter !== "all" && department.entityId !== entityFilter)
        return false;
      if (statusFilter === "over" && department.expense <= department.budget)
        return false;
      if (statusFilter === "under" && department.expense > department.budget)
        return false;
      return true;
    });

    return [...filtered].sort((a, b) => {
      let result = 0;
      if (sortKey === "name") result = a.name.localeCompare(b.name);
      if (sortKey === "revenue") result = a.revenue - b.revenue;
      if (sortKey === "expense") result = a.expense - b.expense;
      if (sortKey === "headcount") result = a.headcount - b.headcount;
      if (sortKey === "variance")
        result = a.budget - a.expense - (b.budget - b.expense);
      return sortDir === "asc" ? result : -result;
    });
  }, [query, entityFilter, statusFilter, sortKey, sortDir]);

  const totals = useMemo(
    () => ({
      revenue: rows.reduce((sum, d) => sum + d.revenue, 0),
      expense: rows.reduce((sum, d) => sum + d.expense, 0),
      budget: rows.reduce((sum, d) => sum + d.budget, 0),
      headcount: rows.reduce((sum, d) => sum + d.headcount, 0),
    }),
    [rows],
  );

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const SortButton = ({
    column,
    children,
  }: {
    column: SortKey;
    children: React.ReactNode;
  }) => (
    <button className="sort-btn" onClick={() => toggleSort(column)}>
      {children}
      {sortKey === column ? (
        sortDir === "asc" ? (
          <ArrowUp size={12} />
        ) : (
          <ArrowDown size={12} />
        )
      ) : null}
    </button>
  );

  return (
    <>
      <div className="stat-grid stat-grid-4">
        {[
          ["Revenue in view", money(totals.revenue, currency, true)],
          ["Expense in view", money(totals.expense, currency, true)],
          ["Budget in view", money(totals.budget, currency, true)],
          ["Headcount", totals.headcount.toLocaleString("en-US")],
        ].map(([label, value]) => (
          <div key={label} className="stat-card stat-card-plain">
            <p className="stat-label">{label}</p>
            <p className="stat-value stat-value-sm">{value}</p>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader
          title="Departmental breakdown"
          subtitle="Revenue, expense and budget variance by cost centre"
          action={
            <Button
              variant="secondary"
              onClick={() => exportRows(rows, "aurora-departments.csv")}
            >
              <Download size={15} /> Export
            </Button>
          }
        />

        <div className="toolbar">
          <label className="search-wrap">
            <Search size={16} />
            <span className="sr-only">Search departments</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search department, owner or entity"
            />
          </label>

          <label className="select-wrap">
            <span className="sr-only">Filter by entity</span>
            <select
              className="select"
              value={entityFilter}
              onChange={(event) => setEntityFilter(event.target.value)}
            >
              <option value="all">All entities</option>
              {entities.map((entity) => (
                <option key={entity.id} value={entity.id}>
                  {entity.name}
                </option>
              ))}
            </select>
          </label>

          <div className="segmented">
            {(
              [
                ["all", "All"],
                ["under", "Within budget"],
                ["over", "Over budget"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setStatusFilter(id)}
                aria-pressed={statusFilter === id}
                className={cn(
                  "segmented-item",
                  statusFilter === id && "segmented-item-active",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {rows.length === 0 ? (
          <EmptyState
            title="No departments match these filters"
            body="Clear the search or widen the entity filter to see more cost centres."
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  setQuery("");
                  setEntityFilter("all");
                  setStatusFilter("all");
                }}
              >
                Clear filters
              </Button>
            }
          />
        ) : (
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>
                    <SortButton column="name">Department</SortButton>
                  </th>
                  <th>Entity</th>
                  <th>Owner</th>
                  <th className="num">
                    <SortButton column="revenue">Revenue</SortButton>
                  </th>
                  <th className="num">
                    <SortButton column="expense">Expense</SortButton>
                  </th>
                  <th className="num">
                    <SortButton column="variance">Variance</SortButton>
                  </th>
                  <th className="util">Utilisation</th>
                  <th className="num">
                    <SortButton column="headcount">FTE</SortButton>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((department, index) => {
                  const variance = department.budget - department.expense;
                  const used = ratio(department.expense, department.budget);
                  const over = variance < 0;

                  return (
                    <tr key={department.id}>
                      <td className="strong">{department.name}</td>
                      <td>
                        <Badge tone="neutral">
                          {entityMap[department.entityId].currency}
                        </Badge>{" "}
                        {entityMap[department.entityId].region}
                      </td>
                      <td>{department.owner}</td>
                      <td className="num">
                        {department.revenue > 0
                          ? money(department.revenue, currency, true)
                          : "—"}
                      </td>
                      <td className="num">
                        {money(department.expense, currency, true)}
                      </td>
                      <td className={over ? "num negative" : "num positive"}>
                        {over ? "-" : "+"}
                        {money(Math.abs(variance), currency, true)}
                      </td>
                      <td className="util">
                        <Meter
                          value={used}
                          tone={
                            over
                              ? "critical"
                              : used > 92
                                ? "warning"
                                : "positive"
                          }
                          delayMs={index * 60}
                        />
                        <span className="util-value">{used.toFixed(0)}%</span>
                      </td>
                      <td className="num">{department.headcount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="table-note">
          {canEdit
            ? "As an administrator you can adjust approved budgets from each department record."
            : "Budgets are read-only here. Sign in to an authorised account to manage them."}
          {canEdit ? <a href="/workspace?collection=departments"> Manage department budgets →</a> : null}
        </p>
      </Card>
    </>
  );
}
