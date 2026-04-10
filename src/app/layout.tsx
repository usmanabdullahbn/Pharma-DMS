import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "MAK Pharma DMS — M.A. Kamil Farma",
  description: "DRAP-Licensed GMP Pharmaceutical Document Management System",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#0c1220",
              color: "#c8d8e8",
              border: "1px solid #1f3050",
              fontSize: "13px",
            },
            success: { iconTheme: { primary: "#1f9b55", secondary: "#0c1220" } },
            error:   { iconTheme: { primary: "#d94040", secondary: "#0c1220" } },
          }}
        />
      </body>
    </html>
  );
}
