"use client";

import { useState } from "react";
import { Badge, Btn, Card, EmptyState, Modal, PageHeader, TH_STYLE, TD_STYLE, MONO, TR } from "@/components/ui";
import type { AppUser, Batch } from "@/types";

const PROD_STEPS = [
  "Vessel preparation & sanitization",
  "API addition & dissolution",
  "pH adjustment & in-process check",
  "Volume make-up to batch size",
  "Sampling sent to QC for in-process control",
  "Sterile filtration (0.22 µm membrane)",
  "Filling & sealing under LAF / cleanroom",
  "Autoclave / terminal sterilization",
  "Visual inspection — 100% unit inspection",
  "Labelling & finished pack assembly",
];

interface Props { user: AppUser; batches: Batch[]; }

export function ProductionClient({ user, batches }: Props) {
  const [sel, setSel] = useState<Batch | null>(null);

  return (
    <div>
      <PageHeader title="Production Records" subtitle="Manufacturing steps, environmental monitoring & yield tracking" />
      {batches.length === 0 ? (
        <Card><EmptyState icon="⚙" title="No batches in production" subtitle="Batches will appear here once dispensing is completed and approved." /></Card>
      ) : (
        <Card>
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead><tr>
                <th style={TH_STYLE}>Batch No.</th><th style={TH_STYLE}>Product</th>
                <th style={TH_STYLE}>Batch Size</th><th style={TH_STYLE}>Mfg Date</th>
                <th style={TH_STYLE}>Production Status</th><th style={TH_STYLE}>Steps</th>
              </tr></thead>
              <tbody>
                {batches.map((b) => (
                  <TR key={b.id} onClick={() => setSel(b)} clickable>
                    <td style={{ ...TD_STYLE, ...MONO, color: "var(--blue)" }}>{b.batch_no}</td>
                    <td style={TD_STYLE}>{b.product_name}</td>
                    <td style={{ ...TD_STYLE, ...MONO }}>{b.batch_size ?? "—"} {b.batch_size_unit}</td>
                    <td style={{ ...TD_STYLE, ...MONO }}>{b.mfg_date ?? "—"}</td>
                    <td style={TD_STYLE}><Badge value={b.prod_status} /></td>
                    <td style={TD_STYLE}><Btn size="sm" variant="blue" onClick={(e) => { e.stopPropagation(); setSel(b); }}>View Steps</Btn></td>
                  </TR>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {sel && (
        <Modal title={`Production Record — ${sel.batch_no}`} onClose={() => setSel(null)}>
          <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>
            {sel.product_name} · {sel.batch_size} {sel.batch_size_unit} · Mfg: {sel.mfg_date ?? "—"}
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>
            Manufacturing Steps
          </div>
          {PROD_STEPS.map((step, i) => {
            const isDone = sel.prod_status === "done" || (sel.prod_status === "in_progress" && i < 5);
            const isActive = sel.prod_status === "in_progress" && i === 5;
            return (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                borderRadius: 6, marginBottom: 4,
                background: isActive ? "rgba(61,142,247,0.06)" : "#0a1220",
                border: `1px solid ${isActive ? "rgba(61,142,247,0.3)" : "var(--border)"}`,
              }}>
                <span style={{
                  width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 700,
                  background: isDone ? "rgba(31,155,85,0.1)" : isActive ? "rgba(61,142,247,0.1)" : "transparent",
                  color: isDone ? "var(--accent)" : isActive ? "var(--blue)" : "var(--border2)",
                  border: `1px solid ${isDone ? "var(--accent)" : isActive ? "var(--blue)" : "var(--border)"}`,
                }}>
                  {isDone ? "✓" : i + 1}
                </span>
                <span style={{ fontSize: 13, color: isDone ? "var(--text)" : isActive ? "var(--blue)" : "var(--muted)" }}>
                  {step}
                </span>
                {isActive && <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--blue)", fontWeight: 700 }}>● IN PROGRESS</span>}
                {isDone && <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--muted)" }}>Completed</span>}
              </div>
            );
          })}
        </Modal>
      )}
    </div>
  );
}
