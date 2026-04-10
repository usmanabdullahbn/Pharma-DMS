"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Badge, Btn, Card, EmptyState, Field, Grid, Modal, PageHeader, TH_STYLE, TD_STYLE, MONO, TR, ApprovalBanner, LockedBanner } from "@/components/ui";
import type { AppUser, QCRecord, QCTestType } from "@/types";
import { CAN_APPROVE } from "@/types";

interface BatchStub { id: string; batch_no: string; product_name: string; }
interface Props { user: AppUser; records: (QCRecord & { batch?: BatchStub })[]; batches: BatchStub[]; }

const TEST_TYPES: { value: QCTestType; label: string }[] = [
  { value: "in_process",    label: "In-Process Control" },
  { value: "final_release", label: "Final Release" },
  { value: "raw_material",  label: "Raw Material Testing" },
  { value: "stability",     label: "Stability (linked)" },
  { value: "environmental", label: "Environmental Monitoring" },
  { value: "water",         label: "Water Testing" },
];
const TYPE_COLOR: Record<string, string> = {
  in_process: "var(--teal)", final_release: "var(--purple)",
  raw_material: "var(--blue)", stability: "var(--amber)",
  environmental: "var(--muted)", water: "var(--blue)",
};
const BLANK_TEST = () => ({ parameter: "", specification: "", result: "", unit: "", verdict: "pass", method_ref: "" });

export default function QCClient({ user, records: initial, batches }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [sel, setSel] = useState<(QCRecord & { batch?: BatchStub }) | null>(null);
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reviewModal, setReviewModal] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [form, setForm] = useState({ batchId: "", testType: "in_process" as QCTestType, testDate: "", analystName: "", tests: [BLANK_TEST()] });

  const addTest = () => setForm((f) => ({ ...f, tests: [...f.tests, BLANK_TEST()] }));
  const removeTest = (i: number) => setForm((f) => ({ ...f, tests: f.tests.filter((_, x) => x !== i) }));
  const updTest = (i: number, k: string, v: string) =>
    setForm((f) => { const t = [...f.tests]; t[i] = { ...t[i], [k]: v }; return { ...f, tests: t }; });

  const submit = async () => {
    if (!form.batchId || !form.testDate || !form.analystName) { toast.error("Batch, date, and analyst required"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/qc", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, tests: form.tests.filter((t) => t.parameter) }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("QC record submitted");
      setModal(false);
      setForm({ batchId: "", testType: "in_process", testDate: "", analystName: "", tests: [BLANK_TEST()] });
      startTransition(() => router.refresh());
    } catch (e: unknown) { toast.error((e as Error).message ?? "Failed"); }
    finally { setLoading(false); }
  };

  const reviewAction = async (id: string, action: "approve" | "reject") => {
    if (action === "reject" && !comment.trim()) { toast.error("Rejection reason required"); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/qc/${id}/approve`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment, action }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success(action === "approve" ? "QC record approved" : "QC record rejected");
      setReviewModal(null); setComment("");
      startTransition(() => router.refresh());
    } catch (e: unknown) { toast.error((e as Error).message ?? "Failed"); }
    finally { setLoading(false); }
  };

  const canApprove = CAN_APPROVE.includes(user.role);
  const canCreate  = ["qc_lab", "qa_regulatory", "management"].includes(user.role);

  return (
    <div>
      <PageHeader
        title="QC Testing & Analysis"
        subtitle="In-process controls, assays, numerical results and final release testing"
        action={canCreate ? <Btn variant="primary" onClick={() => setModal(true)}>+ New QC Record</Btn> : undefined}
      />

      {initial.length === 0 ? (
        <Card><EmptyState icon="⊕" title="No QC records yet" subtitle="Add in-process or final release test results for each batch." /></Card>
      ) : (
        <Card>
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead><tr>
                <th style={TH_STYLE}>QC No.</th><th style={TH_STYLE}>Type</th><th style={TH_STYLE}>Batch</th>
                <th style={TH_STYLE}>Test Date</th><th style={TH_STYLE}>Analyst</th>
                <th style={TH_STYLE}>Tests</th><th style={TH_STYLE}>Conclusion</th>
                <th style={TH_STYLE}>Status</th>{canApprove && <th style={TH_STYLE}>Action</th>}
              </tr></thead>
              <tbody>
                {initial.map((r) => (
                  <TR key={r.id} onClick={() => setSel(r)} clickable>
                    <td style={{ ...TD_STYLE, ...MONO, color: "var(--blue)" }}>{r.qc_no}</td>
                    <td style={TD_STYLE}><span style={{ fontSize: 10, color: TYPE_COLOR[r.test_type] ?? "var(--muted)" }}>{TEST_TYPES.find((t) => t.value === r.test_type)?.label ?? r.test_type}</span></td>
                    <td style={{ ...TD_STYLE, ...MONO, color: "var(--amber)" }}>{r.batch?.batch_no ?? "—"}</td>
                    <td style={{ ...TD_STYLE, ...MONO }}>{r.test_date}</td>
                    <td style={TD_STYLE}>{r.analyst_name}</td>
                    <td style={{ ...TD_STYLE, ...MONO }}>{r.test_results?.length ?? 0}</td>
                    <td style={TD_STYLE}><Badge value={r.conclusion} /></td>
                    <td style={TD_STYLE}><Badge value={r.status} />{r.is_locked && <LockedBanner />}</td>
                    {canApprove && (
                      <td style={TD_STYLE}>
                        {r.status === "submitted" && (
                          <Btn size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); setReviewModal(r.id); }}>Review</Btn>
                        )}
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
        <Modal title={`QC Record — ${sel.qc_no}`} onClose={() => setSel(null)} width={820}>
          <ApprovalBanner status={sel.status} approvedBy={sel.approved_by} approvedAt={sel.approved_at ?? undefined} comment={sel.approval_comment ?? undefined} />
          <Grid cols={3}>
            {[["QC No.", sel.qc_no], ["Type", TEST_TYPES.find((t) => t.value === sel.test_type)?.label ?? sel.test_type], ["Batch", sel.batch?.batch_no ?? "—"], ["Date", sel.test_date], ["Analyst", sel.analyst_name], ["Supervisor", sel.supervisor_name ?? "Pending"]].map(([k, v]) => (
              <div key={String(k)}><div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 3 }}>{k}</div><div style={{ fontSize: 13 }}>{v}</div></div>
            ))}
          </Grid>
          <div style={{ marginTop: 16, fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8 }}>Test Results</div>
          <table>
            <thead><tr>
              <th style={TH_STYLE}>Parameter</th><th style={TH_STYLE}>Specification</th>
              <th style={TH_STYLE}>Result</th><th style={TH_STYLE}>Unit</th>
              <th style={TH_STYLE}>Method</th><th style={TH_STYLE}>Verdict</th>
            </tr></thead>
            <tbody>
              {(sel.test_results ?? []).map((t, i) => (
                <TR key={i}>
                  <td style={TD_STYLE}>{t.parameter}</td>
                  <td style={{ ...TD_STYLE, color: "var(--muted)" }}>{t.specification}</td>
                  <td style={{ ...TD_STYLE, fontWeight: 700, color: t.verdict === "pass" ? "var(--accent)" : t.verdict === "fail" ? "var(--red)" : "var(--text)" }}>{t.result ?? "—"}</td>
                  <td style={TD_STYLE}>{t.unit ?? "—"}</td>
                  <td style={{ ...TD_STYLE, ...MONO, fontSize: 11 }}>{t.method_ref ?? "—"}</td>
                  <td style={TD_STYLE}><Badge value={t.verdict} /></td>
                </TR>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>Overall Conclusion:</span>
            <Badge value={sel.conclusion} label={sel.conclusion === "pass" ? "✓ COMPLIES WITH SPECIFICATIONS" : "✗ OUT OF SPECIFICATION"} />
          </div>
        </Modal>
      )}

      {reviewModal && (
        <Modal title="Review QC Record" onClose={() => { setReviewModal(null); setComment(""); }}>
          <Field label="Comment (required for rejection)">
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add comment..."
              style={{ width: "100%", padding: "8px 11px", background: "var(--bg)", border: "1px solid var(--border2)", borderRadius: 6, color: "var(--text)", fontSize: 13, minHeight: 80, resize: "vertical", fontFamily: "inherit" }} />
          </Field>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn variant="primary" loading={loading} onClick={() => reviewAction(reviewModal, "approve")}>✓ Approve</Btn>
            <Btn variant="danger" loading={loading} onClick={() => reviewAction(reviewModal, "reject")}>✗ Reject</Btn>
          </div>
        </Modal>
      )}

      {modal && (
        <Modal title="New QC Test Record" onClose={() => setModal(false)} width={820}>
          <Grid cols={4}>
            <Field label="Batch" required>
              <select value={form.batchId} onChange={(e) => setForm((f) => ({ ...f, batchId: e.target.value }))}
                style={{ width: "100%", padding: "8px 11px", background: "var(--bg)", border: "1px solid var(--border2)", borderRadius: 6, color: "var(--text)", fontSize: 13, appearance: "none" }}>
                <option value="">—</option>
                {batches.map((b) => <option key={b.id} value={b.id}>{b.batch_no}</option>)}
              </select>
            </Field>
            <Field label="Test Type" required>
              <select value={form.testType} onChange={(e) => setForm((f) => ({ ...f, testType: e.target.value as QCTestType }))}
                style={{ width: "100%", padding: "8px 11px", background: "var(--bg)", border: "1px solid var(--border2)", borderRadius: 6, color: "var(--text)", fontSize: 13, appearance: "none" }}>
                {TEST_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </Field>
            <Field label="Test Date" required>
              <input type="date" value={form.testDate} onChange={(e) => setForm((f) => ({ ...f, testDate: e.target.value }))}
                style={{ width: "100%", padding: "8px 11px", background: "var(--bg)", border: "1px solid var(--border2)", borderRadius: 6, color: "var(--text)", fontSize: 13 }} />
            </Field>
            <Field label="Analyst" required>
              <input value={form.analystName} onChange={(e) => setForm((f) => ({ ...f, analystName: e.target.value }))} placeholder="Full name"
                style={{ width: "100%", padding: "8px 11px", background: "var(--bg)", border: "1px solid var(--border2)", borderRadius: 6, color: "var(--text)", fontSize: 13 }} />
            </Field>
          </Grid>

          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>Test Parameters & Results</div>
          {form.tests.map((t, i) => (
            <div key={i} style={{ background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)", borderRadius: 6, padding: 10, marginBottom: 8 }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 2fr 1fr 1.5fr 1fr auto", gap: 8, alignItems: "end" }}>
                <Field label={i === 0 ? "Parameter" : ""}><input value={t.parameter} onChange={(e) => updTest(i, "parameter", e.target.value)} placeholder="e.g. pH, Assay%..."
                  style={{ width: "100%", padding: "8px 11px", background: "var(--bg)", border: "1px solid var(--border2)", borderRadius: 6, color: "var(--text)", fontSize: 13 }} /></Field>
                <Field label={i === 0 ? "Specification" : ""}><input value={t.specification} onChange={(e) => updTest(i, "specification", e.target.value)} placeholder="e.g. 6.5 – 7.5"
                  style={{ width: "100%", padding: "8px 11px", background: "var(--bg)", border: "1px solid var(--border2)", borderRadius: 6, color: "var(--text)", fontSize: 13 }} /></Field>
                <Field label={i === 0 ? "Result" : ""}><input value={t.result} onChange={(e) => updTest(i, "result", e.target.value)} placeholder="Actual result"
                  style={{ width: "100%", padding: "8px 11px", background: "var(--bg)", border: "1px solid var(--border2)", borderRadius: 6, color: "var(--text)", fontSize: 13 }} /></Field>
                <Field label={i === 0 ? "Unit" : ""}><input value={t.unit} onChange={(e) => updTest(i, "unit", e.target.value)} placeholder="%"
                  style={{ width: "100%", padding: "8px 11px", background: "var(--bg)", border: "1px solid var(--border2)", borderRadius: 6, color: "var(--text)", fontSize: 13 }} /></Field>
                <Field label={i === 0 ? "Method Ref." : ""}><input value={t.method_ref} onChange={(e) => updTest(i, "method_ref", e.target.value)} placeholder="BP 2024 / Ph.Eur."
                  style={{ width: "100%", padding: "8px 11px", background: "var(--bg)", border: "1px solid var(--border2)", borderRadius: 6, color: "var(--text)", fontSize: 13 }} /></Field>
                <Field label={i === 0 ? "Verdict" : ""}>
                  <select value={t.verdict} onChange={(e) => updTest(i, "verdict", e.target.value)}
                    style={{ width: "100%", padding: "8px 11px", background: "var(--bg)", border: "1px solid var(--border2)", borderRadius: 6, color: t.verdict === "pass" ? "var(--accent)" : t.verdict === "fail" ? "var(--red)" : "var(--text)", fontSize: 13, appearance: "none" }}>
                    <option value="pass">Pass</option><option value="fail">Fail</option><option value="pending">Pending</option><option value="na">N/A</option>
                  </select>
                </Field>
                <div style={{ paddingBottom: 14 }}>
                  {i > 0 && <button onClick={() => removeTest(i)} style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: 5, color: "var(--red)", cursor: "pointer", padding: "7px 9px", fontSize: 12 }}>✕</button>}
                </div>
              </div>
            </div>
          ))}
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <Btn variant="blue" onClick={addTest}>+ Add Test</Btn>
            <Btn variant="primary" loading={loading} onClick={submit}>Submit QC Record</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
