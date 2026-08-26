import { useEffect } from "react";
import {
  BadgeCheck,
  BarChart3,
  Building2,
  ClipboardCheck,
  FileText,
  Menu,
  MoonStar,
  ScrollText,
  Settings,
  SunMedium,
  X,
  type LucideIcon
} from "lucide-react";
import { useApp } from "@/app-context";
import { currencies, navItems, org, roleLabels } from "@/data/finance";
import { cn } from "@/lib/format";
import type { CurrencyCode, PageId, Role } from "@/types";

const pageIcons: Record<PageId, LucideIcon> = {
  overview: BarChart3,
  departments: Building2,
  approvals: ClipboardCheck,
  audit: ScrollText,
  reports: FileText,
  settings: Settings
};

export function Sidebar() {
  const { page, setPage, role, sidebarOpen, setSidebarOpen } = useApp();
  const visible = navItems.filter((item) => item.roles.includes(role));

  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sidebarOpen, setSidebarOpen]);

  return (
    <>
      {sidebarOpen ? (
        <button className="scrim" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />
      ) : null}

      <aside className={cn("sidebar", sidebarOpen && "sidebar-open")}>
        <div className="sidebar-head">
          <div className="brand">
            <span className="brand-mark">AF</span>
            <span>
              <strong>{org.name}</strong>
              <small>{org.company}</small>
            </span>
          </div>
          <button
            className="icon-btn sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="Primary">
          <p className="nav-group-label">Workspace</p>
          {visible.map((item) => {
            const Icon = pageIcons[item.id];
            const active = page === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setPage(item.id);
                  setSidebarOpen(false);
                }}
                aria-current={active ? "page" : undefined}
                className={cn("nav-item", active && "nav-item-active")}
              >
                <Icon size={17} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-foot">
          <div className="role-note">
            <BadgeCheck size={15} />
            <div>
              <strong>{roleLabels[role].label}</strong>
              <p>{roleLabels[role].blurb}</p>
            </div>
          </div>
          <div className="user-chip">
            <span className="avatar">{org.user.initials}</span>
            <span>
              <strong>{org.user.name}</strong>
              <small>{org.user.title}</small>
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}

export function Topbar({ title, subtitle }: { title: string; subtitle: string }) {
  const { role, setRole, currency, setCurrency, theme, toggleTheme, setSidebarOpen } = useApp();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="icon-btn topbar-menu"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open navigation"
        >
          <Menu size={18} />
        </button>
        <div className="topbar-title">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="topbar-right">
        {/* Role switcher — a demo affordance, so the RBAC behaviour is visible. */}
        <div className="segmented" role="group" aria-label="Demo role">
          {(Object.keys(roleLabels) as Role[]).map((option) => (
            <button
              key={option}
              onClick={() => setRole(option)}
              aria-pressed={role === option}
              className={cn("segmented-item", role === option && "segmented-item-active")}
            >
              {roleLabels[option].label}
            </button>
          ))}
        </div>

        <label className="select-wrap">
          <span className="sr-only">Display currency</span>
          <select
            value={currency}
            onChange={(event) => setCurrency(event.target.value as CurrencyCode)}
            className="select"
          >
            {currencies.map((item) => (
              <option key={item.code} value={item.code}>
                {item.code}
              </option>
            ))}
          </select>
        </label>

        <button
          className="icon-btn"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
        >
          {theme === "light" ? <MoonStar size={18} /> : <SunMedium size={18} />}
        </button>
      </div>
    </header>
  );
}

export function Toaster() {
  const { toasts, dismissToast } = useApp();

  return (
    <div className="toaster" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={cn("toast", `toast-${toast.tone}`)}>
          <div>
            <strong>{toast.title}</strong>
            <p>{toast.body}</p>
          </div>
          <button className="icon-btn" onClick={() => dismissToast(toast.id)} aria-label="Dismiss">
            <X size={15} />
          </button>
        </div>
      ))}
    </div>
  );
}
