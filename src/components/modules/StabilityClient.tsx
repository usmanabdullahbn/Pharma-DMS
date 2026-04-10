"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Badge, Btn, Card, EmptyState, Field, Grid, Modal, PageHeader, TH_STYLE, TD_STYLE, MONO, TR } from "@/components/ui";
import type { AppUser, StabilityStudy, StabilityParameter } from "@/types";
import { CAN_APPROVE } from "@/types";

interface BatchStub { id: string; batch_no: string; product_name: string; }

const CONDITIONS = [
  "Long-Term (30°C / 65% RH — Zone IVb)",
  "Accelerated (40°C / 75% RH)",
  "Intermediate (30°C / 65% RH — Zone III)",
];
const TIMEPOINTS = [0, 1, 3, 6, 9, 12, 18, 24];

interface Props {
  user: AppUser;
  studies: (StabilityStudy & { batch?: BatchStub; parameters?: StabilityParameter[]; results?: Record<string, unknown>[] })[];
  batches: BatchStub[];
}

const BLANK_PARAM = () => ({ parameter: "", specification: "", unit: "", method_ref: "" });

export default function StabilityClient({ user, studies: initial, batches }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [modal, setModal] = useState(false);
  const [resultModal, setResultModal] = useState<{ study: typeof initial[0]; param: StabilityParameter; timepoint: number; condition: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [resultValue, setResultValue] = useState("");
  const [form, setForm] = useState({
    batchId: "", studyType: "long_term", startDate: "", protocolRef: "",
    conditions: [] as string[],
    timepoints: [0, 3, 6, 9, 12, 18, 24],
    parameters: [BLANK_PARAM()],
  });

  const toggleCondition = (c: string) =>
    setForm((f) => ({
      ...f, conditions: f.conditions.includes(c) ? f.conditions.filter((x) => x !== c) : [...f.conditions, c],
    }));

  const addParam = () => setForm((f) => ({ ...f, parameters: [...f.parameters, BLANK_PARAM()] }));
  const updParam = (i: number, k: string, v: string) =>
    setForm((f) => { const p = [...f.parameters]; p[i] = { ...p[i], [k]: v }; return { ...f, parameters: p }; });

  const submit = async () => {
    if (!form.batchId || !form.startDate || form.conditions.length === 0) {
      toast.error("Batch, start date, and at least one storage condition are required"); return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/stability", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, parameters: form.parameters.filter((p) => p.parameter) }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("Stability study initiated");
      setModal(false);
      setForm({ batchId: "", studyType: "long_term", startDate: "", protocolRef: "", conditions: [], timepoints: [0, 3, 6, 9, 12, 18, 24], parameters: [BLANK_PARAM()] });
      startTransition(() => router.refresh());
    } catch (e: unknown) { toast.error((e as Error).message ?? "Failed"); }
    finally { setLoading(false); }
  };

  const submitResult = async () => {
    if (!resultModal || !resultValue.trim()) { toast.error("Enter a result value"); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/stability/${resultModal.study.id}/results`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parameterId: resultModal.param.id,
          timepointMonths: resultModal.timepoint,
          condition: resultModal.condition,
          result: resultValue,
          verdict: "pass",
          testDate: new Date().toISOString().split("T")[0],
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("Result recorded");
      setResultModal(null); setResultValue("");
      startTransition(() => router.refresh());
    } catch (e: unknown) { toast.error((e as Error).message ?? "Failed"); }
    finally { setLoading(false); }
  };

  const canCreate = ["qc_lab", "qa_regulatory", "management"].includes(user.role);
  const canEnterResults = canCreate;

  return (
    <div>
      <PageHeader
        title="Stability Studies"
        subtitle="ICH Q1A compliant · Zone IVb (Pakistan) — Long-term & Accelerated"
        action={canCreate ? <Btn variant="primary" onClick={() => setModal(true)}>+ New Study</Btn> : undefined}
      />

      {initial.length === 0 ? (
        <Card><EmptyState icon="◑" title="No stability studies initiated" subtitle="Register stability studies for released or development batches to track product quality over time." /></Card>
      ) : initial.map((study) => (
        <Card key={study.id}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#e0ecf8", marginBottom: 4 }}>{study.batch?.product_name}</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                Batch: <span style={{ fontFamily: "monospace", color: "var(--amber)" }}>{study.batch?.batch_no}</span>
                {" · "}Study ID: <span style={{ fontFamily: "monospace", color: "var(--blue)" }}>{study.study_no}</span>
                {" · "}Started: {study.start_date}
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                {study.conditions.map((c) => (
                  <span key={c} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 3, background: "rgba(26,179,192,0.08)", color: "var(--teal)", border: "1px solid rgba(26,179,192,0.2)" }}>{c}</span>
                ))}
              </div>
            </div>
            <Badge value={study.status} />
          </div>

          {/* Results grid */}
          {(study.parameters ?? []).length > 0 && (
            <div style={{ overflowX: "auto", marginTop: 8 }}>
              <table>
                <thead>
                  <tr>
                    <th style={{ ...TH_STYLE, minWidth: 180 }}>Parameter</th>
                    {TIMEPOINTS.map((tp) => (
                      <th key={tp} style={{ ...TH_STYLE, textAlign: "center", minWidth: 60 }}>T={tp}m</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(study.parameters ?? []).map((param) => (
                    <TR key={param.id}>
                      <td style={TD_STYLE}>
                        <div style={{ fontWeight: 600, fontSize: 12 }}>{param.parameter}</div>
                        <div style={{ fontSize: 10, color: "var(--muted)" }}>Spec: {param.specification} {param.unit}</div>
                      </td>
                      {TIMEPOINTS.map((tp) => {
                        const cond = study.conditions[0];
                        const key = `${cond}_T${tp}`;
                        const result = (study.results ?? []).find(
                          (r: Record<string, unknown>) => r.parameter_id === param.id && r.timepoint_months === tp && r.condition === cond
                        ) as Record<string, unknown> | undefined;
                        return (
                          <td key={tp} style={{ ...TD_STYLE, textAlign: "center" }}>
                            {result ? (
                              <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: result.verdict === "pass" ? "var(--accent)" : "var(--red)" }}>
                                {String(result.result)}
                              </span>
                            ) : canEnterResults ? (
                              <button
                                onClick={() => setResultModal({ study, param, timepoint: tp, condition: cond ?? "" })}
                                style={{ background: "transparent", border: "1px dashed var(--border2)", borderRadius: 4, color: "var(--border2)", cursor: "pointer", padding: "2px 6px", fontSize: 10, fontFamily: "inherit" }}
                              >
                                + Add
                              </button>
                            ) : <span style={{ color: "var(--border2)", fontSize: 10 }}>—</span>}
                          </td>
                        );
                      })}
                    </TR>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      ))}

      {/* Result entry modal */}
      {resultModal && (
        <Modal title={`Enter Result — T=${resultModal.timepoint} months`} onClose={() => { setResultModal(null); setResultValue(""); }}>
          <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 14 }}>
            <span style={{ color: "var(--text)", fontWeight: 600 }}>{resultModal.param.parameter}</span>
            {" · "}Spec: {resultModal.param.specification} {resultModal.param.unit}
            {" · "}Condition: {resultModal.condition}
          </div>
          <Field label={`Result (${resultModal.param.unit ?? "value"})`}>
            <input value={resultValue} onChange={(e) => setResultValue(e.target.value)}
              placeholder={`Enter result in ${resultModal.param.unit || "relevant units"}`}
              style={{ width: "100%", padding: "8px 11px", background: "var(--bg)", border: "1px solid var(--border2)", borderRadius: 6, color: "var(--text)", fontSize: 13 }} />
          </Field>
          <Btn variant="primary" loading={loading} onClick={submitResult}>Save Result</Btn>
        </Modal>
      )}

      {/* New study modal */}
      {modal && (
        <Modal title="Initiate Stability Study" onClose={() => setModal(false)} width={700}>
          <Grid cols={2}>
            <Field label="Batch" required>
              <select value={form.batchId} onChange={(e) => setForm((f) => ({ ...f, batchId: e.target.value }))}
                style={{ width: "100%", padding: "8px 11px", background: "var(--bg)", border: "1px solid var(--border2)", borderRadius: 6, color: "var(--text)", fontSize: 13, appearance: "none" }}>
                <option value="">—</option>
                {batches.map((b) => <option key={b.id} value={b.id}>{b.batch_no} · {b.product_name}</option>)}
              </select>
            </Field>
            <Field label="Study Type">
              <select value={form.studyType} onChange={(e) => setForm((f) => ({ ...f, studyType: e.target.value }))}
                style={{ width: "100%", padding: "8px 11px", background: "var(--bg)", border: "1px solid var(--border2)", borderRadius: 6, color: "var(--text)", fontSize: 13, appearance: "none" }}>
                <option value="long_term">Long-Term</option>
                <option value="accelerated">Accelerated</option>
                <option value="intermediate">Intermediate</option>
                <option value="on_going">On-going</option>
              </select>
            </Field>
            <Field label="Study Start Date" required>
              <input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                style={{ width: "100%", padding: "8px 11px", background: "var(--bg)", border: "1px solid var(--border2)", borderRadius: 6, color: "var(--text)", fontSize: 13 }} />
            </Field>
            <Field label="Protocol Reference">
              <input value={form.protocolRef} onChange={(e) => setForm((f) => ({ ...f, protocolRef: e.target.value }))} placeholder="STA-SOP-XXX"
                style={{ width: "100%", padding: "8px 11px", background: "var(--bg)", border: "1px solid var(--border2)", borderRadius: 6, color: "var(--text)", fontSize: 13 }} />
            </Field>
          </Grid>

          <Field label="Storage Conditions (select all that apply)" required>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
              {CONDITIONS.map((c) => (
                <label key={c} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 13, color: "var(--text)" }}>
                  <input type="checkbox" checked={form.conditions.includes(c)} onChange={() => toggleCondition(c)} style={{ accentColor: "var(--accent)", width: 14, height: 14 }} />
                  {c}
                </label>
              ))}
            </div>
          </Field>

          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10, marginTop: 4 }}>Test Parameters</div>
          {form.parameters.map((p, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1.5fr auto", gap: 8, marginBottom: 6, alignItems: "end" }}>
              <Field label={i === 0 ? "Parameter" : ""}><input value={p.parameter} onChange={(e) => updParam(i, "parameter", e.target.value)} placeholder="e.g. Assay%, pH"
                style={{ width: "100%", padding: "8px 11px", background: "var(--bg)", border: "1px solid var(--border2)", borderRadius: 6, color: "var(--text)", fontSize: 13 }} /></Field>
              <Field label={i === 0 ? "Specification" : ""}><input value={p.specification} onChange={(e) => updParam(i, "specification", e.target.value)} placeholder="e.g. 98.0 – 102.0%"
                style={{ width: "100%", padding: "8px 11px", background: "var(--bg)", border: "1px solid var(--border2)", borderRadius: 6, color: "var(--text)", fontSize: 13 }} /></Field>
              <Field label={i === 0 ? "Unit" : ""}><input value={p.unit} onChange={(e) => updParam(i, "unit", e.target.value)} placeholder="%"
                style={{ width: "100%", padding: "8px 11px", background: "var(--bg)", border: "1px solid var(--border2)", borderRadius: 6, color: "var(--text)", fontSize: 13 }} /></Field>
              <Field label={i === 0 ? "Method Ref." : ""}><input value={p.method_ref} onChange={(e) => updParam(i, "method_ref", e.target.value)} placeholder="BP / Ph.Eur."
                style={{ width: "100%", padding: "8px 11px", background: "var(--bg)", border: "1px solid var(--border2)", borderRadius: 6, color: "var(--text)", fontSize: 13 }} /></Field>
              <div style={{ paddingBottom: 14 }}>
                {i > 0 && <button onClick={() => setForm((f) => ({ ...f, parameters: f.parameters.filter((_, x) => x !== i) }))} style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: 5, color: "var(--red)", cursor: "pointer", padding: "7px 9px", fontSize: 12 }}>✕</button>}
              </div>
            </div>
          ))}
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <Btn variant="blue" onClick={addParam}>+ Parameter</Btn>
            <Btn variant="primary" loading={loading} onClick={submit}>Initiate Study</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
