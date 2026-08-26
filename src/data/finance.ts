import type {
  Approval,
  AuditEvent,
  Currency,
  Department,
  Entity,
  MonthlyPoint,
  NavItem,
  Report,
  Role
} from "@/types";

export const org = {
  name: "Aurora Finance OS",
  company: "Aurora Industries plc",
  fiscalYear: "FY2026",
  period: "Q3 FY2026 · closing 30 September",
  user: { name: "Sarah Kim", title: "Group Financial Controller", initials: "SK" }
};

export const roleLabels: Record<Role, { label: string; blurb: string }> = {
  admin: {
    label: "Administrator",
    blurb: "Full access: approve spend, edit budgets, manage users and export any report."
  },
  analyst: {
    label: "Analyst",
    blurb: "Read and model. Can build reports and comment, but cannot approve or edit budgets."
  },
  auditor: {
    label: "Auditor",
    blurb: "Read-only across the audit log and statutory reports. No operational access."
  }
};

export const navItems: NavItem[] = [
  { id: "overview", label: "Group overview", roles: ["admin", "analyst", "auditor"] },
  { id: "departments", label: "Departments", roles: ["admin", "analyst"] },
  { id: "approvals", label: "Approvals", roles: ["admin", "analyst"] },
  { id: "audit", label: "Audit log", roles: ["admin", "auditor"] },
  { id: "reports", label: "Reports", roles: ["admin", "analyst", "auditor"] },
  { id: "settings", label: "Settings", roles: ["admin"] }
];

export const currencies: Currency[] = [
  { code: "USD", symbol: "$", label: "US Dollar", rateFromUsd: 1 },
  { code: "EUR", symbol: "€", label: "Euro", rateFromUsd: 0.92 },
  { code: "GBP", symbol: "£", label: "Pound Sterling", rateFromUsd: 0.79 },
  { code: "JPY", symbol: "¥", label: "Japanese Yen", rateFromUsd: 151.4 },
  { code: "SGD", symbol: "S$", label: "Singapore Dollar", rateFromUsd: 1.34 }
];

export const currencyMap = currencies.reduce<Record<string, Currency>>((acc, currency) => {
  acc[currency.code] = currency;
  return acc;
}, {});

export const entities: Entity[] = [
  { id: "e-us", name: "Aurora Industries Inc.", region: "North America", currency: "USD", headcount: 1840 },
  { id: "e-eu", name: "Aurora Europe GmbH", region: "EMEA", currency: "EUR", headcount: 1120 },
  { id: "e-uk", name: "Aurora UK Ltd.", region: "United Kingdom", currency: "GBP", headcount: 640 },
  { id: "e-jp", name: "Aurora Japan KK", region: "APAC", currency: "JPY", headcount: 410 },
  { id: "e-sg", name: "Aurora Asia Pte.", region: "APAC", currency: "SGD", headcount: 285 }
];

export const entityMap = entities.reduce<Record<string, Entity>>((acc, entity) => {
  acc[entity.id] = entity;
  return acc;
}, {});

/** All monetary values are held in USD and converted at display time. */
export const departments: Department[] = [
  { id: "d-rev-na", name: "Commercial — North America", entityId: "e-us", owner: "Daniel Ross", revenue: 184_200_000, expense: 96_400_000, budget: 98_000_000, headcount: 520 },
  { id: "d-rev-emea", name: "Commercial — EMEA", entityId: "e-eu", owner: "Ines Mueller", revenue: 121_800_000, expense: 71_900_000, budget: 70_000_000, headcount: 380 },
  { id: "d-rev-uk", name: "Commercial — UK", entityId: "e-uk", owner: "Oliver Grant", revenue: 68_400_000, expense: 39_200_000, budget: 41_000_000, headcount: 210 },
  { id: "d-rev-apac", name: "Commercial — APAC", entityId: "e-jp", owner: "Kenji Watanabe", revenue: 54_900_000, expense: 34_600_000, budget: 33_500_000, headcount: 190 },
  { id: "d-eng", name: "Engineering", entityId: "e-us", owner: "Mia Patel", revenue: 0, expense: 142_700_000, budget: 138_000_000, headcount: 860 },
  { id: "d-ops", name: "Operations & Supply", entityId: "e-eu", owner: "Lars Berg", revenue: 0, expense: 88_300_000, budget: 91_000_000, headcount: 640 },
  { id: "d-mkt", name: "Marketing", entityId: "e-us", owner: "Ava Liu", revenue: 0, expense: 46_100_000, budget: 44_000_000, headcount: 180 },
  { id: "d-ga", name: "General & Administrative", entityId: "e-us", owner: "Marcus Reed", revenue: 0, expense: 38_900_000, budget: 40_500_000, headcount: 240 },
  { id: "d-rd", name: "Research", entityId: "e-sg", owner: "Priya Nair", revenue: 0, expense: 31_400_000, budget: 29_000_000, headcount: 145 },
  { id: "d-treasury", name: "Treasury & Risk", entityId: "e-uk", owner: "Helen Cross", revenue: 12_600_000, expense: 9_800_000, budget: 10_200_000, headcount: 62 }
];

export const departmentMap = departments.reduce<Record<string, Department>>((acc, department) => {
  acc[department.id] = department;
  return acc;
}, {});

export const monthlySeries: MonthlyPoint[] = [
  { month: "Oct", revenue: 33_100_000, expense: 25_400_000 },
  { month: "Nov", revenue: 34_800_000, expense: 26_100_000 },
  { month: "Dec", revenue: 41_600_000, expense: 29_800_000 },
  { month: "Jan", revenue: 35_200_000, expense: 27_300_000 },
  { month: "Feb", revenue: 36_400_000, expense: 27_900_000 },
  { month: "Mar", revenue: 39_100_000, expense: 29_200_000 },
  { month: "Apr", revenue: 37_800_000, expense: 28_600_000 },
  { month: "May", revenue: 40_300_000, expense: 30_100_000 },
  { month: "Jun", revenue: 43_900_000, expense: 31_800_000 },
  { month: "Jul", revenue: 41_200_000, expense: 30_900_000 },
  { month: "Aug", revenue: 42_700_000, expense: 31_400_000 },
  { month: "Sep", revenue: 46_800_000, expense: 33_200_000 }
];

export const approvals: Approval[] = [
  {
    id: "AP-4821",
    title: "Frankfurt data centre expansion",
    description: "Second cage at the FRA4 facility plus 18 months of committed cross-connect capacity, required before the EU data residency deadline.",
    requester: "Mia Patel",
    departmentId: "d-eng",
    amount: 4_280_000,
    currency: "EUR",
    submitted: "2026-09-18",
    status: "pending",
    priority: "critical",
    policy: "Capex over €2M requires CFO and Board Finance Committee sign-off.",
    chain: [
      { role: "Department head", name: "Mia Patel", state: "signed" },
      { role: "Group Controller", name: "Sarah Kim", state: "waiting" },
      { role: "CFO", name: "Robert Vance", state: "blocked" },
      { role: "Board Finance Committee", name: "Committee", state: "blocked" }
    ]
  },
  {
    id: "AP-4818",
    title: "APAC contract manufacturer retainer",
    description: "Twelve-month retainer with the Osaka assembly partner, replacing the expiring per-unit arrangement.",
    requester: "Kenji Watanabe",
    departmentId: "d-ops",
    amount: 268_400_000,
    currency: "JPY",
    submitted: "2026-09-16",
    status: "pending",
    priority: "elevated",
    policy: "Multi-year supplier commitments require Procurement and Controller sign-off.",
    chain: [
      { role: "Department head", name: "Lars Berg", state: "signed" },
      { role: "Procurement", name: "Nina Okonjo", state: "signed" },
      { role: "Group Controller", name: "Sarah Kim", state: "waiting" }
    ]
  },
  {
    id: "AP-4815",
    title: "Q4 brand campaign — North America",
    description: "Paid media, production and agency fees for the Q4 category campaign across the US and Canada.",
    requester: "Ava Liu",
    departmentId: "d-mkt",
    amount: 1_940_000,
    currency: "USD",
    submitted: "2026-09-15",
    status: "pending",
    priority: "standard",
    policy: "Marketing spend over $1M requires Controller sign-off.",
    chain: [
      { role: "Department head", name: "Ava Liu", state: "signed" },
      { role: "Group Controller", name: "Sarah Kim", state: "waiting" }
    ]
  },
  {
    id: "AP-4809",
    title: "UK pension scheme top-up",
    description: "Deficit reduction contribution agreed with the trustees at the triennial valuation.",
    requester: "Helen Cross",
    departmentId: "d-treasury",
    amount: 3_100_000,
    currency: "GBP",
    submitted: "2026-09-12",
    status: "pending",
    priority: "critical",
    policy: "Pension contributions require CFO and Audit Committee sign-off.",
    chain: [
      { role: "Treasury", name: "Helen Cross", state: "signed" },
      { role: "Group Controller", name: "Sarah Kim", state: "signed" },
      { role: "CFO", name: "Robert Vance", state: "waiting" },
      { role: "Audit Committee", name: "Committee", state: "blocked" }
    ]
  },
  {
    id: "AP-4802",
    title: "Singapore research headcount, 12 roles",
    description: "Twelve additional research engineers in Singapore, phased across Q4 and Q1.",
    requester: "Priya Nair",
    departmentId: "d-rd",
    amount: 2_640_000,
    currency: "SGD",
    submitted: "2026-09-09",
    status: "approved",
    priority: "elevated",
    policy: "Headcount additions above 10 FTE require Controller and People sign-off.",
    chain: [
      { role: "Department head", name: "Priya Nair", state: "signed" },
      { role: "People", name: "Tomas Alvarez", state: "signed" },
      { role: "Group Controller", name: "Sarah Kim", state: "signed" }
    ]
  },
  {
    id: "AP-4797",
    title: "Legacy CRM licence renewal",
    description: "Three-year renewal of the legacy CRM ahead of the platform migration.",
    requester: "Daniel Ross",
    departmentId: "d-rev-na",
    amount: 1_180_000,
    currency: "USD",
    submitted: "2026-09-04",
    status: "rejected",
    priority: "standard",
    policy: "Software renewals over $1M require Controller sign-off.",
    chain: [
      { role: "Department head", name: "Daniel Ross", state: "signed" },
      { role: "Group Controller", name: "Sarah Kim", state: "signed" }
    ]
  },
  {
    id: "AP-4791",
    title: "EMEA office consolidation",
    description: "Break fee and fit-out for consolidating three EMEA offices into the Munich hub.",
    requester: "Ines Mueller",
    departmentId: "d-ops",
    amount: 5_420_000,
    currency: "EUR",
    submitted: "2026-08-28",
    status: "approved",
    priority: "critical",
    policy: "Property commitments require CFO and Board Finance Committee sign-off.",
    chain: [
      { role: "Department head", name: "Ines Mueller", state: "signed" },
      { role: "Group Controller", name: "Sarah Kim", state: "signed" },
      { role: "CFO", name: "Robert Vance", state: "signed" },
      { role: "Board Finance Committee", name: "Committee", state: "signed" }
    ]
  },
  {
    id: "AP-4786",
    title: "Cyber insurance renewal",
    description: "Annual renewal at a higher limit following the revised risk assessment.",
    requester: "Marcus Reed",
    departmentId: "d-ga",
    amount: 890_000,
    currency: "USD",
    submitted: "2026-08-22",
    status: "approved",
    priority: "standard",
    policy: "Insurance renewals require Controller sign-off.",
    chain: [
      { role: "Department head", name: "Marcus Reed", state: "signed" },
      { role: "Group Controller", name: "Sarah Kim", state: "signed" }
    ]
  }
];

const auditSeeds: Array<[string, string, string, string, AuditEvent["severity"], string]> = [
  ["Sarah Kim", "Group Financial Controller", "Approved expenditure request", "AP-4802 · Singapore research headcount", "notice", "Within delegated authority of $5M."],
  ["Robert Vance", "Chief Financial Officer", "Approved expenditure request", "AP-4791 · EMEA office consolidation", "notice", "Board Finance Committee minute 2026-08-27 referenced."],
  ["Sarah Kim", "Group Financial Controller", "Rejected expenditure request", "AP-4797 · Legacy CRM renewal", "warning", "Rejected pending outcome of the platform migration decision."],
  ["Ines Mueller", "Commercial Director EMEA", "Amended departmental budget", "d-rev-emea · FY2026 budget", "warning", "Increased from €62.1M to €64.4M following reforecast."],
  ["System", "Automated control", "FX revaluation posted", "Period 2026-09 · all entities", "info", "Month-end revaluation at closing rates; variance $412k to reserves."],
  ["Marcus Reed", "Head of G&A", "Exported report", "Statutory pack Q3 FY2026", "notice", "PDF export, 42 pages, watermarked."],
  ["Helen Cross", "Group Treasurer", "Modified approval threshold", "Treasury policy · FX hedging", "critical", "Raised single-trade limit from $10M to $15M."],
  ["Tomas Alvarez", "Head of People", "Granted role", "priya.nair@aurora.example · Analyst", "notice", "Scoped to the Research department only."],
  ["System", "Automated control", "Segregation of duties check passed", "Approval chain AP-4818", "info", "No approver appears twice in the chain."],
  ["Auditor Access", "External auditor", "Viewed audit log", "Period 2026-07 to 2026-09", "info", "Read-only session, Deloitte engagement 2026."],
  ["Sarah Kim", "Group Financial Controller", "Locked accounting period", "Period 2026-08", "critical", "Period closed; further postings require reopening."],
  ["Daniel Ross", "Commercial Director NA", "Submitted expenditure request", "AP-4797 · Legacy CRM renewal", "info", "Routed to Group Controller under the $1M policy."],
  ["Mia Patel", "VP Engineering", "Submitted expenditure request", "AP-4821 · Frankfurt data centre", "notice", "Flagged critical: exceeds €2M capex threshold."],
  ["System", "Automated control", "Failed sign-in attempt", "robert.vance@aurora.example", "warning", "Three attempts from an unrecognised device; account not locked."],
  ["Ava Liu", "Head of Marketing", "Uploaded supporting document", "AP-4815 · Q4 brand campaign", "info", "Agency statement of work, 14 pages."],
  ["Robert Vance", "Chief Financial Officer", "Approved policy exception", "Procurement · single-source waiver", "critical", "Osaka assembly partner; documented sole-supplier justification."],
  ["Nina Okonjo", "Head of Procurement", "Approved expenditure request", "AP-4818 · APAC contract manufacturer", "notice", "Within procurement delegated authority."],
  ["System", "Automated control", "Intercompany balances reconciled", "All entities · 2026-09", "info", "Nine pairs matched, zero unmatched."],
  ["Oliver Grant", "Commercial Director UK", "Downloaded export", "Management pack Q3 · UK", "notice", "CSV export, 1,842 rows."],
  ["Sarah Kim", "Group Financial Controller", "Revoked role", "contractor.access@aurora.example", "warning", "Engagement ended; access removed same day."]
];

/** Audit rows are generated across September on a fixed cadence, newest first. */
export const auditEvents: AuditEvent[] = auditSeeds.map((seed, index) => {
  const [actor, actorRole, action, target, severity, detail] = seed;
  const day = 26 - index;
  const hour = 8 + (index * 3) % 11;
  const minute = (index * 17) % 60;

  return {
    id: `EV-${9000 + auditSeeds.length - index}`,
    timestamp: `2026-09-${String(Math.max(1, day)).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`,
    actor,
    actorRole,
    action,
    target,
    severity,
    ip: `10.24.${8 + (index % 5)}.${40 + index}`,
    detail
  };
});

export const reports: Report[] = [
  { id: "R-101", name: "Consolidated statutory pack", period: "Q3 FY2026", category: "Statutory", owner: "Sarah Kim", updated: "2026-09-26", status: "ready", formats: ["PDF", "XLSX"], sizeKb: 4820 },
  { id: "R-102", name: "Board finance summary", period: "Q3 FY2026", category: "Board", owner: "Robert Vance", updated: "2026-09-25", status: "ready", formats: ["PDF"], sizeKb: 1240 },
  { id: "R-103", name: "Departmental P&L detail", period: "September 2026", category: "Management", owner: "Sarah Kim", updated: "2026-09-24", status: "ready", formats: ["XLSX", "CSV"], sizeKb: 8640 },
  { id: "R-104", name: "VAT and indirect tax return", period: "Q3 FY2026", category: "Tax", owner: "Marcus Reed", updated: "2026-09-24", status: "generating", formats: ["PDF", "XML"], sizeKb: 0 },
  { id: "R-105", name: "SOX control evidence", period: "Q3 FY2026", category: "Compliance", owner: "Helen Cross", updated: "2026-09-22", status: "ready", formats: ["PDF", "ZIP"], sizeKb: 22400 },
  { id: "R-106", name: "FX exposure and hedge position", period: "September 2026", category: "Management", owner: "Helen Cross", updated: "2026-09-21", status: "ready", formats: ["XLSX"], sizeKb: 1980 },
  { id: "R-107", name: "Intercompany reconciliation", period: "September 2026", category: "Compliance", owner: "Sarah Kim", updated: "2026-09-20", status: "ready", formats: ["XLSX", "CSV"], sizeKb: 3210 },
  { id: "R-108", name: "Transfer pricing documentation", period: "FY2026", category: "Tax", owner: "Marcus Reed", updated: "2026-09-18", status: "scheduled", formats: ["PDF"], sizeKb: 0 },
  { id: "R-109", name: "Headcount and payroll analysis", period: "September 2026", category: "Management", owner: "Tomas Alvarez", updated: "2026-09-17", status: "ready", formats: ["XLSX"], sizeKb: 2740 },
  { id: "R-110", name: "Capex commitment schedule", period: "FY2026", category: "Board", owner: "Sarah Kim", updated: "2026-09-15", status: "ready", formats: ["PDF", "XLSX"], sizeKb: 1560 },
  { id: "R-111", name: "Audit adjustment log", period: "Q3 FY2026", category: "Statutory", owner: "External audit", updated: "2026-09-14", status: "failed", formats: ["XLSX"], sizeKb: 0 },
  { id: "R-112", name: "Cash flow forecast, 13 weeks", period: "Rolling", category: "Management", owner: "Helen Cross", updated: "2026-09-26", status: "ready", formats: ["XLSX", "CSV"], sizeKb: 940 }
];
