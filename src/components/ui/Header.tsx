"use client";

import { useState, useEffect, useCallback } from "react";
import type { AppUser, Notification } from "@/types";
import { ROLE_LABELS, CAN_APPROVE } from "@/types";
import { Bell } from "lucide-react";

interface HeaderProps { user: AppUser; }

export default function Header({ user }: HeaderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const canSeeApprovals = CAN_APPROVE.includes(user.role);

  const fetchNotifications = useCallback(async () => {
    if (!canSeeApprovals) return;
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const json = await res.json();
        setNotifications(json.data ?? []);
      }
    } catch {}
  }, [canSeeApprovals]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30_000); // Poll every 30s
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const count = notifications.length;

  return (
    <header style={{
      background: "var(--card)", borderBottom: "1px solid var(--border)",
      padding: "0 24px", height: 54,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      flexShrink: 0,
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", letterSpacing: "1.5px" }}>
        ◈ PHARMA DMS
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* Notification bell */}
        {canSeeApprovals && (
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setOpen((o) => !o)}
              style={{
                position: "relative", background: count > 0 ? "rgba(201,153,26,0.1)" : "transparent",
                border: `1px solid ${count > 0 ? "rgba(201,153,26,0.3)" : "transparent"}`,
                borderRadius: 6, padding: "5px 8px", cursor: "pointer", color: count > 0 ? "var(--amber)" : "var(--muted)",
              }}
            >
              <Bell size={16} />
              {count > 0 && (
                <span style={{
                  position: "absolute", top: -5, right: -5,
                  background: "var(--amber)", color: "#000",
                  borderRadius: "50%", width: 16, height: 16,
                  fontSize: 9, fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </button>

            {open && (
              <div style={{
                position: "absolute", top: 42, right: 0, width: 360,
                background: "var(--card2)", border: "1px solid var(--border2)",
                borderRadius: 8, boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                zIndex: 500, overflow: "hidden",
              }}>
                <div style={{
                  padding: "10px 14px", borderBottom: "1px solid var(--border)",
                  fontSize: 12, fontWeight: 700, color: "var(--text)",
                  display: "flex", justifyContent: "space-between",
                }}>
                  <span>Pending Approvals {count > 0 && <span style={{ color: "var(--amber)" }}>({count})</span>}</span>
                  <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 14 }}>✕</button>
                </div>
                <div style={{ maxHeight: 320, overflow: "auto" }}>
                  {count === 0 ? (
                    <div style={{ padding: 20, textAlign: "center", color: "var(--muted)", fontSize: 12 }}>
                      ✓ No pending approvals
                    </div>
                  ) : notifications.map((n) => (
                    <div key={n.id} style={{
                      padding: "11px 14px", borderBottom: "1px solid var(--border)",
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>
                        {n.title}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>
                        {n.entity_no} · {n.subtitle}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 3 }}>
                        {new Date(n.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* User chip */}
        <div style={{ fontSize: 12, color: "var(--text)" }}>
          <span style={{ color: "var(--muted)" }}>Signed in as </span>
          {user.full_name}
        </div>
        <span style={{
          fontSize: 10, padding: "2px 8px", borderRadius: 3,
          background: "rgba(61,142,247,0.1)", color: "var(--blue)",
          fontWeight: 600, letterSpacing: "0.5px",
        }}>
          {ROLE_LABELS[user.role]}
        </span>
      </div>
    </header>
  );
}
