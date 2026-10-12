import { useMemo, useState } from "react";
import { Check, CircleDot, Lock, ShieldAlert, X } from "lucide-react";
import { useApp } from "@/app-context";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  Modal,
} from "@/components/ui/primitives";
import { departmentMap } from "@/data/finance";
import { cn, nativeMoney, shortDate } from "@/lib/format";
import type { Approval, ApprovalPriority, ApprovalStatus } from "@/types";

const priorityTone: Record<
  ApprovalPriority,
  "neutral" | "warning" | "critical"
> = {
  standard: "neutral",
  elevated: "warning",
  critical: "critical",
};

const statusTone: Record<ApprovalStatus, "info" | "positive" | "critical"> = {
  pending: "info",
  approved: "positive",
  rejected: "critical",
};

export function ApprovalsPage() {
  const { approvals, decide, canApprove } = useApp();
  const [filter, setFilter] = useState<ApprovalStatus | "all">("pending");
  const [selected, setSelected] = useState<Approval | null>(null);

  const rows = useMemo(
    () =>
      approvals.filter(
        (approval) => filter === "all" || approval.status === filter,
      ),
    [approvals, filter],
  );

  const counts = useMemo(
    () => ({
      pending: approvals.filter((a) => a.status === "pending").length,
      approved: approvals.filter((a) => a.status === "approved").length,
      rejected: approvals.filter((a) => a.status === "rejected").length,
    }),
    [approvals],
  );

  function act(approval: Approval, status: ApprovalStatus) {
    decide(approval.id, status);
    setSelected(null);
  }

  return (
    <>
      <div className="stat-grid stat-grid-4">
        {[
          ["Awaiting your sign-off", String(counts.pending)],
          ["Approved this quarter", String(counts.approved)],
          ["Rejected this quarter", String(counts.rejected)],
          ["Median time to decision", "1.8 days"],
        ].map(([label, value]) => (
          <div key={label} className="stat-card stat-card-plain">
            <p className="stat-label">{label}</p>
            <p className="stat-value stat-value-sm">{value}</p>
          </div>
        ))}
      </div>

      {!canApprove ? (
        <div className="notice notice-warning">
          <Lock size={16} />
          <p>
            Your current role is read-only for approvals. Sign in to your
            authorised account from the workspace to sign off requests.
          </p>
        </div>
      ) : null}

      <Card>
        <CardHeader
          title="Approval workflow"
          subtitle="Requests routed to Group Finance under the delegated authority matrix"
          action={
            <div className="segmented">
              {(
                [
                  ["pending", "Pending"],
                  ["approved", "Approved"],
                  ["rejected", "Rejected"],
                  ["all", "All"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setFilter(id)}
                  aria-pressed={filter === id}
                  className={cn(
                    "segmented-item",
                    filter === id && "segmented-item-active",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          }
        />

        {rows.length === 0 ? (
          <EmptyState
            title="Nothing in this queue"
            body="There are no requests with this status for the current period."
            action={
              <Button variant="secondary" onClick={() => setFilter("all")}>
                Show all requests
              </Button>
            }
          />
        ) : (
          <div className="approval-list">
            {rows.map((approval) => {
              const department = departmentMap[approval.departmentId];
              const signed = approval.chain.filter(
                (link) => link.state === "signed",
              ).length;

              return (
                <article key={approval.id} className="approval">
                  <div className="approval-head">
                    <div className="approval-title">
                      <span className="approval-id">{approval.id}</span>
                      <h3>{approval.title}</h3>
                      <p>{approval.description}</p>
                    </div>
                    <div className="approval-amount">
                      <strong>
                        {nativeMoney(approval.amount, approval.currency)}
                      </strong>
                      <span>{approval.currency}</span>
                    </div>
                  </div>

                  <div className="approval-meta">
                    <Badge tone={statusTone[approval.status]}>
                      {approval.status}
                    </Badge>
                    <Badge tone={priorityTone[approval.priority]}>
                      {approval.priority}
                    </Badge>
                    <span>{department?.name}</span>
                    <span>Raised by {approval.requester}</span>
                    <span>{shortDate(approval.submitted)}</span>
                  </div>

                  {/* Sign-off chain: signed steps are solid, the current step pulses. */}
                  <ol className="chain" aria-label="Approval chain">
                    {approval.chain.map((link, index) => (
                      <li
                        key={`${approval.id}-${index}`}
                        className={cn("chain-step", `chain-${link.state}`)}
                      >
                        <span className="chain-dot">
                          {link.state === "signed" ? (
                            <Check size={11} />
                          ) : (
                            <CircleDot size={11} />
                          )}
                        </span>
                        <span className="chain-text">
                          <strong>{link.role}</strong>
                          <small>{link.name}</small>
                        </span>
                      </li>
                    ))}
                  </ol>

                  <div className="approval-foot">
                    <p className="approval-policy">
                      <ShieldAlert size={14} />
                      {approval.policy}
                    </p>
                    <div className="approval-actions">
                      <span className="chain-progress">
                        {signed} of {approval.chain.length} signed
                      </span>
                      <Button
                        variant="ghost"
                        onClick={() => setSelected(approval)}
                      >
                        Details
                      </Button>
                      {approval.status === "pending" && canApprove ? (
                        <>
                          <Button
                            variant="danger"
                            onClick={() => act(approval, "rejected")}
                          >
                            <X size={15} /> Reject
                          </Button>
                          <Button onClick={() => act(approval, "approved")}>
                            <Check size={15} /> Approve
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </Card>

      <Modal
        open={Boolean(selected)}
        title={selected ? `${selected.id} · ${selected.title}` : ""}
        subtitle={
          selected ? departmentMap[selected.departmentId]?.name : undefined
        }
        onClose={() => setSelected(null)}
        footer={
          selected && selected.status === "pending" && canApprove ? (
            <>
              <Button
                variant="danger"
                onClick={() => act(selected, "rejected")}
              >
                Reject request
              </Button>
              <Button onClick={() => act(selected, "approved")}>
                Approve request
              </Button>
            </>
          ) : (
            <Button variant="secondary" onClick={() => setSelected(null)}>
              Close
            </Button>
          )
        }
      >
        {selected ? (
          <div className="detail-grid">
            <p className="detail-lead">{selected.description}</p>

            <dl className="detail-list">
              <div>
                <dt>Amount</dt>
                <dd>{nativeMoney(selected.amount, selected.currency)}</dd>
              </div>
              <div>
                <dt>Currency</dt>
                <dd>{selected.currency}</dd>
              </div>
              <div>
                <dt>Requester</dt>
                <dd>{selected.requester}</dd>
              </div>
              <div>
                <dt>Submitted</dt>
                <dd>{shortDate(selected.submitted)}</dd>
              </div>
              <div>
                <dt>Priority</dt>
                <dd className="capitalise">{selected.priority}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd className="capitalise">{selected.status}</dd>
              </div>
            </dl>

            <div className="detail-policy">
              <ShieldAlert size={15} />
              <p>{selected.policy}</p>
            </div>

            <ol className="chain chain-vertical">
              {selected.chain.map((link, index) => (
                <li
                  key={index}
                  className={cn("chain-step", `chain-${link.state}`)}
                >
                  <span className="chain-dot">
                    {link.state === "signed" ? (
                      <Check size={11} />
                    ) : (
                      <CircleDot size={11} />
                    )}
                  </span>
                  <span className="chain-text">
                    <strong>{link.role}</strong>
                    <small>
                      {link.name} · {link.state}
                    </small>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
