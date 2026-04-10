"use client";

import React from "react";

// ─── BADGE ────────────────────────────────────────────────────────
const BADGE: Record<string, { c: string; bg: string; label: string }> = {
  done:          { c: "#1f9b55", bg: "rgba(31,155,85,0.1)",   label: "Done" },
  passed:        { c: "#1f9b55", bg: "rgba(31,155,85,0.1)",   label: "Passed" },
  approved:      { c: "#1f9b55", bg: "rgba(31,155,85,0.1)",   label: "Approved" },
  unconditional: { c: "#1f9b55", bg: "rgba(31,155,85,0.1)",   label: "Unconditional" },
  released:      { c: "#1f9b55", bg: "rgba(31,155,85,0.1)",   label: "Released" },
  pass:          { c: "#1f9b55", bg: "rgba(31,155,85,0.1)",   label: "Pass" },
  issued:        { c: "#1f9b55", bg: "rgba(31,155,85,0.1)",   label: "Issued" },
  completed:     { c: "#1ab3c0", bg: "rgba(26,179,192,0.1)",  label: "Completed" },
  ongoing:       { c: "#c9991a", bg: "rgba(201,153,26,0.08)", label: "Ongoing" },
  in_progress:   { c: "#c9991a", bg: "rgba(201,153,26,0.08)", label: "In Progress" },
  qc_pending:    { c: "#c9991a", bg: "rgba(201,153,26,0.08)", label: "QC Pending" },
  submitted:     { c: "#c9991a", bg: "rgba(201,153,26,0.08)", label: "Submitted" },
  under_review:  { c: "#c9991a", bg: "rgba(201,153,26,0.08)", label: "Under Review" },
  conditional:   { c: "#c9991a", bg: "rgba(201,153,26,0.08)", label: "Conditional" },
  pending:       { c: "#4e6a8a", bg: "rgba(78,106,138,0.1)",  label: "Pending" },
  draft:         { c: "#3d8ef7", bg: "rgba(61,142,247,0.08)", label: "Draft" },
  failed:        { c: "#d94040", bg: "rgba(217,64,64,0.08)",  label: "Failed" },
  rejected:      { c: "#d94040", bg: "rgba(217,64,64,0.08)",  label: "Rejected" },
  fail:          { c: "#d94040", bg: "rgba(217,64,64,0.08)",  label: "Fail" },
  superseded:    { c: "#d94040", bg: "rgba(217,64,64,0.08)",  label: "Superseded" },
  open:          { c: "#d94040", bg: "rgba(217,64,64,0.08)",  label: "Open" },
  quarantine:    { c: "#9c6ff0", bg: "rgba(156,111,240,0.08)",label: "Quarantine" },
};

interface BadgeProps { value: string; label?: string; }
export function Badge({ value, label }: BadgeProps) {
  const b = BADGE[value] ?? { c: "#4e6a8a", bg: "rgba(78,106,138,0.1)", label: value };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "2px 8px", borderRadius: 4,
      fontSize: 10, fontWeight: 700, letterSpacing: "0.7px", textTransform: "uppercase",
      color: b.c, background: b.bg, border: `1px solid ${b.c}33`,
      whiteSpace: "nowrap",
    }}>
      {label ?? b.label}
    </span>
  );
}

// ─── BUTTON ───────────────────────────────────────────────────────
interface BtnProps {
  onClick?: (e: React.MouseEvent) => void;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost" | "blue" | "amber";
  size?: "sm" | "md";
  disabled?: boolean;
  type?: "button" | "submit";
  fullWidth?: boolean;
  loading?: boolean;
}
const BTN_STYLES = {
  primary:   { bg: "var(--accent)",  color: "#fff"           },
  secondary: { bg: "rgba(31,155,85,0.1)", color: "var(--accent)" },
  danger:    { bg: "rgba(217,64,64,0.1)", color: "var(--red)"    },
  ghost:     { bg: "transparent",    color: "var(--muted)"   },
  blue:      { bg: "rgba(61,142,247,0.1)", color: "var(--blue)"  },
  amber:     { bg: "rgba(201,153,26,0.1)", color: "var(--amber)" },
};
export function Btn({ onClick, children, variant="secondary", size="md", disabled, type="button", fullWidth, loading }: BtnProps) {
  const st = BTN_STYLES[variant];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        padding: size === "sm" ? "4px 10px" : "7px 16px",
        fontSize: size === "sm" ? 11 : 12,
        fontWeight: 700, cursor: disabled || loading ? "not-allowed" : "pointer",
        border: "none", borderRadius: 6, letterSpacing: "0.3px",
        width: fullWidth ? "100%" : "auto",
        background: disabled ? "var(--border)" : st.bg,
        color: disabled ? "var(--muted)" : st.color,
        opacity: loading ? 0.7 : 1,
        fontFamily: "inherit",
        whiteSpace: "nowrap",
      }}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}

// ─── MODAL ────────────────────────────────────────────────────────
interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: number | string;
}
export function Modal({ title, onClose, children, width = 640 }: ModalProps) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "var(--card)", border: "1px solid var(--border2)",
        borderRadius: 10, width, maxWidth: "96vw", maxHeight: "92vh", overflow: "auto",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "15px 20px", borderBottom: "1px solid var(--border)",
          position: "sticky", top: 0, background: "var(--card)", zIndex: 1,
        }}>
          <span style={{ fontWeight: 700, color: "#e0ecf8", fontSize: 15 }}>{title}</span>
          <button onClick={onClose} style={{
            background: "transparent", border: "none", color: "var(--muted)",
            fontSize: 18, cursor: "pointer", padding: "0 4px", lineHeight: 1,
          }}>✕</button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}

// ─── FORM FIELD ───────────────────────────────────────────────────
interface FieldProps { label: string; children: React.ReactNode; required?: boolean; hint?: string; }
export function Field({ label, children, required, hint }: FieldProps) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{
        display: "block", fontSize: 10, fontWeight: 700,
        color: "var(--muted)", marginBottom: 5,
        letterSpacing: "0.8px", textTransform: "uppercase",
      }}>
        {label}{required && <span style={{ color: "var(--red)", marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {hint && <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

// ─── INPUT ────────────────────────────────────────────────────────
const INPUT_STYLE: React.CSSProperties = {
  width: "100%", padding: "8px 11px",
  background: "var(--bg)", border: "1px solid var(--border2)",
  borderRadius: 6, color: "var(--text)", fontSize: 13,
  outline: "none", fontFamily: "inherit", boxSizing: "border-box",
};
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
export function Input(props: InputProps) {
  return <input {...props} style={{ ...INPUT_STYLE, ...props.style }} />;
}
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}
export function Select({ children, ...props }: SelectProps) {
  return (
    <select {...props} style={{ ...INPUT_STYLE, appearance: "none", ...props.style }}>
      {children}
    </select>
  );
}
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}
export function Textarea(props: TextareaProps) {
  return (
    <textarea {...props} style={{ ...INPUT_STYLE, resize: "vertical", minHeight: 72, ...props.style }} />
  );
}

// ─── GRID ────────────────────────────────────────────────────────
export function Grid({ cols = 2, children }: { cols?: number; children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12 }}>
      {children}
    </div>
  );
}

// ─── TABLE PRIMITIVES ────────────────────────────────────────────
export const TH_STYLE: React.CSSProperties = {
  padding: "8px 12px", textAlign: "left",
  fontSize: 10, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase",
  color: "var(--muted)", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap",
};
export const TD_STYLE: React.CSSProperties = {
  padding: "10px 12px", borderBottom: "1px solid var(--border)",
  fontSize: 13, verticalAlign: "middle",
};
export const MONO: React.CSSProperties = { fontFamily: "Courier New, monospace", fontSize: 12 };

interface TRProps {
  children: React.ReactNode;
  onClick?: () => void;
  clickable?: boolean;
}
export function TR({ children, onClick, clickable }: TRProps) {
  const [hover, setHover] = React.useState(false);
  return (
    <tr
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover && (clickable || onClick) ? "#131f35" : "transparent",
        cursor: (clickable || onClick) ? "pointer" : "default",
        transition: "background 0.1s",
      }}
    >
      {children}
    </tr>
  );
}

// ─── CARD ─────────────────────────────────────────────────────────
export function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: "var(--card)", border: "1px solid var(--border)",
      borderRadius: 8, padding: 20, marginBottom: 16,
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── PAGE HEADER ──────────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }: {
  title: string; subtitle?: string; action?: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#e0ecf8", marginBottom: 3 }}>{title}</h1>
        {subtitle && <p style={{ color: "var(--muted)", fontSize: 13 }}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ─── EMPTY STATE ─────────────────────────────────────────────────
export function EmptyState({ icon, title, subtitle, action }: {
  icon: string; title: string; subtitle: string; action?: React.ReactNode;
}) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--muted)" }}>
      <div style={{ fontSize: 40, marginBottom: 14, opacity: 0.3 }}>{icon}</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, marginBottom: action ? 18 : 0 }}>{subtitle}</div>
      {action}
    </div>
  );
}

// ─── SECTION DIVIDER ─────────────────────────────────────────────
export function Divider({ label }: { label?: string }) {
  return (
    <div style={{
      borderTop: "1px solid var(--border)", margin: "16px 0",
      display: "flex", alignItems: "center", gap: 10,
    }}>
      {label && (
        <span style={{
          fontSize: 10, fontWeight: 700, color: "var(--muted)",
          letterSpacing: "0.8px", textTransform: "uppercase",
          background: "var(--card)", padding: "0 8px", marginTop: -8,
        }}>
          {label}
        </span>
      )}
    </div>
  );
}

// ─── PIPELINE STRIP ──────────────────────────────────────────────
const PIPELINE_STAGES = [
  { key: "grn_status",     label: "GRN"     },
  { key: "disp_status",    label: "Disp."   },
  { key: "bmr_status",     label: "BMR"     },
  { key: "qc_ip_status",   label: "QC-IP"  },
  { key: "prod_status",    label: "Prod."   },
  { key: "fg_status",      label: "FG"      },
  { key: "qc_fr_status",   label: "QC-FR"  },
  { key: "release_status", label: "Release" },
];

export function Pipeline({ batch }: { batch: Record<string, string> }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
      {PIPELINE_STAGES.map((st, i) => {
        const v = batch[st.key] ?? "pending";
        const b = BADGE[v] ?? BADGE.pending;
        return (
          <React.Fragment key={st.key}>
            <span title={st.label} style={{
              fontSize: 9, padding: "2px 5px", borderRadius: 3,
              background: b.bg, color: b.c, border: `1px solid ${b.c}22`,
              whiteSpace: "nowrap",
            }}>
              {st.label}
            </span>
            {i < PIPELINE_STAGES.length - 1 && (
              <span style={{ color: "var(--border2)", fontSize: 9 }}>›</span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── APPROVAL BANNER ─────────────────────────────────────────────
export function ApprovalBanner({ status, approvedBy, approvedAt, comment }: {
  status: string; approvedBy?: string; approvedAt?: string; comment?: string;
}) {
  if (!["approved","rejected"].includes(status)) return null;
  const isApproved = status === "approved";
  return (
    <div style={{
      padding: "10px 14px", borderRadius: 6, marginBottom: 16,
      background: isApproved ? "rgba(31,155,85,0.08)" : "rgba(217,64,64,0.08)",
      border: `1px solid ${isApproved ? "rgba(31,155,85,0.3)" : "rgba(217,64,64,0.3)"}`,
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: isApproved ? "var(--accent)" : "var(--red)", marginBottom: 2 }}>
        {isApproved ? "✓ Approved" : "✗ Rejected"} by {approvedBy}
      </div>
      {approvedAt && <div style={{ fontSize: 11, color: "var(--muted)" }}>{new Date(approvedAt).toLocaleString()}</div>}
      {comment && <div style={{ fontSize: 11, color: "var(--text)", marginTop: 4 }}>{comment}</div>}
    </div>
  );
}

// ─── LOCKED BANNER ───────────────────────────────────────────────
export function LockedBanner() {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "3px 10px", borderRadius: 4, marginLeft: 8,
      background: "rgba(61,142,247,0.08)", border: "1px solid rgba(61,142,247,0.3)",
      fontSize: 10, fontWeight: 700, color: "var(--blue)", letterSpacing: "0.5px",
    }}>
      🔒 LOCKED
    </div>
  );
}

// ─── ATTACHMENT ROW ──────────────────────────────────────────────
export function AttachmentRow({ name, url, uploadedBy, uploadedAt }: {
  name: string; url?: string; uploadedBy?: string; uploadedAt?: string;
}) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "8px 12px", borderRadius: 5,
      background: "rgba(61,142,247,0.04)", border: "1px solid var(--border)",
      marginBottom: 6,
    }}>
      <div>
        <div style={{ fontSize: 12, color: "var(--text)", fontWeight: 500 }}>📎 {name}</div>
        {(uploadedBy || uploadedAt) && (
          <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>
            {uploadedBy} {uploadedAt ? `· ${new Date(uploadedAt).toLocaleDateString()}` : ""}
          </div>
        )}
      </div>
      {url && (
        <a href={url} target="_blank" rel="noreferrer" style={{
          fontSize: 11, color: "var(--blue)", textDecoration: "none",
          padding: "3px 8px", borderRadius: 4,
          background: "rgba(61,142,247,0.08)", border: "1px solid rgba(61,142,247,0.2)",
        }}>
          Open ↗
        </a>
      )}
    </div>
  );
}
