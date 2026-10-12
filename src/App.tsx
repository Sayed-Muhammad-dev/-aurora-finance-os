import { motion, useReducedMotion } from "framer-motion";
import { AppProvider, useApp } from "@/app-context";
import { Sidebar, Toaster, Topbar } from "@/components/shell/shell";
import { OverviewPage } from "@/pages/overview";
import { DepartmentsPage } from "@/pages/departments";
import { ApprovalsPage } from "@/pages/approvals";
import { AuditPage } from "@/pages/audit";
import { ReportsPage } from "@/pages/reports";
import { SettingsPage } from "@/pages/settings";
import { org } from "@/data/finance";
import type { PageId } from "@/types";

const pageMeta: Record<PageId, { title: string; subtitle: string }> = {
  overview: {
    title: "Group overview",
    subtitle: `${org.fiscalYear} · ${org.period}`,
  },
  departments: {
    title: "Departments",
    subtitle: "Revenue, expense and budget variance by cost centre",
  },
  approvals: {
    title: "Approvals",
    subtitle:
      "Expenditure requests routed under the delegated authority matrix",
  },
  audit: {
    title: "Audit log",
    subtitle: "Append-only record of every privileged action",
  },
  reports: {
    title: "Reports",
    subtitle: "Statutory, management, tax and board reporting",
  },
  settings: {
    title: "Settings",
    subtitle: "Organisation, financial controls, access and integrations",
  },
};

function Workspace() {
  const reduced = useReducedMotion();
  const { page } = useApp();
  const meta = pageMeta[page];

  return (
    <div className="shell">
      <Sidebar />
      <div className="workspace">
        <Topbar title={meta.title} subtitle={meta.subtitle} />
        <main className="content">
          <div className="notice">
            <a href="/workspace">Manage saved finance records and access →</a>
          </div>
          <motion.div
            key={page}
            initial={{ y: reduced ? 0 : 6 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {page === "overview" ? <OverviewPage /> : null}
            {page === "departments" ? <DepartmentsPage /> : null}
            {page === "approvals" ? <ApprovalsPage /> : null}
            {page === "audit" ? <AuditPage /> : null}
            {page === "reports" ? <ReportsPage /> : null}
            {page === "settings" ? <SettingsPage /> : null}
          </motion.div>
        </main>
      </div>
      <Toaster />
    </div>
  );
}

export function App() {
  return (
    <AppProvider>
      <Workspace />
    </AppProvider>
  );
}
