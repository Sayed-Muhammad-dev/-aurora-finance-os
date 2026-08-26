# Aurora Finance OS — Enterprise Financial Reporting Dashboard

A group-level financial reporting and control dashboard for a multi-entity
company: consolidated P&L across five legal entities and five currencies,
departmental variance analysis, a multi-step approval workflow, an append-only
audit log, a report library, and role-based navigation.

> **Live demo:** _add the deployment URL here_

## How this differs from my other finance dashboard

This and **05-finance-dashboard** are different products for different buyers.

| | **Aurora Finance OS** (this repo) | **05-finance-dashboard** |
| --- | --- | --- |
| Scale | Group, five legal entities, 4,295 staff | Single small business |
| User | Group Financial Controller | Founder / bookkeeper |
| Currency | **Multi-currency** — five functional currencies translated to a chosen presentation currency | Single currency (USD) |
| Distinguishing surfaces | **Approval workflows**, **audit log**, **role-based access**, report library | Transaction ledger, budgets, savings goals |
| Access model | **Three roles** (Administrator / Analyst / Auditor) changing navigation and available actions | Single user, no roles |
| Governance | Delegated authority matrix, segregation of duties, period locks, dual control | None |
| Stack | React 19 + Vite + hand-written CSS design system | Next.js 14 + Tailwind |
| Palette | Navy and charcoal with a restrained brass accent | Dark navy with emerald |

## Features

**Group overview**
- Four animated KPIs — revenue, operating expense, margin, departments over
  budget — all derived from the underlying data.
- Rolling twelve-month revenue and expense area chart.
- Revenue-by-region donut with a value legend.
- Actual-versus-budget bar chart for the six largest cost centres.
- Budget utilisation meters that turn amber above 92% and red over 100%.
- Legal-entity table showing functional currency, headcount and contribution.

**Departments**
- Ten cost centres across five entities with revenue, expense, budget variance,
  utilisation meter and headcount.
- Search, entity filter, over/under-budget filter, and five sortable columns.
- Totals recompute against the active filter set.

**Approvals — the enterprise surface**
- Eight expenditure requests with amounts in their **native currency**.
- Multi-step **sign-off chains**: signed steps show solid, the current approver
  pulses, later steps are dimmed as blocked.
- Each request states the policy that routed it (delegated authority
  thresholds, board committee requirements).
- Approve and reject write through to the chain state and raise a toast noting
  the audit entry. Available only to the Administrator role.
- Detail modal with the full chain and policy basis.

**Audit log**
- Twenty privileged actions with actor, role, target, severity and source IP.
- Search, severity filter and pagination.
- Explicit note that the log is append-only and retained for seven years.

**Reports**
- Twelve reports across statutory, management, tax, board and compliance
  categories, each with owner, period, size and export formats.
- Ready reports offer per-format downloads; failed runs offer a retry;
  generating and scheduled reports show their state.

**Settings**
- Four tabs: organisation (entities and consolidation basis), policy (approval
  thresholds, dual control, segregation of duties, period lock, FX
  revaluation), access (role permission matrix) and integrations.

**Role-based access**
- The topbar role switcher changes what appears. Analysts lose Settings and the
  audit log; Auditors are read-only and keep only the overview, audit log and
  reports. Switching to a role without access to the current page falls back to
  the overview rather than showing an empty screen.

## Tech Stack

| Layer | Choice |
| --- | --- |
| Framework | React 19 + Vite 6 |
| Language | TypeScript (strict) |
| Styling | Hand-written CSS design system with custom-property tokens |
| Charts | Recharts 2 |
| Icons | lucide-react |
| Fonts | Inter + IBM Plex Mono |

No CSS framework — the design system is roughly 1,400 lines of hand-written CSS
built on custom-property tokens, which keeps the light and dark themes to a
single set of variable overrides. Recharts is split into its own chunk so the
app shell caches separately from the charting library.

## Design

Navy (`#1e3a5f`) and charcoal carry the interface, with a single restrained
brass accent (`#b08d3f`) marking the current selection. Semantic colour is
reserved for financial meaning — green for favourable variance, amber for
approaching a limit, red for breach — never for decoration. Figures use tabular
numerals so columns align down the page.

Both themes are defined once as custom properties on `:root` and
`[data-theme="dark"]`.

## Responsive

Breakpoints at 1180px, 1024px and 720px. The sidebar becomes an off-canvas
drawer below 1024px, closing on navigation and on Escape. Every data table
scrolls horizontally inside its own container rather than wrapping or breaking
the page layout.

## Data

All data is local — there is no backend. `src/data/finance.ts` holds five legal
entities, ten departments, five currencies with FX rates, twelve months of
consolidated figures, eight approval requests with full sign-off chains, twenty
audit events and twelve reports. Monetary values are stored in USD and
translated at display time, so the presentation-currency switcher affects every
figure and chart at once.

## Getting Started

```bash
npm install
npm run dev      # http://localhost:5173
```

```bash
npm run build && npm run preview   # production build
```

## Project Structure

```
src/
  App.tsx                 page switch and shell composition
  app-context.tsx         role, currency, theme, approvals, toasts
  main.tsx                entry point
  styles.css              design tokens and component styles
  types.ts                shared domain types
  data/finance.ts         entities, departments, approvals, audit, reports
  lib/format.ts           currency conversion, dates, class merging
  components/
    shell/shell.tsx       sidebar, topbar with role switcher, toaster
    ui/primitives.tsx     card, badge, button, meter, stat, modal, skeleton
  pages/
    overview.tsx          consolidated group view
    departments.tsx       departmental variance table
    approvals.tsx         approval workflow
    audit.tsx             append-only audit log
    reports.tsx           report library
    settings.tsx          organisation, policy, access, integrations
```
