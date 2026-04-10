"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Badge, Btn, Card, EmptyState, Field, Grid, Modal,
  PageHeader, TH_STYLE, TD_STYLE, MONO, TR, ApprovalBanner, LockedBanner,
} from "@/components/ui";
import type { AppUser, DispensingRecord } from "@/types";
import { CAN_APPROVE } from "@/types";

interface BatchStub { id: string; batch_no: string; product_name: string; }

interface Props {
  user: AppUser;
  records: (DispensingRecord & { batch?: BatchStub })[];
  batches: BatchStub[];
}

const BLANK_ITEM = () => ({ material_name: "", required_qty: "", dispensed_qty: "", unit: "kg", deviation_acceptable: true, deviation_justification: "" });

export default function DispensingClient({ user, records: initial, batches }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [sel, setSel] = useState<(DispensingRecord & { batch?: BatchStub }) | null>(null);
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reviewModal, setReviewModal] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [form, setForm] = useState({ batchId: "", date: "", dispensedBy: "", items: [BLANK_ITEM()] });

  const addItem = () => setForm((f) => ({ ...f, items: [...f.items, BLANK_ITEM()] }));
  const removeItem = (i: number) => setForm((f) => ({ ...f, items: f.items.filter((_, x) => x !== i) }));
  const updItem = (i: number, k: string, v: string | boolean) =>
    setForm((f) => { const it = [...f.items]; it[i] = { ...it[i], [k]: v }; return { ...f, items: it }; });

  const submit = async () => {
    if (!form.batchId || !form.date || !form.dispensedBy) { toast.error("Batch, date and operator are required"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/dispensing", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchId: form.batchId, date: form.date, dispensedBy: form.dispensedBy, items: form.items.filter((i) => i.material_name) }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("Dispensing record submitted for QA sign-off");
      setModal(false);
      setForm({ batchId: "", date: "", dispensedBy: "", items: [BLANK_ITEM()] });
      startTransition(() => router.refresh());
    } catch (e: unknown) { toast.error((e as Error).message ?? "Failed"); }
    finally { setLoading(false); }
  };

  const reviewAction = async (id: string, action: "approve" | "reject") => {
    if (action === "reject" && !comment.trim()) { toast.error("Rejection reason required"); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/dispensing/${id}/approve`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment, action }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success(action === "approve" ? "Record approved" : "Record rejected");
      setReviewModal(null); setComment("");
      startTransition(() => router.refresh());
    } catch (e: unknown) { toast.error((e as Error).message ?? "Failed"); }
    finally { setLoading(false); }
  };

  const canApprove = CAN_APPROVE.includes(user.role);
  const canCreate  = ["warehouse", "production", "qa_regulatory", "management"].includes(user.role);

  return (
    <div>
      <PageHeader
        title="Dispensing Records"
        subtitle="Weighing, dispensing & deviation documentation per batch"
        action={canCreate ? <Btn variant="primary" onClick={() => setModal(true)}>+ New Dispensing Record</Btn> : undefined}
      />

      {initial.length === 0 ? (
        <Card><EmptyState icon="⊡" title="No dispensing records yet" subtitle="Create a dispensing record once the GRN is approved." /></Card>
      ) : (
        <Card>
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead><tr>
                <th style={TH_STYLE}>Disp. No.</th><th style={TH_STYLE}>Date</th>
                <th style={TH_STYLE}>Batch</th><th style={TH_STYLE}>Product</th>
                <th style={TH_STYLE}>Operator</th><th style={TH_STYLE}>Items</th>
                <th style={TH_STYLE}>Status</th>
                {canApprove && <th style={TH_STYLE}>Action</th>}
              </tr></thead>
              <tbody>
                {initial.map((r) => (
                  <TR key={r.id} onClick={() => setSel(r)} clickable>
                    <td style={{ ...TD_STYLE, ...MONO, color: "var(--blue)" }}>{r.disp_no}</td>
                    <td style={{ ...TD_STYLE, ...MONO }}>{r.date_dispensed}</td>
                    <td style={{ ...TD_STYLE, ...MONO, color: "var(--amber)" }}>{r.batch?.batch_no ?? "—"}</td>
                    <td style={TD_STYLE}>{r.batch?.product_name ?? "—"}</td>
                    <td style={TD_STYLE}>{r.dispensed_by_name}</td>
                    <td style={{ ...TD_STYLE, ...MONO }}>{r.items?.length ?? 0}</td>
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

      {/* Detail modal */}
      {sel && (
        <Modal title={`Dispensing Record — ${sel.disp_no}`} onClose={() => setSel(null)} width={820}>
          <ApprovalBanner status={sel.status} approvedBy={sel.approved_by} approvedAt={sel.approved_at ?? undefined} comment={sel.approval_comment ?? undefined} />
          <Grid cols={3}>
            {[["Disp. No.", sel.disp_no], ["Date", sel.date_dispensed], ["Batch", sel.batch?.batch_no ?? "—"], ["Product", sel.batch?.product_name ?? "—"], ["Operator", sel.dispensed_by_name], ["QA Checked By", sel.checked_by_name ?? "Pending"]].map(([k, v]) => (
              <div key={String(k)}><div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 3 }}>{k}</div><div style={{ fontSize: 13 }}>{v}</div></div>
            ))}
          </Grid>
          <div style={{ marginTop: 16, fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8 }}>Dispensing Log</div>
          <table>
            <thead><tr>
              <th style={TH_STYLE}>Material</th><th style={TH_STYLE}>Required</th>
              <th style={TH_STYLE}>Dispensed</th><th style={TH_STYLE}>Unit</th>
              <th style={TH_STYLE}>Deviation</th><th style={TH_STYLE}>Dev %</th><th style={TH_STYLE}>Status</th>
            </tr></thead>
            <tbody>
              {(sel.items ?? []).map((it, i) => {
                const dev = (Number(it.dispensed_qty) - Number(it.required_qty));
                const devPct = Number(it.required_qty) !== 0 ? ((dev / Number(it.required_qty)) * 100).toFixed(2) : "—";
                const ok = it.deviation_acceptable !== false;
                return (
                  <TR key={i}>
                    <td style={TD_STYLE}>{it.material_name}</td>
                    <td style={{ ...TD_STYLE, ...MONO }}>{it.required_qty}</td>
                    <td style={{ ...TD_STYLE, ...MONO, fontWeight: 700 }}>{it.dispensed_qty}</td>
                    <td style={TD_STYLE}>{it.unit}</td>
                    <td style={{ ...TD_STYLE, ...MONO, color: dev === 0 ? "var(--accent)" : Math.abs(dev) < 0.5 ? "var(--amber)" : "var(--red)" }}>
                      {dev >= 0 ? "+" : ""}{dev.toFixed(3)}
                    </td>
                    <td style={{ ...TD_STYLE, ...MONO }}>{devPct}{devPct !== "—" ? "%" : ""}</td>
                    <td style={TD_STYLE}><Badge value={ok ? "pass" : "fail"} /></td>
                  </TR>
                );
              })}
            </tbody>
          </table>
        </Modal>
      )}

      {/* Review modal */}
      {reviewModal && (
        <Modal title="Review Dispensing Record" onClose={() => { setReviewModal(null); setComment(""); }}>
          <Field label="Comment (required for rejection)">
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Enter comment or rejection reason..."
              style={{ width: "100%", padding: "8px 11px", background: "var(--bg)", border: "1px solid var(--border2)", borderRadius: 6, color: "var(--text)", fontSize: 13, minHeight: 80, resize: "vertical", fontFamily: "inherit" }} />
          </Field>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn variant="primary" loading={loading} onClick={() => reviewAction(reviewModal, "approve")}>✓ Approve</Btn>
            <Btn variant="danger" loading={loading} onClick={() => reviewAction(reviewModal, "reject")}>✗ Reject</Btn>
          </div>
        </Modal>
      )}

      {/* Create modal */}
      {modal && (
        <Modal title="New Dispensing Record" onClose={() => setModal(false)} width={820}>
          <Grid cols={3}>
            <Field label="Batch" required>
              <select value={form.batchId} onChange={(e) => setForm((f) => ({ ...f, batchId: e.target.value }))}
                style={{ width: "100%", padding: "8px 11px", background: "var(--bg)", border: "1px solid var(--border2)", borderRadius: 6, color: "var(--text)", fontSize: 13, appearance: "none" }}>
                <option value="">— Select batch —</option>
                {batches.map((b) => <option key={b.id} value={b.id}>{b.batch_no} · {b.product_name}</option>)}
              </select>
            </Field>
            <Field label="Date Dispensed" required>
              <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                style={{ width: "100%", padding: "8px 11px", background: "var(--bg)", border: "1px solid var(--border2)", borderRadius: 6, color: "var(--text)", fontSize: 13 }} />
            </Field>
            <Field label="Dispensed By" required>
              <input value={form.dispensedBy} onChange={(e) => setForm((f) => ({ ...f, dispensedBy: e.target.value }))} placeholder="Operator full name"
                style={{ width: "100%", padding: "8px 11px", background: "var(--bg)", border: "1px solid var(--border2)", borderRadius: 6, color: "var(--text)", fontSize: 13 }} />
            </Field>
          </Grid>

          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>Material Weights</div>
          {form.items.map((it, i) => (
            <div key={i} style={{ background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)", borderRadius: 6, padding: 10, marginBottom: 8 }}>
              <div style={{ display: "grid", gridTemplateColumns: "3fr 1.5fr 1.5fr 1fr auto", gap: 8, alignItems: "end" }}>
                <Field label={i === 0 ? "Material" : ""}><input value={it.material_name} onChange={(e) => updItem(i, "material_name", e.target.value)} placeholder="Material name"
                  style={{ width: "100%", padding: "8px 11px", background: "var(--bg)", border: "1px solid var(--border2)", borderRadius: 6, color: "var(--text)", fontSize: 13 }} /></Field>
                <Field label={i === 0 ? "Required Qty" : ""}><input type="number" step="0.001" value={it.required_qty} onChange={(e) => updItem(i, "required_qty", e.target.value)} placeholder="0.000"
                  style={{ width: "100%", padding: "8px 11px", background: "var(--bg)", border: "1px solid var(--border2)", borderRadius: 6, color: "var(--text)", fontSize: 13 }} /></Field>
                <Field label={i === 0 ? "Actual Dispensed" : ""}>
                  <input type="number" step="0.001" value={it.dispensed_qty} onChange={(e) => updItem(i, "dispensed_qty", e.target.value)} placeholder="0.000"
                    style={{ width: "100%", padding: "8px 11px", background: "var(--bg)", border: "1px solid var(--border2)", borderRadius: 6, color: "var(--text)", fontSize: 13,
                      borderColor: it.required_qty && it.dispensed_qty && Math.abs(Number(it.dispensed_qty) - Number(it.required_qty)) > Number(it.required_qty) * 0.01 ? "var(--amber)" : "var(--border2)" }} />
                  {it.required_qty && it.dispensed_qty && (
                    <div style={{ fontSize: 10, marginTop: 3, color: Math.abs(Number(it.dispensed_qty) - Number(it.required_qty)) <= Number(it.required_qty) * 0.005 ? "var(--accent)" : "var(--amber)" }}>
                      Dev: {(Number(it.dispensed_qty) - Number(it.required_qty)) >= 0 ? "+" : ""}{(Number(it.dispensed_qty) - Number(it.required_qty)).toFixed(3)}
                    </div>
                  )}
                </Field>
                <Field label={i === 0 ? "Unit" : ""}>
                  <select value={it.unit} onChange={(e) => updItem(i, "unit", e.target.value)}
                    style={{ width: "100%", padding: "8px 11px", background: "var(--bg)", border: "1px solid var(--border2)", borderRadius: 6, color: "var(--text)", fontSize: 13, appearance: "none" }}>
                    <option>kg</option><option>g</option><option>L</option><option>mL</option>
                  </select>
                </Field>
                <div style={{ paddingBottom: 14 }}>
                  {i > 0 && <button onClick={() => removeItem(i)} style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: 5, color: "var(--red)", cursor: "pointer", padding: "7px 9px", fontSize: 12 }}>✕</button>}
                </div>
              </div>
            </div>
          ))}
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <Btn variant="blue" onClick={addItem}>+ Add Material</Btn>
            <Btn variant="primary" loading={loading} onClick={submit}>Submit for QA Sign-off</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
