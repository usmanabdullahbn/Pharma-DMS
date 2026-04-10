"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Badge, Btn, Card, EmptyState, Field, Grid, Modal, PageHeader, TH_STYLE, TD_STYLE, MONO, TR, ApprovalBanner, LockedBanner } from "@/components/ui";
import type { AppUser, BMR } from "@/types";
import { CAN_APPROVE } from "@/types";

interface BatchStub { id: string; batch_no: string; product_name: string; }

const BMR_SECTION_TITLES = [
  "1. Batch Identification & Traceability",
  "2. Formula & Theoretical Composition",
  "3. Equipment, Utensils & Cleaning Records",
  "4. Manufacturing Procedure (Step-by-step)",
  "5. In-Process Controls & Checkpoints",
  "6. Environmental Monitoring Data",
  "7. Yield Calculation & Reconciliation",
  "8. Deviation Log",
  "9. Packaging & Labelling Instructions",
  "10. Authorised Signatures & Sign-offs",
];

interface BMRProps { user: AppUser; records: (BMR & { batch?: BatchStub })[]; batches: BatchStub[]; }

export function BMRClient({ user, records: initial, batches }: BMRProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [sel, setSel] = useState<(BMR & { batch?: BatchStub }) | null>(null);
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reviewModal, setReviewModal] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [form, setForm] = useState({ batchId: "", version: "v1.0", formulaRef: "" });

  const submit = async () => {
    if (!form.batchId) { toast.error("Batch is required"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/bmr", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("BMR created as draft");
      setModal(false); setForm({ batchId: "", version: "v1.0", formulaRef: "" });
      startTransition(() => router.refresh());
    } catch (e: unknown) { toast.error((e as Error).message ?? "Failed"); }
    finally { setLoading(false); }
  };

  const reviewAction = async (id: string, action: "approve" | "reject") => {
    if (action === "reject" && !comment.trim()) { toast.error("Rejection reason required"); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/bmr/${id}/approve`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ comment, action }) });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success(action === "approve" ? "BMR approved" : "BMR rejected");
      setReviewModal(null); setComment(""); startTransition(() => router.refresh());
    } catch (e: unknown) { toast.error((e as Error).message ?? "Failed"); }
    finally { setLoading(false); }
  };

  const canApprove = CAN_APPROVE.includes(user.role);
  const canCreate  = ["production", "qa_regulatory", "management"].includes(user.role);

  return (
    <div>
      <PageHeader title="Batch Manufacturing Records" subtitle="Master & executed BMRs — GMP/DRAP compliant" action={canCreate ? <Btn variant="primary" onClick={() => setModal(true)}>+ Create BMR</Btn> : undefined} />
      {initial.length === 0 ? (
        <Card><EmptyState icon="≡" title="No BMRs yet" subtitle="Create a BMR for each batch before production begins." /></Card>
      ) : (
        <Card>
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead><tr>
                <th style={TH_STYLE}>BMR No.</th><th style={TH_STYLE}>Batch</th><th style={TH_STYLE}>Product</th>
                <th style={TH_STYLE}>Version</th><th style={TH_STYLE}>Formula Ref.</th>
                <th style={TH_STYLE}>Date</th><th style={TH_STYLE}>Status</th>
                <th style={TH_STYLE}>Approved By</th>{canApprove && <th style={TH_STYLE}>Action</th>}
              </tr></thead>
              <tbody>
                {initial.map((r) => (
                  <TR key={r.id} onClick={() => setSel(r)} clickable>
                    <td style={{ ...TD_STYLE, ...MONO, color: "var(--blue)" }}>{r.bmr_no}</td>
                    <td style={{ ...TD_STYLE, ...MONO, color: "var(--amber)" }}>{r.batch?.batch_no ?? "—"}</td>
                    <td style={TD_STYLE}>{r.batch?.product_name ?? "—"}</td>
                    <td style={{ ...TD_STYLE, ...MONO }}>{r.version}</td>
                    <td style={{ ...TD_STYLE, ...MONO }}>{r.formula_ref ?? "—"}</td>
                    <td style={{ ...TD_STYLE, ...MONO }}>{new Date(r.created_at).toLocaleDateString()}</td>
                    <td style={TD_STYLE}><Badge value={r.status} />{r.is_locked && <LockedBanner />}</td>
                    <td style={TD_STYLE}>{r.approved_by ?? <span style={{ color: "var(--muted)" }}>—</span>}</td>
                    {canApprove && (
                      <td style={TD_STYLE}>
                        {["draft","under_review"].includes(r.status) && <Btn size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); setReviewModal(r.id); }}>Review</Btn>}
                      </td>
                    )}
                  </TR>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {sel && (
        <Modal title={`BMR — ${sel.bmr_no}`} onClose={() => setSel(null)}>
          <ApprovalBanner status={sel.status} approvedBy={sel.approved_by} approvedAt={sel.approved_at ?? undefined} comment={sel.approval_comment ?? undefined} />
          <Grid cols={3}>
            {[["BMR No.", sel.bmr_no], ["Batch", sel.batch?.batch_no ?? "—"], ["Version", sel.version], ["Formula Ref.", sel.formula_ref ?? "—"], ["Status", <Badge key="s" value={sel.status} />], ["Locked", sel.is_locked ? "Yes 🔒" : "No"]].map(([k, v]) => (
              <div key={String(k)}><div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 3 }}>{k}</div><div style={{ fontSize: 13 }}>{v}</div></div>
            ))}
          </Grid>
          <div style={{ marginTop: 16, fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8 }}>Execution Checklist</div>
          {(sel.sections?.length ? sel.sections : BMR_SECTION_TITLES.map((t, i) => ({ section_title: t, is_completed: sel.status === "approved", sort_order: i }))).sort((a: Record<string,unknown>, b: Record<string,unknown>) => (a.sort_order as number) - (b.sort_order as number)).map((sec: Record<string,unknown>, i: number) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 5, background: "#0a1220", border: "1px solid var(--border)", marginBottom: 4 }}>
              <span style={{ color: sec.is_completed ? "var(--accent)" : "var(--border2)", fontSize: 14, width: 16, flexShrink: 0 }}>{sec.is_completed ? "✓" : "○"}</span>
              <span style={{ fontSize: 13, color: sec.is_completed ? "var(--text)" : "var(--muted)" }}>{sec.section_title as string}</span>
              {sec.is_completed && <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--muted)" }}>Completed</span>}
            </div>
          ))}
        </Modal>
      )}

      {reviewModal && (
        <Modal title="Review BMR" onClose={() => { setReviewModal(null); setComment(""); }}>
          <Field label="Comment (required for rejection)">
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Enter comment..."
              style={{ width: "100%", padding: "8px 11px", background: "var(--bg)", border: "1px solid var(--border2)", borderRadius: 6, color: "var(--text)", fontSize: 13, minHeight: 80, resize: "vertical", fontFamily: "inherit" }} />
          </Field>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn variant="primary" loading={loading} onClick={() => reviewAction(reviewModal, "approve")}>✓ Approve BMR</Btn>
            <Btn variant="danger" loading={loading} onClick={() => reviewAction(reviewModal, "reject")}>✗ Reject</Btn>
          </div>
        </Modal>
      )}

      {modal && (
        <Modal title="Create BMR" onClose={() => setModal(false)}>
          <Grid cols={3}>
            <Field label="Batch" required>
              <select value={form.batchId} onChange={(e) => setForm((f) => ({ ...f, batchId: e.target.value }))}
                style={{ width: "100%", padding: "8px 11px", background: "var(--bg)", border: "1px solid var(--border2)", borderRadius: 6, color: "var(--text)", fontSize: 13, appearance: "none" }}>
                <option value="">—</option>{batches.map((b) => <option key={b.id} value={b.id}>{b.batch_no} · {b.product_name}</option>)}
              </select>
            </Field>
            <Field label="Version"><input value={form.version} onChange={(e) => setForm((f) => ({ ...f, version: e.target.value }))} placeholder="v1.0"
              style={{ width: "100%", padding: "8px 11px", background: "var(--bg)", border: "1px solid var(--border2)", borderRadius: 6, color: "var(--text)", fontSize: 13 }} /></Field>
            <Field label="Formula Reference"><input value={form.formulaRef} onChange={(e) => setForm((f) => ({ ...f, formulaRef: e.target.value }))} placeholder="FOR-XXX-2024"
              style={{ width: "100%", padding: "8px 11px", background: "var(--bg)", border: "1px solid var(--border2)", borderRadius: 6, color: "var(--text)", fontSize: 13 }} /></Field>
          </Grid>
          <Btn variant="primary" loading={loading} onClick={submit}>Create BMR (Draft)</Btn>
        </Modal>
      )}
    </div>
  );
}
