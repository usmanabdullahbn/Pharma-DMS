"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Badge, Btn, Card, EmptyState, Field, Grid, Modal, PageHeader, TH_STYLE, TD_STYLE, MONO, TR } from "@/components/ui";
import type { AppUser, ReleaseRecord, AuditLog, FinishedGoods, StabilityStudy, StabilityResult } from "@/types";
import { CAN_APPROVE } from "@/types";

interface BatchStub { id: string; batch_no: string; product_name: string; }

// ═══════════ FINISHED GOODS ═══════════
interface FGProps { user: AppUser; records: (FinishedGoods & { batch?: BatchStub })[]; batches: BatchStub[]; }
export function FGClient({ user, records: initial, batches }: FGProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ batchId: "", date: "", qty: "", unit: "L", yieldPct: "", packFormat: "", totalUnits: "", storageLocation: "", enteredBy: "" });

  const submit = async () => {
    if (!form.batchId || !form.date) { toast.error("Batch and date are required"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/finished-goods", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("Finished goods entry created");
      setModal(false); setForm({ batchId: "", date: "", qty: "", unit: "L", yieldPct: "", packFormat: "", totalUnits: "", storageLocation: "", enteredBy: "" });
      startTransition(() => router.refresh());
    } catch (e: unknown) { toast.error((e as Error).message ?? "Failed"); }
    finally { setLoading(false); }
  };

  const canCreate = ["production", "qa_regulatory", "management"].includes(user.role);

  return (
    <div>
      <PageHeader title="Finished Goods" subtitle="FG entry, yield reconciliation & warehouse stock" action={canCreate ? <Btn variant="primary" onClick={() => setModal(true)}>+ FG Entry</Btn> : undefined} />
      {initial.length === 0 ? (
        <Card><EmptyState icon="▣" title="No finished goods entries" subtitle="Enter FG records after production and packaging are complete." /></Card>
      ) : (
        <Card>
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead><tr>
                <th style={TH_STYLE}>FG No.</th><th style={TH_STYLE}>Batch</th><th style={TH_STYLE}>Product</th>
                <th style={TH_STYLE}>Qty</th><th style={TH_STYLE}>Yield</th><th style={TH_STYLE}>Pack</th>
                <th style={TH_STYLE}>Units</th><th style={TH_STYLE}>Date</th><th style={TH_STYLE}>Status</th>
              </tr></thead>
              <tbody>
                {initial.map((r) => (
                  <TR key={r.id}>
                    <td style={{ ...TD_STYLE, ...MONO, color: "var(--blue)" }}>{r.fg_no}</td>
                    <td style={{ ...TD_STYLE, ...MONO, color: "var(--amber)" }}>{r.batch?.batch_no ?? "—"}</td>
                    <td style={TD_STYLE}>{r.batch?.product_name ?? "—"}</td>
                    <td style={{ ...TD_STYLE, ...MONO }}>{r.actual_qty ?? "—"} {r.unit}</td>
                    <td style={{ ...TD_STYLE, ...MONO, color: Number(r.yield_pct) >= 99 ? "var(--accent)" : "var(--amber)" }}>{r.yield_pct ? `${r.yield_pct}%` : "—"}</td>
                    <td style={TD_STYLE}>{r.pack_format ?? "—"}</td>
                    <td style={{ ...TD_STYLE, ...MONO }}>{r.total_units?.toLocaleString() ?? "—"}</td>
                    <td style={{ ...TD_STYLE, ...MONO }}>{r.date_entered}</td>
                    <td style={TD_STYLE}><Badge value={r.status} /></td>
                  </TR>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      {modal && (
        <Modal title="Finished Goods Entry" onClose={() => setModal(false)}>
          <Grid cols={2}>
            <Field label="Batch" required>
              <select value={form.batchId} onChange={(e) => setForm((f) => ({ ...f, batchId: e.target.value }))}
                style={{ width: "100%", padding: "8px 11px", background: "var(--bg)", border: "1px solid var(--border2)", borderRadius: 6, color: "var(--text)", fontSize: 13, appearance: "none" }}>
                <option value="">—</option>{batches.map((b) => <option key={b.id} value={b.id}>{b.batch_no} · {b.product_name}</option>)}
              </select>
            </Field>
            <Field label="Date Entered" required><input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} style={{ width: "100%", padding: "8px 11px", background: "var(--bg)", border: "1px solid var(--border2)", borderRadius: 6, color: "var(--text)", fontSize: 13 }} /></Field>
            <Field label="Actual Qty"><input type="number" value={form.qty} onChange={(e) => setForm((f) => ({ ...f, qty: e.target.value }))} placeholder="e.g. 498" style={{ width: "100%", padding: "8px 11px", background: "var(--bg)", border: "1px solid var(--border2)", borderRadius: 6, color: "var(--text)", fontSize: 13 }} /></Field>
            <Field label="Unit"><select value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} style={{ width: "100%", padding: "8px 11px", background: "var(--bg)", border: "1px solid var(--border2)", borderRadius: 6, color: "var(--text)", fontSize: 13, appearance: "none" }}><option>L</option><option>mL</option><option>kg</option><option>g</option></select></Field>
            <Field label="Yield %"><input value={form.yieldPct} onChange={(e) => setForm((f) => ({ ...f, yieldPct: e.target.value }))} placeholder="e.g. 99.6" style={{ width: "100%", padding: "8px 11px", background: "var(--bg)", border: "1px solid var(--border2)", borderRadius: 6, color: "var(--text)", fontSize: 13 }} /></Field>
            <Field label="Pack Format"><input value={form.packFormat} onChange={(e) => setForm((f) => ({ ...f, packFormat: e.target.value }))} placeholder="e.g. 100 mL glass vials" style={{ width: "100%", padding: "8px 11px", background: "var(--bg)", border: "1px solid var(--border2)", borderRadius: 6, color: "var(--text)", fontSize: 13 }} /></Field>
            <Field label="Total Units Packed"><input type="number" value={form.totalUnits} onChange={(e) => setForm((f) => ({ ...f, totalUnits: e.target.value }))} placeholder="e.g. 4980" style={{ width: "100%", padding: "8px 11px", background: "var(--bg)", border: "1px solid var(--border2)", borderRadius: 6, color: "var(--text)", fontSize: 13 }} /></Field>
            <Field label="Storage Location"><input value={form.storageLocation} onChange={(e) => setForm((f) => ({ ...f, storageLocation: e.target.value }))} placeholder="e.g. Quarantine Store B, Shelf 3" style={{ width: "100%", padding: "8px 11px", background: "var(--bg)", border: "1px solid var(--border2)", borderRadius: 6, color: "var(--text)", fontSize: 13 }} /></Field>
          </Grid>
          <Field label="Entered By"><input value={form.enteredBy} onChange={(e) => setForm((f) => ({ ...f, enteredBy: e.target.value }))} placeholder="Full name" style={{ width: "100%", padding: "8px 11px", background: "var(--bg)", border: "1px solid var(--border2)", borderRadius: 6, color: "var(--text)", fontSize: 13 }} /></Field>
          <Btn variant="primary" loading={loading} onClick={submit}>Submit FG Entry</Btn>
        </Modal>
      )}
    </div>
  );
}

// ═══════════ RELEASE ═══════════
interface RelProps { user: AppUser; records: (ReleaseRecord & { batch?: BatchStub })[]; batches: BatchStub[]; }
export function ReleaseClient({ user, records: initial, batches }: RelProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ batchId: "", releaseType: "unconditional", releaseDate: "", conditions: "", issuedByName: "", drapRef: "" });

  const submit = async () => {
    if (!form.batchId || !form.releaseDate || !form.issuedByName) { toast.error("Batch, date, and issuer are required"); return; }
    if (form.releaseType === "conditional" && !form.conditions.trim()) { toast.error("Conditions must be stated for a conditional release"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/release", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("Release certificate issued");
      setModal(false); setForm({ batchId: "", releaseType: "unconditional", releaseDate: "", conditions: "", issuedByName: "", drapRef: "" });
      startTransition(() => router.refresh());
    } catch (e: unknown) { toast.error((e as Error).message ?? "Failed"); }
    finally { setLoading(false); }
  };

  const canRelease = CAN_APPROVE.includes(user.role);

  return (
    <div>
      <PageHeader title="Batch Release" subtitle="Conditional & unconditional release decisions — DRAP License Holder only" action={canRelease ? <Btn variant="primary" onClick={() => setModal(true)}>+ Issue Release</Btn> : undefined} />
      {!canRelease && (
        <div style={{ background: "rgba(201,153,26,0.06)", border: "1px solid rgba(201,153,26,0.25)", borderRadius: 8, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "var(--amber)" }}>
          ⚠ Release decisions may only be issued by QA / Regulatory or Management (DRAP License Holder).
        </div>
      )}
      {initial.length === 0 ? (
        <Card><EmptyState icon="✦" title="No releases issued" subtitle="Release certificates will appear here after QA authorisation." /></Card>
      ) : (
        <Card>
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead><tr>
                <th style={TH_STYLE}>Release No.</th><th style={TH_STYLE}>Batch</th><th style={TH_STYLE}>Product</th>
                <th style={TH_STYLE}>Type</th><th style={TH_STYLE}>Date</th><th style={TH_STYLE}>Issued By</th>
                <th style={TH_STYLE}>Conditions</th><th style={TH_STYLE}>Status</th>
              </tr></thead>
              <tbody>
                {initial.map((r) => (
                  <TR key={r.id}>
                    <td style={{ ...TD_STYLE, ...MONO, color: "var(--blue)" }}>{r.release_no}</td>
                    <td style={{ ...TD_STYLE, ...MONO, color: "var(--amber)" }}>{r.batch?.batch_no ?? "—"}</td>
                    <td style={TD_STYLE}>{r.batch?.product_name ?? "—"}</td>
                    <td style={TD_STYLE}><Badge value={r.release_type} label={r.release_type === "unconditional" ? "✓ Unconditional" : "⚠ Conditional"} /></td>
                    <td style={{ ...TD_STYLE, ...MONO }}>{r.release_date}</td>
                    <td style={TD_STYLE}>{r.issued_by_name}</td>
                    <td style={{ ...TD_STYLE, fontSize: 12, color: "var(--muted)", maxWidth: 200 }}>{r.conditions ?? "None"}</td>
                    <td style={TD_STYLE}><Badge value={r.status} /></td>
                  </TR>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      {modal && canRelease && (
        <Modal title="Issue Batch Release Certificate" onClose={() => setModal(false)}>
          <Grid cols={2}>
            <Field label="Batch" required>
              <select value={form.batchId} onChange={(e) => setForm((f) => ({ ...f, batchId: e.target.value }))}
                style={{ width: "100%", padding: "8px 11px", background: "var(--bg)", border: "1px solid var(--border2)", borderRadius: 6, color: "var(--text)", fontSize: 13, appearance: "none" }}>
                <option value="">—</option>{batches.map((b) => <option key={b.id} value={b.id}>{b.batch_no} · {b.product_name}</option>)}
              </select>
            </Field>
            <Field label="Release Type" required>
              <select value={form.releaseType} onChange={(e) => setForm((f) => ({ ...f, releaseType: e.target.value }))}
                style={{ width: "100%", padding: "8px 11px", background: "var(--bg)", border: "1px solid var(--border2)", borderRadius: 6, color: "var(--text)", fontSize: 13, appearance: "none" }}>
                <option value="unconditional">Unconditional Release</option>
                <option value="conditional">Conditional Release</option>
                <option value="quarantine_release">Quarantine Release</option>
                <option value="reject">Batch Rejection</option>
              </select>
            </Field>
            <Field label="Release Date" required><input type="date" value={form.releaseDate} onChange={(e) => setForm((f) => ({ ...f, releaseDate: e.target.value }))} style={{ width: "100%", padding: "8px 11px", background: "var(--bg)", border: "1px solid var(--border2)", borderRadius: 6, color: "var(--text)", fontSize: 13 }} /></Field>
            <Field label="DRAP Reference"><input value={form.drapRef} onChange={(e) => setForm((f) => ({ ...f, drapRef: e.target.value }))} placeholder="Optional DRAP ref. no." style={{ width: "100%", padding: "8px 11px", background: "var(--bg)", border: "1px solid var(--border2)", borderRadius: 6, color: "var(--text)", fontSize: 13 }} /></Field>
          </Grid>
          <Field label="Issued By (QA / DRAP License Holder)" required><input value={form.issuedByName} onChange={(e) => setForm((f) => ({ ...f, issuedByName: e.target.value }))} placeholder="Full name" style={{ width: "100%", padding: "8px 11px", background: "var(--bg)", border: "1px solid var(--border2)", borderRadius: 6, color: "var(--text)", fontSize: 13 }} /></Field>
          {["conditional","quarantine_release","reject"].includes(form.releaseType) && (
            <Field label="Conditions / Reason" required>
              <textarea value={form.conditions} onChange={(e) => setForm((f) => ({ ...f, conditions: e.target.value }))} placeholder="State all conditions, restrictions or rejection rationale..."
                style={{ width: "100%", padding: "8px 11px", background: "var(--bg)", border: "1px solid var(--border2)", borderRadius: 6, color: "var(--text)", fontSize: 13, minHeight: 80, resize: "vertical", fontFamily: "inherit" }} />
            </Field>
          )}
          <div style={{ padding: "10px 14px", borderRadius: 6, marginBottom: 14,
            background: form.releaseType === "unconditional" ? "rgba(31,155,85,0.08)" : "rgba(201,153,26,0.08)",
            border: `1px solid ${form.releaseType === "unconditional" ? "rgba(31,155,85,0.3)" : "rgba(201,153,26,0.3)"}`,
            fontSize: 12, color: form.releaseType === "unconditional" ? "var(--accent)" : "var(--amber)",
          }}>
            {form.releaseType === "unconditional"
              ? "✓ Unconditional — batch fully complies. Cleared for sale and distribution."
              : form.releaseType === "reject"
              ? "✗ Batch Rejection — this batch will be quarantined and cannot be released."
              : "⚠ Release subject to stated conditions. Ensure compliance is documented."}
          </div>
          <Btn variant={form.releaseType === "unconditional" ? "primary" : "amber"} loading={loading} onClick={submit}>Issue Release Certificate</Btn>
        </Modal>
      )}
    </div>
  );
}

// ═══════════ AUDIT TRAIL ═══════════
interface AuditProps { records: AuditLog[]; }
const TYPE_COLORS: Record<string, string> = {
  grns: "var(--amber)", dispensing_records: "var(--blue)", qc_records: "var(--purple)",
  bmrs: "var(--blue)", finished_goods: "var(--teal)", release_records: "var(--accent)",
  stability_studies: "var(--teal)", batches: "var(--muted)", batch: "var(--muted)",
};
const ACTION_COLORS: Record<string, string> = {
  APPROVE: "var(--accent)", CREATE: "var(--blue)", UPDATE: "var(--amber)",
  REJECT: "var(--red)", LOCK: "var(--purple)", UPLOAD: "var(--teal)", DELETE: "var(--red)",
  LOGIN: "var(--muted)", VERSION_CREATE: "var(--blue)",
};

export function AuditClient({ records }: AuditProps) {
  const [filter, setFilter] = useState("");

  const filtered = filter
    ? records.filter((r) => r.entity_type.includes(filter) || r.action.includes(filter) || r.user_name.toLowerCase().includes(filter.toLowerCase()) || (r.entity_display ?? "").toLowerCase().includes(filter.toLowerCase()))
    : records;

  return (
    <div>
      <PageHeader title="Audit Trail" subtitle="Immutable chronological log of all system actions — read only" />
      <div style={{ marginBottom: 16 }}>
        <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter by user, entity, action..."
          style={{ width: 320, padding: "8px 12px", background: "var(--card)", border: "1px solid var(--border2)", borderRadius: 6, color: "var(--text)", fontSize: 13 }} />
      </div>
      {filtered.length === 0 ? (
        <Card><EmptyState icon="◉" title="No audit records" subtitle="System actions will be logged here automatically as users interact with the platform." /></Card>
      ) : (
        <Card>
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead><tr>
                <th style={TH_STYLE}>Timestamp</th><th style={TH_STYLE}>Action</th><th style={TH_STYLE}>Module</th>
                <th style={TH_STYLE}>Document</th><th style={TH_STYLE}>User</th><th style={TH_STYLE}>Role</th><th style={TH_STYLE}>Details</th>
              </tr></thead>
              <tbody>
                {filtered.map((r) => (
                  <TR key={r.id}>
                    <td style={{ ...TD_STYLE, ...MONO, fontSize: 11 }}>{new Date(r.created_at).toLocaleString()}</td>
                    <td style={TD_STYLE}>
                      <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 3, fontWeight: 700, letterSpacing: "0.5px", background: `${ACTION_COLORS[r.action] ?? "var(--muted)"}18`, color: ACTION_COLORS[r.action] ?? "var(--muted)" }}>
                        {r.action}
                      </span>
                    </td>
                    <td style={TD_STYLE}>
                      <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 3, background: `${TYPE_COLORS[r.entity_type] ?? "var(--muted)"}18`, color: TYPE_COLORS[r.entity_type] ?? "var(--muted)" }}>
                        {r.entity_type.replace(/_/g, " ").replace(/s$/, "")}
                      </span>
                    </td>
                    <td style={{ ...TD_STYLE, ...MONO, color: "var(--blue)", fontSize: 12 }}>{r.entity_display ?? r.entity_id.slice(0, 8) + "..."}</td>
                    <td style={TD_STYLE}>{r.user_name ?? "Unknown"}</td>
                    <td style={{ ...TD_STYLE, fontSize: 11, color: "var(--muted)" }}>{(r.user_role ?? "unknown").replace("_", " ")}</td>
                    <td style={{ ...TD_STYLE, fontSize: 11, color: "var(--muted)", maxWidth: 200 }}>
                      {r.new_values ? Object.entries(r.new_values).slice(0, 2).map(([k, v]) => `${k}: ${v}`).join(" · ") : "—"}
                    </td>
                  </TR>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
