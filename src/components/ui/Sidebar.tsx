"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import type { AppUser } from "@/types";
import { MODULE_ACCESS, ROLE_LABELS } from "@/types";

const ALL_NAV = [
  { id: "dashboard",     href: "/dashboard",      label: "Dashboard" },
  { id: "grn",           href: "/grn",             label: "GRN" },
  { id: "dispensing",    href: "/dispensing",      label: "Dispensing" },
  { id: "qc",            href: "/qc",              label: "QC Testing" },
  { id: "bmr",           href: "/bmr",             label: "BMR" },
  { id: "production",    href: "/production",      label: "Production" },
  { id: "finished-goods",href: "/finished-goods",  label: "Finished Goods" },
  { id: "stability",     href: "/stability",       label: "Stability Studies" },
  { id: "release",       href: "/release",         label: "Release" },
  { id: "audit",         href: "/audit",           label: "Audit Trail" },
];

interface SidebarProps { user: AppUser; }

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const allowed = MODULE_ACCESS[user.role] ?? [];
  const nav = ALL_NAV;
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            position: "absolute",
            top: "16px",
            left: "16px",
            background: "#22c55e",
            border: "none",
            color: "#fff",
            padding: "8px 12px",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "18px",
            zIndex: 51,
          }}
        >
          {isOpen ? "✕" : "☰"}
        </button>
      )}

      {/* Sidebar */}
      <aside
        style={{
          width: isMobile ? (isOpen ? 240 : 0) : 240,
          background: "#0f172a",
          color: "#fff",
          borderRight: "1px solid #1e293b",
          display: "flex",
          flexDirection: "column",
          position: isMobile ? "fixed" : "relative",
          height: isMobile ? "100vh" : "auto",
          top: 0,
          left: 0,
          zIndex: 50,
          transition: isMobile ? "width 0.3s ease" : "none",
          overflow: isMobile ? "hidden" : "auto",
        }}
      >
      {/* Brand */}
      <div style={{
        padding: "20px 16px",
        borderBottom: "1px solid #1e293b",
      }}>
        <div style={{
          fontSize: 12,
          fontWeight: "bold",
          letterSpacing: "2px",
          color: "#22c55e",
        }}>
          M.A. Kamil Farma
        </div>
        <div style={{ fontSize: 11, color: "#94a3b8" }}>
          GMP · DRAP Licensed
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: "10px" }}>
        {nav.map((item) => {
          const active =
            pathname === item.href ||
            pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.id}
              href={item.href}
              style={{
                display: "block",
                padding: "10px 12px",
                marginBottom: "6px",
                borderRadius: "6px",
                textDecoration: "none",
                background: active ? "#22c55e" : "transparent",
                color: active ? "#fff" : "#cbd5f5",
                fontSize: "13px",
                fontWeight: active ? "600" : "400",
                transition: "0.2s",
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div style={{
        marginTop: "auto",
        padding: "14px",
        borderTop: "1px solid #1e293b",
      }}>
        <div style={{ fontSize: "13px", fontWeight: "600" }}>
          {user.full_name}
        </div>
        <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "10px" }}>
          {ROLE_LABELS[user.role]}
        </div>

        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "6px",
              background: "#1e293b",
              border: "none",
              borderRadius: "5px",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Sign Out
          </button>
        </form>
      </div>
    </aside>

    {/* Mobile Overlay */}
    {isMobile && isOpen && (
      <div
        onClick={() => setIsOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.5)",
          zIndex: 40,
        }}
      />
    )}
    </>
  );
}
