import { useMemo, useState, useEffect } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { useApp } from "@/app-context";
import { Card, CardHeader, Badge, Meter, Skeleton, StatCard } from "@/components/ui/primitives";
import { departments, entities, entityMap, monthlySeries } from "@/data/finance";
import { money, percent, ratio } from "@/lib/format";

const entityColours = ["#1e3a5f", "#2f6f8f", "#3f9c9c", "#b08d3f", "#8a5a44"];

function ChartTooltip({
  active,
  payload,
  label,
  currency
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string }>;
  label?: string;
  currency: Parameters<typeof money>[1];
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      {label ? <p className="chart-tooltip-label">{label}</p> : null}
      {payload.map((entry, index) => (
        <p key={index} className="chart-tooltip-row">
          <span className="dot" style={{ background: entry.color }} />
          <span>{entry.name}</span>
          <strong>{money(entry.value ?? 0, currency, true)}</strong>
        </p>
      ))}
    </div>
  );
}

export function OverviewPage() {
  const { currency } = useApp();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 600);
    return () => window.clearTimeout(timer);
  }, []);

  const totals = useMemo(() => {
    const revenue = departments.reduce((sum, d) => sum + d.revenue, 0);
    const expense = departments.reduce((sum, d) => sum + d.expense, 0);
    const budget = departments.reduce((sum, d) => sum + d.budget, 0);
    return { revenue, expense, budget, margin: revenue === 0 ? 0 : ((revenue - expense) / revenue) * 100 };
  }, []);

  const byEntity = useMemo(
    () =>
      entities.map((entity, index) => {
        const rows = departments.filter((d) => d.entityId === entity.id);
        return {
          name: entity.region,
          entity: entity.name,
          value: rows.reduce((sum, d) => sum + d.revenue, 0),
          expense: rows.reduce((sum, d) => sum + d.expense, 0),
          colour: entityColours[index % entityColours.length]
        };
      }),
    []
  );

  const topSpend = useMemo(
    () => [...departments].sort((a, b) => b.expense - a.expense).slice(0, 6),
    []
  );

  const overBudget = departments.filter((d) => d.expense > d.budget);

  return (
    <>
      <div className="stat-grid">
        <StatCard
          label="Group revenue, FY to date"
          value={totals.revenue}
          delta={11.4}
          caption="vs. prior year"
          loading={loading}
          format={(value) => money(value, currency, true)}
        />
        <StatCard
          label="Group operating expense"
          value={totals.expense}
          delta={6.8}
          invertDelta
          caption="vs. prior year"
          loading={loading}
          format={(value) => money(value, currency, true)}
        />
        <StatCard
          label="Operating margin"
          value={totals.margin}
          delta={2.1}
          caption="target 22.0%"
          loading={loading}
          format={(value) => `${value.toFixed(1)}%`}
        />
        <StatCard
          label="Departments over budget"
          value={overBudget.length}
          caption={`of ${departments.length} cost centres`}
          loading={loading}
          format={(value) => String(Math.round(value))}
        />
      </div>

      <div className="grid-2-1">
        <Card>
          <CardHeader
            title="Revenue and expense, rolling 12 months"
            subtitle={`Consolidated across ${entities.length} legal entities, presented in ${currency}`}
          />
          {loading ? (
            <Skeleton className="skeleton-chart" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlySeries} margin={{ top: 8, right: 8, left: -6, bottom: 0 }}>
                <defs>
                  <linearGradient id="revFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#2f6f8f" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#2f6f8f" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#b08d3f" stopOpacity={0.32} />
                    <stop offset="100%" stopColor="#b08d3f" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--grid)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--muted)" }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  width={62}
                  tick={{ fontSize: 12, fill: "var(--muted)" }}
                  tickFormatter={(value) => money(value, currency, true)}
                />
                <Tooltip content={<ChartTooltip currency={currency} />} />
                <Legend verticalAlign="top" height={30} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#2f6f8f" strokeWidth={2.5} fill="url(#revFill)" animationDuration={900} />
                <Area type="monotone" dataKey="expense" name="Expense" stroke="#b08d3f" strokeWidth={2.5} fill="url(#expFill)" animationDuration={900} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <CardHeader title="Revenue by region" subtitle="Share of group revenue" />
          {loading ? (
            <Skeleton className="skeleton-chart" />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={byEntity.filter((row) => row.value > 0)}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="58%"
                    outerRadius="86%"
                    paddingAngle={3}
                    stroke="none"
                    animationDuration={900}
                  >
                    {byEntity.map((row) => (
                      <Cell key={row.name} fill={row.colour} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip currency={currency} />} />
                </PieChart>
              </ResponsiveContainer>

              <ul className="legend-list">
                {byEntity
                  .filter((row) => row.value > 0)
                  .map((row) => (
                    <li key={row.name}>
                      <span className="dot" style={{ background: row.colour }} />
                      <span className="legend-name">{row.name}</span>
                      <strong>{money(row.value, currency, true)}</strong>
                    </li>
                  ))}
              </ul>
            </>
          )}
        </Card>
      </div>

      <div className="grid-2-1">
        <Card>
          <CardHeader title="Operating expense by department" subtitle="Six largest cost centres" />
          {loading ? (
            <Skeleton className="skeleton-chart" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={topSpend.map((d) => ({ name: d.name.replace("Commercial — ", ""), expense: d.expense, budget: d.budget }))}
                layout="vertical"
                margin={{ top: 4, right: 16, left: 4, bottom: 4 }}
              >
                <CartesianGrid horizontal={false} stroke="var(--grid)" />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  width={150}
                  tick={{ fontSize: 12, fill: "var(--text)" }}
                />
                <Tooltip content={<ChartTooltip currency={currency} />} cursor={{ fill: "var(--grid)" }} />
                <Legend verticalAlign="top" height={30} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="budget" name="Budget" fill="var(--grid)" radius={[0, 6, 6, 0]} animationDuration={800} />
                <Bar dataKey="expense" name="Actual" fill="#2f6f8f" radius={[0, 6, 6, 0]} animationDuration={900} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <CardHeader title="Budget utilisation" subtitle="Actual against approved budget" />
          <div className="meter-list">
            {loading
              ? Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="skeleton-row" />)
              : topSpend.map((department, index) => {
                  const used = ratio(department.expense, department.budget);
                  const over = used > 100;
                  return (
                    <div key={department.id} className="meter-row">
                      <div className="meter-row-head">
                        <span className="meter-row-name">{department.name}</span>
                        <span className={over ? "meter-row-value over" : "meter-row-value"}>
                          {used.toFixed(0)}%
                        </span>
                      </div>
                      <Meter value={used} tone={over ? "critical" : used > 92 ? "warning" : "positive"} delayMs={index * 80} />
                      <p className="meter-row-note">
                        {money(department.expense, currency, true)} of {money(department.budget, currency, true)} ·{" "}
                        {entityMap[department.entityId].region}
                      </p>
                    </div>
                  );
                })}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Legal entities"
          subtitle="Consolidation scope and functional currencies"
          action={<Badge tone="info">{entities.length} entities</Badge>}
        />
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>Entity</th>
                <th>Region</th>
                <th>Functional currency</th>
                <th className="num">Headcount</th>
                <th className="num">Revenue</th>
                <th className="num">Expense</th>
                <th className="num">Contribution</th>
              </tr>
            </thead>
            <tbody>
              {byEntity.map((row, index) => {
                const entity = entities[index];
                const contribution = row.value - row.expense;
                return (
                  <tr key={entity.id}>
                    <td className="strong">{entity.name}</td>
                    <td>{entity.region}</td>
                    <td>
                      <Badge tone="neutral">{entity.currency}</Badge>
                    </td>
                    <td className="num">{entity.headcount.toLocaleString("en-US")}</td>
                    <td className="num">{money(row.value, currency, true)}</td>
                    <td className="num">{money(row.expense, currency, true)}</td>
                    <td className={contribution >= 0 ? "num positive" : "num negative"}>
                      {money(contribution, currency, true)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="table-note">
          Group operating margin {percent(totals.margin)} against a {percent(22)} target. Figures
          translated to {currency} at closing rates.
        </p>
      </Card>
    </>
  );
}
