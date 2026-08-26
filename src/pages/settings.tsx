import { useState } from "react";
import { useApp } from "@/app-context";
import { Badge, Button, Card, CardHeader } from "@/components/ui/primitives";
import { currencies, entities, org, roleLabels } from "@/data/finance";
import { cn } from "@/lib/format";
import type { CurrencyCode, Role } from "@/types";

const tabs = ["Organisation", "Policy", "Access", "Integrations"] as const;

function Toggle({
  checked,
  onChange,
  label
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn("toggle", checked && "toggle-on")}
    >
      <span className="toggle-knob" />
    </button>
  );
}

export function SettingsPage() {
  const { pushToast, currency, setCurrency } = useApp();
  const [tab, setTab] = useState<(typeof tabs)[number]>("Organisation");

  const [threshold, setThreshold] = useState("5000000");
  const [dualControl, setDualControl] = useState(true);
  const [segregation, setSegregation] = useState(true);
  const [periodLock, setPeriodLock] = useState(true);
  const [autoFx, setAutoFx] = useState(true);

  return (
    <>
      <div className="tabs">
        {tabs.map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            aria-pressed={tab === item}
            className={cn("tab", tab === item && "tab-active")}
          >
            {item}
          </button>
        ))}
      </div>

      {tab === "Organisation" ? (
        <Card>
          <CardHeader title="Organisation" subtitle="Group identity and reporting defaults" />
          <div className="form-grid">
            <label className="field">
              <span>Registered name</span>
              <input defaultValue={org.company} />
            </label>
            <label className="field">
              <span>Fiscal year</span>
              <input defaultValue={org.fiscalYear} />
            </label>
            <label className="field">
              <span>Presentation currency</span>
              <select
                value={currency}
                onChange={(event) => setCurrency(event.target.value as CurrencyCode)}
              >
                {currencies.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.code} — {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Consolidation basis</span>
              <select defaultValue="IFRS">
                <option>IFRS</option>
                <option>US GAAP</option>
                <option>UK GAAP</option>
              </select>
            </label>
          </div>

          <h3 className="subhead">Entities in scope</h3>
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>Entity</th>
                  <th>Region</th>
                  <th>Functional currency</th>
                  <th className="num">Headcount</th>
                </tr>
              </thead>
              <tbody>
                {entities.map((entity) => (
                  <tr key={entity.id}>
                    <td className="strong">{entity.name}</td>
                    <td>{entity.region}</td>
                    <td>
                      <Badge tone="neutral">{entity.currency}</Badge>
                    </td>
                    <td className="num">{entity.headcount.toLocaleString("en-US")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Button
            className="form-submit"
            onClick={() => pushToast("Saved", "Organisation settings updated.")}
          >
            Save changes
          </Button>
        </Card>
      ) : null}

      {tab === "Policy" ? (
        <Card>
          <CardHeader title="Financial controls" subtitle="Approval thresholds and segregation rules" />
          <div className="setting-list">
            <div className="setting-row">
              <div>
                <strong>Controller delegated authority</strong>
                <p>Requests above this amount escalate to the CFO and Board Finance Committee.</p>
              </div>
              <label className="field field-inline">
                <span className="sr-only">Delegated authority threshold</span>
                <input
                  value={threshold}
                  onChange={(event) => setThreshold(event.target.value)}
                  inputMode="numeric"
                />
              </label>
            </div>

            <div className="setting-row">
              <div>
                <strong>Dual control on payments</strong>
                <p>Every outbound payment requires two distinct approvers before release.</p>
              </div>
              <Toggle checked={dualControl} onChange={setDualControl} label="Dual control on payments" />
            </div>

            <div className="setting-row">
              <div>
                <strong>Segregation of duties</strong>
                <p>Block the same person appearing more than once in an approval chain.</p>
              </div>
              <Toggle checked={segregation} onChange={setSegregation} label="Segregation of duties" />
            </div>

            <div className="setting-row">
              <div>
                <strong>Automatic period lock</strong>
                <p>Close each accounting period five working days after month end.</p>
              </div>
              <Toggle checked={periodLock} onChange={setPeriodLock} label="Automatic period lock" />
            </div>

            <div className="setting-row">
              <div>
                <strong>Automatic FX revaluation</strong>
                <p>Revalue foreign currency balances at closing rates each month end.</p>
              </div>
              <Toggle checked={autoFx} onChange={setAutoFx} label="Automatic FX revaluation" />
            </div>
          </div>

          <Button
            className="form-submit"
            onClick={() => pushToast("Policy updated", "Changes written to the audit log.", "warning")}
          >
            Save policy
          </Button>
        </Card>
      ) : null}

      {tab === "Access" ? (
        <Card>
          <CardHeader title="Roles and access" subtitle="What each role can see and do" />
          <div className="role-grid">
            {(Object.keys(roleLabels) as Role[]).map((role) => (
              <div key={role} className="role-card">
                <h3>{roleLabels[role].label}</h3>
                <p>{roleLabels[role].blurb}</p>
                <ul className="role-perms">
                  <li className={role === "admin" ? "yes" : "no"}>Approve expenditure</li>
                  <li className={role === "admin" ? "yes" : "no"}>Edit budgets</li>
                  <li className={role === "admin" || role === "auditor" ? "yes" : "no"}>
                    View audit log
                  </li>
                  <li className="yes">Export reports</li>
                  <li className={role === "admin" ? "yes" : "no"}>Manage users</li>
                </ul>
              </div>
            ))}
          </div>
          <p className="table-note">
            Use the role switcher in the topbar to see how navigation and actions change. In a live
            deployment these map to identity provider groups over SCIM.
          </p>
        </Card>
      ) : null}

      {tab === "Integrations" ? (
        <Card>
          <CardHeader title="Integrations" subtitle="Connected systems of record" />
          <div className="integration-list">
            {(
              [
                ["SAP S/4HANA", "General ledger and sub-ledgers", "Connected", "positive"],
                ["Workday", "Headcount and payroll", "Connected", "positive"],
                ["Coupa", "Procurement and purchase orders", "Connected", "positive"],
                ["Bloomberg", "FX and rate feeds", "Connected", "positive"],
                ["Salesforce", "Revenue pipeline", "Sync delayed", "warning"],
                ["Snowflake", "Reporting warehouse", "Connected", "positive"]
              ] as const
            ).map(([name, blurb, status, tone]) => (
              <div key={name} className="integration-row">
                <div>
                  <strong>{name}</strong>
                  <p>{blurb}</p>
                </div>
                <Badge tone={tone}>{status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </>
  );
}
