export type Theme = "light" | "dark";

/** Demo roles. The switcher in the topbar changes what navigation and actions appear. */
export type Role = "admin" | "analyst" | "auditor";

export type CurrencyCode = "USD" | "EUR" | "GBP" | "JPY" | "SGD";

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  label: string;
  /** Units of this currency per 1 USD. */
  rateFromUsd: number;
}

export interface Entity {
  id: string;
  name: string;
  region: string;
  currency: CurrencyCode;
  headcount: number;
}

export interface Department {
  id: string;
  name: string;
  entityId: string;
  owner: string;
  /** All figures stored in USD; converted for display. */
  revenue: number;
  expense: number;
  budget: number;
  headcount: number;
}

export interface MonthlyPoint {
  month: string;
  revenue: number;
  expense: number;
}

export type ApprovalStatus = "pending" | "approved" | "rejected";
export type ApprovalPriority = "standard" | "elevated" | "critical";

export interface Approval {
  id: string;
  title: string;
  description: string;
  requester: string;
  departmentId: string;
  amount: number;
  currency: CurrencyCode;
  submitted: string;
  status: ApprovalStatus;
  priority: ApprovalPriority;
  /** Sequential sign-off chain; index 0 is the first approver. */
  chain: Array<{ role: string; name: string; state: "signed" | "waiting" | "blocked" }>;
  policy: string;
}

export type AuditSeverity = "info" | "notice" | "warning" | "critical";

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  action: string;
  target: string;
  severity: AuditSeverity;
  ip: string;
  detail: string;
}

export type ReportStatus = "ready" | "generating" | "scheduled" | "failed";

export interface Report {
  id: string;
  name: string;
  period: string;
  category: "Statutory" | "Management" | "Tax" | "Board" | "Compliance";
  owner: string;
  updated: string;
  status: ReportStatus;
  formats: string[];
  sizeKb: number;
}

export interface NavItem {
  id: PageId;
  label: string;
  /** Roles allowed to see this item. */
  roles: Role[];
}

export type PageId =
  | "overview"
  | "departments"
  | "approvals"
  | "audit"
  | "reports"
  | "settings";
