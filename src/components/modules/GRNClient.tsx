"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Badge, Btn, Card, EmptyState, Field, Grid, Modal, PageHeader,
  TH_STYLE, TD_STYLE, MONO, TR, AttachmentRow, ApprovalBanner, LockedBanner,
} from "@/components/ui";
import type { AppUser, GRN, GRNItem } from "@/types";
import { CAN_APPROVE } from "@/types";

interface BatchStub { id: string; batch_no: string; product_name: string; }
interface Props { user: AppUser; grns: (GRN & { batch?: BatchStub })[]; batches: BatchStub[]; }

const BLANK_ITEM = (): Partial<GRNItem> => ({ material_name: "", quantity: 0, unit: "kg", supplier_lot_no: "", exp_date: "", coa_reference: "" });

export default function GRNClient({ user, grns: initialGRNs, batches }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [grns, setGrns] = useState(initialGRNs);
  const [sel, setSel] = useState<(GRN & { batch?: BatchStub }) | null>(null);
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [approveComment, setApproveComment] = useState("");
  const [approveModal, setApproveModal] = useState<string | null>(null);

  // New GRN form state
  const [form, setForm] = useState({
    batchMode: "existing" as "existing" | "new",
    batchId: "", newBatchNo: "", newProduct: "", newMfgDate: "", newExpDate: "",
    newSize: "", newUnit: "L",
    date: "", supplier: "", contact: "", invoice: "", poRef: "",
    items: [BLANK_ITEM()],
  });

  const addItem = () => setForm((f) => ({ ...f, items: [...f.items, BLANK_ITEM()] }));
  const removeItem = (i: number) => setForm((f) => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));
  const updItem = (i: number, k: string, v: string | number) =>
    setForm((f) => { const it = [...f.items]; it[i] = { ...it[i], [k]: v }; return { ...f, items: it }; });

  const submitGRN = async () => {
    if (!form.date || !form.supplier || !form.invoice) { toast.error("Date, supplier and invoice are required"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/grn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchMode: form.batchMode,
          batchId: form.batchId,
          newBatch: { batchNo: form.newBatchNo, product: form.newProduct, mfgDate: form.newMfgDate, expDate: form.newExpDate, size: form.newSize, unit: form.newUnit },
          date: form.date, supplier: form.supplier, contact: form.contact,
          invoice: form.invoice, poRef: form.poRef,
          items: form.items.filter((i) => i.material_name),
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("GRN submitted for approval");
      setModal(false);
      startTransition(() => router.refresh());
    } catch (e: unknown) {
      toast.error((e as Error).message ?? "Failed to submit GRN");
    } finally { setLoading(false); }
  };

  const approve = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/grn/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: approveComment }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("GRN approved");
      setApproveModal(null);
      setApproveComment("");
      startTransition(() => router.refresh());
    } catch (e: unknown) {
      toast.error((e as Error).message ?? "Approval failed");
    } finally { setLoading(false); }
  };

  const reject = async (id: string) => {
    if (!approveComment.trim()) { toast.error("Please enter a rejection reason"); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/grn/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: approveComment }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("GRN rejected");
      setApproveModal(null);
      startTransition(() => router.refresh());
    } catch (e: unknown) {
      toast.error((e as Error).message ?? "Rejection failed");
    } finally { setLoading(false); }
  };

  const canApprove = CAN_APPROVE.includes(user.role);
  const canCreate = ["warehouse", "qa_regulatory", "management"].includes(user.role);

  return (
    <div>
      <PageHeader
        title="Goods Receipt Notes"
        subtitle="Inbound raw material documentation & supplier records"
        action={canCreate ? <Btn variant="primary" onClick={() => setModal(true)}>+ New GRN</Btn> : undefined}
      />

      {grns.length === 0 ? (
        <Card><EmptyState icon="◈" title="No GRN records yet" subtitle="Create the first Goods Receipt Note to begin the batch documentation pipeline." /></Card>
      ) : (
        <Card>
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th style={TH_STYLE}>GRN No.</th>
                  <th style={TH_STYLE}>Date</th>
                  <th style={TH_STYLE}>Supplier</th>
                  <th style={TH_STYLE}>Invoice</th>
                  <th style={TH_STYLE}>Batch</th>
                  <th style={TH_STYLE}>Materials</th>
                  <th style={TH_STYLE}>Status</th>
                  {canApprove && <th style={TH_STYLE}>Action</th>}
                </tr>
              </thead>
              <tbody>
                {grns.map((g) => (
                  <TR key={g.id} onClick={() => setSel(g)} clickable>
                    <td style={{ ...TD_STYLE, ...MONO, color: "var(--blue)" }}>{g.grn_no}</td>
                    <td style={{ ...TD_STYLE, ...MONO }}>{g.date_received}</td>
                    <td style={TD_STYLE}>{g.supplier_name}</td>
                    <td style={{ ...TD_STYLE, ...MONO }}>{g.invoice_no ?? "—"}</td>
                    <td style={{ ...TD_STYLE, ...MONO, color: "var(--amber)" }}>{g.batch?.batch_no ?? g.batch_id?.slice(0,8)}</td>
                    <td style={{ ...TD_STYLE, ...MONO }}>{g.items?.length ?? 0}</td>
                    <td style={TD_STYLE}><Badge value={g.status} />{g.is_locked && <LockedBanner />}</td>
                    {canApprove && (
                      <td style={TD_STYLE}>
                        {g.status === "submitted" && (
                          <Btn size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); setApproveModal(g.id); }}>
                            Review
                          </Btn>
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

      {/* ─── DETAIL MODAL ─── */}
      {sel && (
        <Modal title={`GRN — ${sel.grn_no}`} onClose={() => setSel(null)} width={780}>
          <ApprovalBanner status={sel.status} approvedBy={sel.approved_by} approvedAt={sel.approved_at} comment={sel.approval_comment ?? undefined} />
          <Grid cols={3}>
            {[["GRN No.", sel.grn_no], ["Date", sel.date_received], ["Status", <Badge key="s" value={sel.status} />],
              ["Supplier", sel.supplier_name], ["Invoice", sel.invoice_no ?? "—"], ["Batch", sel.batch?.batch_no ?? "—"]
            ].map(([k, v]) => (
              <div key={String(k)}><div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.5px" }}>{k}</div><div style={{ fontSize: 13 }}>{v}</div></div>
            ))}
          </Grid>
          <div style={{ marginTop: 16, fontSize: 11, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 8 }}>Line Items</div>
          <table>
            <thead><tr>
              <th style={TH_STYLE}>Material</th><th style={TH_STYLE}>Qty</th><th style={TH_STYLE}>Unit</th>
              <th style={TH_STYLE}>Supplier Lot</th><th style={TH_STYLE}>Exp Date</th><th style={TH_STYLE}>COA Ref.</th>
            </tr></thead>
            <tbody>{(sel.items ?? []).map((item, i) => (
              <TR key={i}>
                <td style={TD_STYLE}>{item.material_name}</td>
                <td style={{ ...TD_STYLE, ...MONO }}>{item.quantity}</td>
                <td style={TD_STYLE}>{item.unit}</td>
                <td style={{ ...TD_STYLE, ...MONO }}>{item.supplier_lot_no ?? "—"}</td>
                <td style={{ ...TD_STYLE, ...MONO }}>{item.exp_date ?? "—"}</td>
                <td style={{ ...TD_STYLE, ...MONO }}>{item.coa_reference ?? "—"}</td>
              </TR>
            ))}</tbody>
          </table>
        </Modal>
      )}

      {/* ─── APPROVE / REJECT MODAL ─── */}
      {approveModal && (
        <Modal title="Review GRN" onClose={() => { setApproveModal(null); setApproveComment(""); }}>
          <Field label="Comment (required for rejection, optional for approval)">
            <textarea
              value={approveComment}
              onChange={(e) => setApproveComment(e.target.value)}
              placeholder="Add a comment or note..."
              style={{ width: "100%", padding: "8px 11px", background: "var(--bg)", border: "1px solid var(--border2)", borderRadius: 6, color: "var(--text)", fontSize: 13, minHeight: 80, resize: "vertical", fontFamily: "inherit" }}
            />
          </Field>
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <Btn variant="primary" loading={loading} onClick={() => approve(approveModal)}>✓ Approve</Btn>
            <Btn variant="danger" loading={loading} onClick={() => reject(approveModal)}>✗ Reject</Btn>
          </div>
        </Modal>
      )}

      {/* ─── CREATE MODAL ─── */}
      {modal && (
        <Modal title="Create New GRN" onClose={() => setModal(false)} width={780}>
          {/* Batch mode toggle */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 8 }}>Batch</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              {(["existing", "new"] as const).map((m) => (
                <button key={m} onClick={() => setForm((f) => ({ ...f, batchMode: m }))} style={{
                  padding: "5px 14px", borderRadius: 5, border: `1px solid ${form.batchMode === m ? "var(--accent)" : "var(--border2)"}`,
                  background: form.batchMode === m ? "rgba(31,155,85,0.1)" : "transparent",
                  color: form.batchMode === m ? "var(--accent)" : "var(--muted)",
                  fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                }}>
                  {m === "existing" ? "Link Existing Batch" : "+ Register New Batch"}
                </button>
              ))}
            </div>
            {form.batchMode === "existing" ? (
              <select value={form.batchId} onChange={(e) => setForm((f) => ({ ...f, batchId: e.target.value }))}
                style={{ width: "100%", padding: "8px 11px", background: "var(--bg)", border: "1px solid var(--border2)", borderRadius: 6, color: "var(--text)", fontSize: 13, appearance: "none" }}>
                <option value="">— Select batch —</option>
                {batches.map((b) => <option key={b.id} value={b.id}>{b.batch_no} · {b.product_name}</option>)}
              </select>
            ) : (
              <div style={{ background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)", borderRadius: 6, padding: 12 }}>
                <Grid cols={3}>
                  <Field label="Batch No." required><input style={{ width:"100%",padding:"8px 11px",background:"var(--bg)",border:"1px solid var(--border2)",borderRadius:6,color:"var(--text)",fontSize:13,fontFamily:"inherit" }} placeholder="OTC-240401" value={form.newBatchNo} onChange={(e)=>setForm(f=>({...f,newBatchNo:e.target.value}))} /></Field>
                  <Field label="Product Name" required><input style={{ width:"100%",padding:"8px 11px",background:"var(--bg)",border:"1px solid var(--border2)",borderRadius:6,color:"var(--text)",fontSize:13,fontFamily:"inherit" }} placeholder="Product name" value={form.newProduct} onChange={(e)=>setForm(f=>({...f,newProduct:e.target.value}))} /></Field>
                  <Field label="Mfg Date"><input type="date" style={{ width:"100%",padding:"8px 11px",background:"var(--bg)",border:"1px solid var(--border2)",borderRadius:6,color:"var(--text)",fontSize:13,fontFamily:"inherit" }} value={form.newMfgDate} onChange={(e)=>setForm(f=>({...f,newMfgDate:e.target.value}))} /></Field>
                  <Field label="Exp Date"><input type="date" style={{ width:"100%",padding:"8px 11px",background:"var(--bg)",border:"1px solid var(--border2)",borderRadius:6,color:"var(--text)",fontSize:13,fontFamily:"inherit" }} value={form.newExpDate} onChange={(e)=>setForm(f=>({...f,newExpDate:e.target.value}))} /></Field>
                  <Field label="Batch Size"><input type="number" style={{ width:"100%",padding:"8px 11px",background:"var(--bg)",border:"1px solid var(--border2)",borderRadius:6,color:"var(--text)",fontSize:13,fontFamily:"inherit" }} value={form.newSize} onChange={(e)=>setForm(f=>({...f,newSize:e.target.value}))} /></Field>
                  <Field label="Unit"><select style={{ width:"100%",padding:"8px 11px",background:"var(--bg)",border:"1px solid var(--border2)",borderRadius:6,color:"var(--text)",fontSize:13,appearance:"none" }} value={form.newUnit} onChange={(e)=>setForm(f=>({...f,newUnit:e.target.value}))}><option>L</option><option>mL</option><option>kg</option><option>g</option><option>units</option></select></Field>
                </Grid>
              </div>
            )}
          </div>

          <Grid cols={3}>
            <Field label="Date Received" required><input type="date" style={{ width:"100%",padding:"8px 11px",background:"var(--bg)",border:"1px solid var(--border2)",borderRadius:6,color:"var(--text)",fontSize:13,fontFamily:"inherit" }} value={form.date} onChange={(e)=>setForm(f=>({...f,date:e.target.value}))} /></Field>
            <Field label="Supplier Name" required><input style={{ width:"100%",padding:"8px 11px",background:"var(--bg)",border:"1px solid var(--border2)",borderRadius:6,color:"var(--text)",fontSize:13,fontFamily:"inherit" }} placeholder="Supplier / vendor name" value={form.supplier} onChange={(e)=>setForm(f=>({...f,supplier:e.target.value}))} /></Field>
            <Field label="Invoice No." required><input style={{ width:"100%",padding:"8px 11px",background:"var(--bg)",border:"1px solid var(--border2)",borderRadius:6,color:"var(--text)",fontSize:13,fontFamily:"inherit" }} placeholder="INV-XXXX" value={form.invoice} onChange={(e)=>setForm(f=>({...f,invoice:e.target.value}))} /></Field>
          </Grid>

          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 10, marginTop: 4 }}>Raw Material Line Items</div>
          {form.items.map((it, i) => (
            <div key={i} style={{ background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)", borderRadius: 6, padding: 10, marginBottom: 8 }}>
              <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1fr 1.5fr 1.5fr 1.5fr auto", gap: 8, alignItems: "end" }}>
                <Field label={i===0?"Material Name":""}><input style={{ width:"100%",padding:"8px 11px",background:"var(--bg)",border:"1px solid var(--border2)",borderRadius:6,color:"var(--text)",fontSize:13,fontFamily:"inherit" }} placeholder="e.g. Oxytetracycline API" value={it.material_name??""} onChange={(e)=>updItem(i,"material_name",e.target.value)} /></Field>
                <Field label={i===0?"Qty":""}><input type="number" style={{ width:"100%",padding:"8px 11px",background:"var(--bg)",border:"1px solid var(--border2)",borderRadius:6,color:"var(--text)",fontSize:13,fontFamily:"inherit" }} value={it.quantity??""} onChange={(e)=>updItem(i,"quantity",e.target.value)} /></Field>
                <Field label={i===0?"Unit":""}><select style={{ width:"100%",padding:"8px 11px",background:"var(--bg)",border:"1px solid var(--border2)",borderRadius:6,color:"var(--text)",fontSize:13,appearance:"none" }} value={it.unit??"kg"} onChange={(e)=>updItem(i,"unit",e.target.value)}><option>kg</option><option>g</option><option>L</option><option>mL</option></select></Field>
                <Field label={i===0?"Supplier Lot":""}><input style={{ width:"100%",padding:"8px 11px",background:"var(--bg)",border:"1px solid var(--border2)",borderRadius:6,color:"var(--text)",fontSize:13,fontFamily:"inherit" }} placeholder="Lot no." value={it.supplier_lot_no??""} onChange={(e)=>updItem(i,"supplier_lot_no",e.target.value)} /></Field>
                <Field label={i===0?"Exp Date":""}><input type="date" style={{ width:"100%",padding:"8px 11px",background:"var(--bg)",border:"1px solid var(--border2)",borderRadius:6,color:"var(--text)",fontSize:13,fontFamily:"inherit" }} value={it.exp_date??""} onChange={(e)=>updItem(i,"exp_date",e.target.value)} /></Field>
                <Field label={i===0?"COA Ref.":""}><input style={{ width:"100%",padding:"8px 11px",background:"var(--bg)",border:"1px solid var(--border2)",borderRadius:6,color:"var(--text)",fontSize:13,fontFamily:"inherit" }} placeholder="COA-XXX" value={it.coa_reference??""} onChange={(e)=>updItem(i,"coa_reference",e.target.value)} /></Field>
                <div style={{ paddingBottom: 14 }}>
                  {i > 0 && <button onClick={() => removeItem(i)} style={{ background:"transparent",border:"1px solid var(--border)",borderRadius:5,color:"var(--red)",cursor:"pointer",padding:"7px 9px",fontSize:12 }}>✕</button>}
                </div>
              </div>
            </div>
          ))}
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <Btn variant="blue" onClick={addItem}>+ Add Material</Btn>
            <Btn variant="primary" loading={loading} onClick={submitGRN}>Submit GRN for Approval</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
