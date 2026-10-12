import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  departments,
  departmentMap,
  auditEvents,
  approvals as seedApprovals,
} from "@/data/finance";
import type {
  Approval,
  ApprovalStatus,
  CurrencyCode,
  PageId,
  Role,
  Theme,
} from "@/types";

interface Toast {
  id: number;
  title: string;
  body: string;
  tone: "success" | "info" | "warning";
}

interface AppValue {
  page: PageId;
  setPage: (page: PageId) => void;

  role: Role;
  setRole: (role: Role) => void;
  /** Roles other than admin cannot approve, edit budgets or manage users. */
  canApprove: boolean;
  canEdit: boolean;

  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;

  theme: Theme;
  toggleTheme: () => void;

  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  approvals: Approval[];
  decide: (id: string, status: ApprovalStatus) => void;

  toasts: Toast[];
  pushToast: (title: string, body: string, tone?: Toast["tone"]) => void;
  dismissToast: (id: number) => void;
}

const AppContext = createContext<AppValue | undefined>(undefined);
const THEME_KEY = "aurora-theme";

export function AppProvider({ children }: { children: ReactNode }) {
  const [dataRevision, setDataRevision] = useState(0);
  const [authenticated, setAuthenticated] = useState(false);
  useEffect(() => {
    fetch("/api/app/state")
      .then(async (response) => {
        if (!response.ok) return;
        const data = await response.json();
        setAuthenticated(true);
        departments.splice(
          0,
          departments.length,
          ...data.collections.departments,
        );
        for (const key of Object.keys(departmentMap)) delete departmentMap[key];
        departments.forEach((d) => {
          departmentMap[d.id] = d;
        });
        auditEvents.splice(
          0,
          auditEvents.length,
          ...data.audit.map(
            (x: {
              id: string;
              at: string;
              actor: string;
              action: string;
              target: string;
            }) => ({
              id: x.id,
              timestamp: x.at,
              actor: x.actor,
              actorRole: "Account",
              action: x.action,
              target: x.target,
              severity: "info" as const,
              ip: "Server",
              detail: "Persisted application activity",
            }),
          ),
        );
        setDataRevision((v) => v + 1);
        setApprovals(data.collections.approvals);
        setRoleState(
          ["owner", "finance", "editor"].includes(data.user.role)
            ? "admin"
            : data.user.role === "auditor"
              ? "auditor"
              : "analyst",
        );
      })
      .catch(() => {});
  }, []);
  const [page, setPage] = useState<PageId>("overview");
  const [role, setRoleState] = useState<Role>("analyst");
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [theme, setTheme] = useState<Theme>("light");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [approvals, setApprovals] = useState(seedApprovals);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    let stored: Theme | null = null;
    try {
      stored = window.localStorage.getItem(THEME_KEY) as Theme | null;
    } catch {
      // Storage blocked; fall back to the default theme.
    }
    const next = stored ?? "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", next);
      try {
        window.localStorage.setItem(THEME_KEY, next);
      } catch {
        // Ignore storage failures.
      }
      return next;
    });
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    (title: string, body: string, tone: Toast["tone"] = "success") => {
      const id = Date.now() + Math.floor(Math.random() * 1000);
      setToasts((current) => [...current, { id, title, body, tone }]);
      window.setTimeout(() => dismissToast(id), 3600);
    },
    [dismissToast],
  );

  /** Switching role can strip access to the current page, so fall back to overview. */
  const setRole = useCallback(
    (next: Role) => {
      if (authenticated) return;
      setRoleState(next);
      setPage((current) => {
        if (
          next === "auditor" &&
          !["overview", "audit", "reports"].includes(current)
        ) {
          return "overview";
        }
        if (next === "analyst" && current === "settings") return "overview";
        if (next === "analyst" && current === "audit") return "overview";
        return current;
      });
    },
    [authenticated],
  );

  const decide = useCallback(
    (id: string, status: ApprovalStatus) => {
      if (!authenticated) {
        window.location.assign("/workspace");
        return;
      }
      const row = approvals.find((x) => x.id === id) as
        (Approval & { _id: string; _version: number }) | undefined;
      if (!row) return;
      fetch("/api/app/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "approvals",
          id: row._id,
          version: row._version,
          status,
        }),
      })
        .then(async (response) => {
          const result = await response.json();
          if (!response.ok) throw new Error(result.error);
          const next = await fetch("/api/app/state").then((r) => r.json());
          setApprovals(next.collections.approvals);
          auditEvents.splice(
            0,
            auditEvents.length,
            ...next.audit.map(
              (event: {
                id: string;
                at: string;
                actor: string;
                action: string;
                target: string;
              }) => ({
                id: event.id,
                timestamp: event.at,
                actor: event.actor,
                actorRole: "Account",
                action: event.action,
                target: event.target,
                severity: "info" as const,
                ip: "Server",
                detail: "Persisted application activity",
              }),
            ),
          );
          setDataRevision((value) => value + 1);
          pushToast(
            "Decision saved",
            "The server recorded this decision and its audit event.",
          );
        })
        .catch((error) =>
          pushToast("Could not record decision", error.message, "warning"),
        );
    },
    [pushToast, authenticated, approvals],
  );

  const value = useMemo<AppValue>(
    () => ({
      page,
      setPage,
      role,
      setRole,
      canApprove: authenticated && role === "admin",
      canEdit: authenticated && role === "admin",
      currency,
      setCurrency,
      theme,
      toggleTheme,
      sidebarOpen,
      setSidebarOpen,
      approvals,
      decide,
      toasts,
      pushToast,
      dismissToast,
    }),
    [
      page,
      authenticated,
      role,
      setRole,
      currency,
      theme,
      toggleTheme,
      sidebarOpen,
      approvals,
      decide,
      toasts,
      pushToast,
      dismissToast,
    ],
  );

  return (
    <AppContext.Provider value={value}>
      <div key={dataRevision}>{children}</div>
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside AppProvider");
  return context;
}
