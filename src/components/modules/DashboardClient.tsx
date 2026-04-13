"use client";

import { Badge, Card, PageHeader, Pipeline, TH_STYLE, TD_STYLE, MONO, TR, EmptyState } from "@/components/ui";
import { Btn } from "@/components/ui";
import type { AppUser, Batch, DashboardStats, Notification } from "@/types";
import toast from "react-hot-toast";

interface Props {
  user: AppUser;
  batches: Batch[];
  stats: DashboardStats;
  notifications: Notification[];
}

const STAT_CARDS = (s: DashboardStats) => [
  { label: "Total Batches",     value: s.total_batches,    color: "var(--blue)"   },
  { label: "Released",          value: s.released,         color: "var(--accent)" },
  { label: "In Production",     value: s.in_production,    color: "var(--amber)"  },
  { label: "Awaiting Release",  value: s.awaiting_release, color: "var(--purple)" },
];

async function exportPDF(type: "bmr" | "coa" | "release", batchId: string, batchNo: string) {
  const toastId = toast.loading(`Generating ${type.toUpperCase()} PDF...`);
  try {
    const res = await fetch(`/api/pdf/${type}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ batchId }),
    });
    if (!res.ok) throw new Error(await res.text());
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type.toUpperCase()}-${batchNo}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${type.toUpperCase()} exported`, { id: toastId });
  } catch (e) {
    toast.error("Export failed", { id: toastId });
  }
}

export default function DashboardClient({ user, batches, stats, notifications }: Props) {
  const statCards = STAT_CARDS(stats);

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Batch pipeline & system status" />

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        {statCards.map((sc) => (
          <Card key={sc.label} style={{ textAlign: "center", padding: "18px 8px", marginBottom: 0 }}>
            <div style={{ fontSize: 34, fontWeight: 800, color: sc.color, lineHeight: 1 }}>{sc.value}</div>
            <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.5px", marginTop: 5 }}>{sc.label}</div>
          </Card>
        ))}
      </div>

      {/* Pending approvals alert */}
      {notifications.length > 0 && (
        <div style={{
          background: "rgba(201,153,26,0.06)", border: "1px solid rgba(201,153,26,0.25)",
          borderRadius: 8, padding: "12px 16px", marginBottom: 16,
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--amber)", marginBottom: 8 }}>
            ⚠ {notifications.length} pending approval{notifications.length > 1 ? "s" : ""}
          </div>
          {notifications.slice(0, 5).map((n) => (
            <div key={n.id} style={{ fontSize: 12, color: "var(--text)", marginBottom: 3 }}>
              • <span style={{ color: "var(--amber)", fontFamily: "monospace" }}>{n.entity_no}</span>{" "}
              — {n.title}
            </div>
          ))}
          {notifications.length > 5 && (
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
              +{notifications.length - 5} more pending...
            </div>
          )}
        </div>
      )}

      {/* Batch pipeline table */}
      <Card>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#e0ecf8", marginBottom: 16 }}>
          Active Batches — Workflow Pipeline
        </div>
        {batches.length === 0 ? (
          <EmptyState
            icon="⊕"
            title="No batches yet"
            subtitle="Create your first GRN to register a batch and start the documentation pipeline."
          />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th style={TH_STYLE}>Batch No.</th>
                  <th style={TH_STYLE}>Product</th>
                  <th style={TH_STYLE}>Batch Size</th>
                  <th style={TH_STYLE}>Mfg Date</th>
                  <th style={TH_STYLE}>Exp Date</th>
                  <th style={TH_STYLE}>Pipeline</th>
                  <th style={TH_STYLE}>Export PDF</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((b) => (
                  <TR key={b.id}>
                    <td style={{ ...TD_STYLE, ...MONO, color: "var(--blue)" }}>{b.batch_no}</td>
                    <td style={TD_STYLE}>{b.product_name}</td>
                    <td style={{ ...TD_STYLE, ...MONO }}>{b.batch_size ?? "—"} {b.batch_size_unit}</td>
                    <td style={{ ...TD_STYLE, ...MONO }}>{b.mfg_date ?? "—"}</td>
                    <td style={{ ...TD_STYLE, ...MONO }}>{b.exp_date ?? "—"}</td>
                    <td style={{ ...TD_STYLE, paddingTop: 6, paddingBottom: 6 }}>
                      <Pipeline batch={b as unknown as Record<string, string>} />
                    </td>
                    <td style={TD_STYLE}>
                      <div style={{ display: "flex", gap: 5 }}>
                        <Btn size="sm" variant="blue" onClick={() => exportPDF("bmr",     b.id, b.batch_no)}>BMR</Btn>
                        <Btn size="sm" variant="ghost" onClick={() => exportPDF("coa",    b.id, b.batch_no)}
                        >CoA</Btn>
                        <Btn size="sm" variant="secondary" onClick={() => exportPDF("release", b.id, b.batch_no)}>Rel.</Btn>
                      </div>
                    </td>
                  </TR>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
