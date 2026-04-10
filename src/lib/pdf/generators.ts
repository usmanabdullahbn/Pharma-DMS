import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth, isAuthResponse } from "@/lib/auth";

// We use a lightweight HTML-to-PDF approach that works in serverless
// Developer can swap to Puppeteer or @react-pdf/renderer for pixel-perfect output

const COMPANY = process.env.NEXT_PUBLIC_COMPANY_NAME ?? "M.A. Kamil Farma (Pvt.) Ltd.";
const DRAP    = process.env.NEXT_PUBLIC_DRAP_LICENSE   ?? "DRAP License No. VET-MFG-XXXX";

const BASE_CSS = `
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#111;padding:24px;background:#fff}
  .hdr{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #000;padding-bottom:10px;margin-bottom:14px}
  .co{font-size:15px;font-weight:700}.sub{font-size:9px;color:#555;margin-top:2px}
  .doc-title{font-size:13px;font-weight:700;text-align:center;background:#f0f0f0;padding:6px;border:1px solid #bbb;margin-bottom:14px;letter-spacing:.8px}
  h3{font-size:10px;font-weight:700;border-bottom:1px solid #ccc;padding-bottom:3px;margin:14px 0 6px;letter-spacing:.5px;text-transform:uppercase}
  table{width:100%;border-collapse:collapse;margin-bottom:10px;font-size:10px}
  th{background:#e5e5e5;padding:4px 7px;border:1px solid #bbb;font-weight:700;text-align:left}
  td{padding:3px 7px;border:1px solid #bbb;vertical-align:top}
  .grid2{display:grid;grid-template-columns:1fr 1fr;gap:6px 16px;margin-bottom:12px}
  .kv label{font-size:8px;color:#555;font-weight:700;text-transform:uppercase;letter-spacing:.4px}
  .kv span{display:block;font-size:11px;font-weight:600;margin-top:1px}
  .pass{color:#1a7a38;font-weight:700}.fail{color:#c00;font-weight:700}
  .sig-row{display:flex;gap:16px;margin-top:22px}
  .sig-box{flex:1;border-top:1px solid #000;padding-top:5px;font-size:9px;color:#555}
  .footer{margin-top:18px;border-top:1px solid #ccc;padding-top:6px;font-size:9px;color:#888;display:flex;justify-content:space-between}
  .verdict-box{padding:10px;border:2px solid #ccc;background:#f9f9f9;margin:10px 0;text-align:center;font-weight:700;font-size:12px}
  .pass-box{border-color:#2d8a48;background:#e8f5e8;color:#1a5c30}
  .fail-box{border-color:#c00;background:#ffeaea;color:#900}
`;

function wrapHTML(title: string, body: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
  <style>${BASE_CSS}</style></head><body>
  ${body}
  <div class="footer"><span>${COMPANY} · ${DRAP}</span><span>Generated: ${new Date().toLocaleString()}</span></div>
  </body></html>`;
}

// ─── BMR PDF ──────────────────────────────────────────────────────
export async function POST_BMR_PDF(req: NextRequest) {
  const auth = await requireAuth();
  if (isAuthResponse(auth)) return auth;

  const { batchId } = await req.json();
  const supabase = createClient();

  const [batchRes, grnRes, dispRes, bmrRes] = await Promise.all([
    supabase.from("batches").select("*").eq("id", batchId).single(),
    supabase.from("grns").select("*, items:grn_items(*)").eq("batch_id", batchId),
    supabase.from("dispensing_records").select("*, items:dispensing_items(*)").eq("batch_id", batchId),
    supabase.from("bmrs").select("*, sections:bmr_sections(*)").eq("batch_id", batchId).order("created_at", { ascending: false }).limit(1).single(),
  ]);

  const batch = batchRes.data;
  const bmr   = bmrRes.data;
  if (!batch) return NextResponse.json({ error: "Batch not found" }, { status: 404 });

  const grnRows = (grnRes.data ?? []).flatMap((g) =>
    (g.items ?? []).map((i: Record<string, unknown>) =>
      `<tr><td>${g.grn_no}</td><td>${i.material_name}</td><td>${i.quantity} ${i.unit}</td><td>${i.supplier_lot_no ?? "—"}</td><td>${i.exp_date ?? "—"}</td><td>${i.coa_reference ?? "—"}</td></tr>`
    )
  ).join("") || `<tr><td colspan="6" style="color:#888;font-style:italic">No GRN records</td></tr>`;

  const dispRows = (dispRes.data ?? []).flatMap((d) =>
    (d.items ?? []).map((i: Record<string, unknown>) => {
      const dev = ((i.dispensed_qty as number) - (i.required_qty as number)).toFixed(3);
      const ok = i.deviation_acceptable !== false;
      return `<tr><td>${d.disp_no}</td><td>${i.material_name}</td><td>${i.required_qty}</td><td><strong>${i.dispensed_qty}</strong></td><td>${i.unit}</td><td>${parseFloat(dev) >= 0 ? "+" : ""}${dev}</td><td class="${ok ? "pass" : "fail"}">${ok ? "OK" : "DEVIATION"}</td></tr>`;
    })
  ).join("") || `<tr><td colspan="7" style="color:#888;font-style:italic">No dispensing records</td></tr>`;

  const sectionRows = (bmr?.sections ?? []).sort((a: Record<string,number>, b: Record<string,number>) => a.sort_order - b.sort_order).map((s: Record<string,unknown>) =>
    `<tr><td>${s.section_title}</td><td style="text-align:center">${s.is_completed ? "✓" : ""}</td><td>${s.operator_sign ?? ""}</td><td>${s.completed_at ? new Date(s.completed_at as string).toLocaleDateString() : ""}</td></tr>`
  ).join("");

  const html = wrapHTML(`BMR — ${batch.batch_no}`, `
    <div class="hdr">
      <div><div class="co">${COMPANY}</div><div class="sub">${DRAP}</div></div>
      <div style="text-align:right;font-size:10px">
        <div>Document Type: BATCH MANUFACTURING RECORD</div>
        <div>Batch No.: <strong>${batch.batch_no}</strong></div>
        <div>BMR Ref.: ${bmr?.bmr_no ?? "—"} · Version: ${bmr?.version ?? "—"}</div>
      </div>
    </div>
    <div class="doc-title">BATCH MANUFACTURING RECORD (EXECUTED)</div>
    <div class="grid2">
      <div class="kv"><label>Product Name</label><span>${batch.product_name}</span></div>
      <div class="kv"><label>Batch No.</label><span>${batch.batch_no}</span></div>
      <div class="kv"><label>Batch Size</label><span>${batch.batch_size ?? "—"} ${batch.batch_size_unit}</span></div>
      <div class="kv"><label>Date of Manufacture</label><span>${batch.mfg_date ?? "—"}</span></div>
      <div class="kv"><label>Date of Expiry</label><span>${batch.exp_date ?? "—"}</span></div>
      <div class="kv"><label>Formula Reference</label><span>${bmr?.formula_ref ?? "—"}</span></div>
    </div>
    <h3>Section A — Goods Receipt (Raw Materials)</h3>
    <table><thead><tr><th>GRN No.</th><th>Material</th><th>Qty</th><th>Lot No.</th><th>Exp Date</th><th>COA Ref.</th></tr></thead><tbody>${grnRows}</tbody></table>
    <h3>Section B — Dispensing Record</h3>
    <table><thead><tr><th>Disp. No.</th><th>Material</th><th>Required</th><th>Dispensed</th><th>Unit</th><th>Deviation</th><th>Status</th></tr></thead><tbody>${dispRows}</tbody></table>
    <h3>Section C — BMR Execution Checklist</h3>
    <table><thead><tr><th style="width:60%">Section</th><th style="width:8%">Done</th><th>Operator</th><th>Date</th></tr></thead><tbody>${sectionRows}</tbody></table>
    <div class="sig-row">
      <div class="sig-box">Production Operator<br><br>Name: ___________________<br>Signature: ___________________<br>Date / Time: ___________________</div>
      <div class="sig-box">Production Supervisor<br><br>Name: ___________________<br>Signature: ___________________<br>Date / Time: ___________________</div>
      <div class="sig-box">QA Officer (Review)<br><br>Name: ___________________<br>Signature: ___________________<br>Date / Time: ___________________</div>
    </div>
  `);

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="BMR-${batch.batch_no}.html"`,
    },
  });
}

// ─── CoA PDF ──────────────────────────────────────────────────────
export async function POST_COA_PDF(req: NextRequest) {
  const auth = await requireAuth();
  if (isAuthResponse(auth)) return auth;

  const { batchId } = await req.json();
  const supabase = createClient();

  const [batchRes, qcRes, relRes] = await Promise.all([
    supabase.from("batches").select("*").eq("id", batchId).single(),
    supabase.from("qc_records").select("*, test_results:qc_test_results(*)").eq("batch_id", batchId).order("created_at", { ascending: false }),
    supabase.from("release_records").select("*").eq("batch_id", batchId).limit(1).single(),
  ]);

  const batch = batchRes.data;
  if (!batch) return NextResponse.json({ error: "Batch not found" }, { status: 404 });

  const ipTests  = (qcRes.data ?? []).filter((q) => q.test_type === "in_process");
  const frTests  = (qcRes.data ?? []).filter((q) => q.test_type === "final_release");
  const allPass  = [...ipTests, ...frTests].every((q) => q.conclusion === "pass");

  const renderTestRows = (recs: Record<string, unknown>[]) =>
    recs.length === 0
      ? `<tr><td colspan="5" style="color:#888;font-style:italic">No records</td></tr>`
      : recs.flatMap((rec) =>
          ((rec.test_results ?? []) as Record<string, unknown>[]).map((t) =>
            `<tr><td>${t.parameter}</td><td>${t.specification}</td><td><strong>${t.result ?? "—"}</strong></td><td>${t.unit ?? "—"}</td><td class="${t.verdict === "pass" ? "pass" : "fail"}">${String(t.verdict ?? "").toUpperCase()}</td></tr>`
          )
        ).join("");

  const html = wrapHTML(`CoA — ${batch.batch_no}`, `
    <div class="hdr">
      <div><div class="co">${COMPANY}</div><div class="sub">${DRAP}</div></div>
      <div style="text-align:right;font-size:10px">
        <div>Document Type: CERTIFICATE OF ANALYSIS</div>
        <div>Batch No.: <strong>${batch.batch_no}</strong></div>
        <div>Issue Date: ${new Date().toLocaleDateString()}</div>
      </div>
    </div>
    <div class="doc-title">CERTIFICATE OF ANALYSIS</div>
    <div class="grid2">
      <div class="kv"><label>Product Name</label><span>${batch.product_name}</span></div>
      <div class="kv"><label>Batch No.</label><span>${batch.batch_no}</span></div>
      <div class="kv"><label>Batch Size</label><span>${batch.batch_size ?? "—"} ${batch.batch_size_unit}</span></div>
      <div class="kv"><label>Date of Manufacture</label><span>${batch.mfg_date ?? "—"}</span></div>
      <div class="kv"><label>Date of Expiry</label><span>${batch.exp_date ?? "—"}</span></div>
      <div class="kv"><label>Storage Conditions</label><span>Store below 25°C, protect from light</span></div>
    </div>
    <h3>In-Process Quality Control Results</h3>
    <table><thead><tr><th>Test Parameter</th><th>Specification</th><th>Result</th><th>Unit</th><th>Verdict</th></tr></thead><tbody>${renderTestRows(ipTests)}</tbody></table>
    <h3>Final Release Quality Control Results</h3>
    <table><thead><tr><th>Test Parameter</th><th>Specification</th><th>Result</th><th>Unit</th><th>Verdict</th></tr></thead><tbody>${renderTestRows(frTests)}</tbody></table>
    <div class="verdict-box ${allPass ? "pass-box" : "fail-box"}">
      ${allPass ? "✓ BATCH COMPLIES WITH ALL SPECIFICATIONS — CERTIFIED FOR RELEASE" : "✗ BATCH DOES NOT COMPLY — INVESTIGATION / DEVIATION REQUIRED"}
    </div>
    <div class="sig-row">
      <div class="sig-box">Analyst<br><br>Name: ___________________<br>Signature: ___________________<br>Date: ___________________</div>
      <div class="sig-box">QC Supervisor<br><br>Name: ___________________<br>Signature: ___________________<br>Date: ___________________</div>
      <div class="sig-box">QA Officer (Authorisation)<br><br>Name: ___________________<br>Signature: ___________________<br>Date: ___________________</div>
    </div>
  `);

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="CoA-${batch.batch_no}.html"`,
    },
  });
}

// ─── RELEASE CERTIFICATE ─────────────────────────────────────────
export async function POST_RELEASE_PDF(req: NextRequest) {
  const auth = await requireAuth();
  if (isAuthResponse(auth)) return auth;

  const { batchId } = await req.json();
  const supabase = createClient();

  const [batchRes, relRes] = await Promise.all([
    supabase.from("batches").select("*").eq("id", batchId).single(),
    supabase.from("release_records").select("*").eq("batch_id", batchId).order("created_at", { ascending: false }).limit(1).single(),
  ]);

  const batch = batchRes.data;
  const rel   = relRes.data;
  if (!batch) return NextResponse.json({ error: "Batch not found" }, { status: 404 });

  const isUnconditional = rel?.release_type === "unconditional";

  const html = wrapHTML(`Release Certificate — ${batch.batch_no}`, `
    <div class="hdr">
      <div><div class="co">${COMPANY}</div><div class="sub">${DRAP}</div></div>
      <div style="text-align:right;font-size:10px">
        <div>Document Type: BATCH RELEASE CERTIFICATE</div>
        <div>Batch No.: <strong>${batch.batch_no}</strong></div>
        <div>Release Ref.: ${rel?.release_no ?? "PENDING"}</div>
      </div>
    </div>
    <div class="doc-title">${isUnconditional ? "UNCONDITIONAL" : "CONDITIONAL"} BATCH RELEASE CERTIFICATE</div>
    <div class="grid2">
      <div class="kv"><label>Product Name</label><span>${batch.product_name}</span></div>
      <div class="kv"><label>Batch No.</label><span>${batch.batch_no}</span></div>
      <div class="kv"><label>Batch Size</label><span>${batch.batch_size ?? "—"} ${batch.batch_size_unit}</span></div>
      <div class="kv"><label>Date of Manufacture</label><span>${batch.mfg_date ?? "—"}</span></div>
      <div class="kv"><label>Date of Expiry</label><span>${batch.exp_date ?? "—"}</span></div>
      <div class="kv"><label>Release Date</label><span>${rel?.release_date ?? "—"}</span></div>
      <div class="kv"><label>DRAP Reference</label><span>${rel?.drap_ref ?? "—"}</span></div>
      <div class="kv"><label>Issued By</label><span>${rel?.issued_by_name ?? "—"}</span></div>
    </div>
    <h3>Release Decision</h3>
    <div class="verdict-box ${isUnconditional ? "pass-box" : ""}" style="${!isUnconditional ? "border-color:#c9991a;background:#fff9e8;color:#7a5500" : ""}">
      ${rel
        ? `${isUnconditional ? "UNCONDITIONAL RELEASE" : "CONDITIONAL RELEASE"}<br>
           <span style="font-weight:400;font-size:10px">This batch has been reviewed and found to comply with all applicable specifications${isUnconditional ? "." : " subject to the stated conditions."}</span>`
        : `<span style="font-weight:400;font-style:italic">No release decision recorded. This is a draft document pending QA authorisation.</span>`
      }
    </div>
    ${rel?.conditions ? `<div style="padding:8px 12px;border:1px solid #bbb;margin-bottom:10px;font-size:10px"><strong>Conditions of Release:</strong><br>${rel.conditions}</div>` : ""}
    <div style="padding:8px 12px;border:1px solid #bbb;background:#f9f9f9;font-size:10px;margin-bottom:10px">
      This certificate is generated in accordance with DRAP/GMP requirements. The batch has been manufactured, tested and reviewed as per approved procedures and current specifications.
    </div>
    <div class="sig-row">
      <div class="sig-box">Person Responsible for Release (QA)<br><br>Name: ${rel?.issued_by_name ?? "___________________"}<br>Signature: ___________________<br>Date: ${rel?.release_date ?? "___________________"}</div>
      <div class="sig-box">Plant Manager / Director<br><br>Name: ___________________<br>Signature: ___________________<br>Date: ___________________</div>
    </div>
  `);

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="ReleaseCert-${batch.batch_no}.html"`,
    },
  });
}
