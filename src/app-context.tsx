import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { approvals as seedApprovals } from "@/data/finance";
import type { Approval, ApprovalStatus, CurrencyCode, PageId, Role, Theme } from "@/types";

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
  const [page, setPage] = useState<PageId>("overview");
  const [role, setRoleState] = useState<Role>("admin");
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
    [dismissToast]
  );

  /** Switching role can strip access to the current page, so fall back to overview. */
  const setRole = useCallback((next: Role) => {
    setRoleState(next);
    setPage((current) => {
      if (next === "auditor" && !["overview", "audit", "reports"].includes(current)) {
        return "overview";
      }
      if (next === "analyst" && current === "settings") return "overview";
      if (next === "analyst" && current === "audit") return "overview";
      return current;
    });
  }, []);

  const decide = useCallback(
    (id: string, status: ApprovalStatus) => {
      setApprovals((current) =>
        current.map((approval) =>
          approval.id === id
            ? {
                ...approval,
                status,
                chain: approval.chain.map((link) =>
                  link.state === "waiting"
                    ? { ...link, state: status === "approved" ? "signed" : "blocked" }
                    : link
                )
              }
            : approval
        )
      );
      pushToast(
        status === "approved" ? "Request approved" : "Request rejected",
        `${id} recorded against your delegated authority and written to the audit log.`,
        status === "approved" ? "success" : "warning"
      );
    },
    [pushToast]
  );

  const value = useMemo<AppValue>(
    () => ({
      page,
      setPage,
      role,
      setRole,
      canApprove: role === "admin",
      canEdit: role === "admin",
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
      dismissToast
    }),
    [
      page,
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
      dismissToast
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside AppProvider");
  return context;
}
