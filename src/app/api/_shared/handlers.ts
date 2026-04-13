import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthResponse } from "@/lib/auth";
import {
  qcRecords,
  qcTestResults,
  bmrs,
  bmrSections,
  finishedGoods,
  stabilityStudies,
  stabilityParameters,
  stabilityResults,
  releaseRecords,
  auditLog,
  batches,
  grns,
  grnItems,
  dispensing,
  production,
  notifications,
} from "@/lib/dummyData";

// ═══════════ QC RECORDS ═══════════
export async function GET_QC(req: NextRequest) {
  const auth = await requireAuth();
  if (isAuthResponse(auth)) return auth;

  // Return QC records with related test results and batch info
  const data = qcRecords.map((record) => ({
    ...record,
    test_results: qcTestResults.filter((tr) => tr.qc_record_id === record.id),
    batch: batches.find((b) => b.id === record.batch_id),
  }));

  return NextResponse.json({ data });
}

export async function POST_QC(req: NextRequest) {
  const auth = await requireAuth(["qc_lab", "qa_regulatory", "management"]);
  if (isAuthResponse(auth)) return auth;
  const { user } = auth;
  const body = await req.json();

  const year = new Date().getFullYear().toString().slice(-2);
  const qcNo = `QC-${year}${String(qcRecords.length + 1).padStart(4, "0")}`;
  const conclusion = body.tests?.every((t: Record<string, string>) => t.verdict === "pass") ? "pass" : "fail";

  const record = {
    id: `qc-${Date.now()}`,
    qc_no: qcNo,
    batch_id: body.batchId,
    test_type: body.testType,
    test_date: body.testDate,
    analyst_name: body.analystName,
    analyst_id: user.id,
    conclusion: conclusion as any,
    status: "submitted" as const,
    submitted_by: user.id,
    submitted_at: new Date().toISOString(),
    is_locked: false,
    created_by: user.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as const;

  qcRecords.push(record);

  // Add test results
  if (body.tests?.length) {
    body.tests.forEach((t: Record<string, unknown>, i: number) => {
      qcTestResults.push({
        id: `qtr-${Date.now()}-${i}`,
        qc_record_id: record.id,
        test_name: t.test_name || "",
        specification: t.specification || "",
        result: t.result || "",
        verdict: t.verdict || "fail",
        sort_order: i,
      });
    });
  }

  // Update batch status
  const batch = batches.find((b) => b.id === body.batchId);
  if (batch) {
    const statusCol = body.testType === "final_release" ? "qc_fr_status" : "qc_ip_status";
    Object.assign(batch, {
      [statusCol]: conclusion === "pass" ? "passed" : "failed",
    });
  }

  return NextResponse.json({ data: record }, { status: 201 });
}

// ═══════════ BMR ═══════════
export async function GET_BMR() {
  const auth = await requireAuth();
  if (isAuthResponse(auth)) return auth;

  const data = bmrs.map((bmr) => ({
    ...bmr,
    sections: bmrSections.filter((s) => s.bmr_id === bmr.id),
    batch: batches.find((b) => b.id === bmr.batch_id),
  }));

  return NextResponse.json({ data });
}

export async function POST_BMR(req: NextRequest) {
  const auth = await requireAuth(["production", "qa_regulatory", "management"]);
  if (isAuthResponse(auth)) return auth;
  const { user } = auth;
  const body = await req.json();

  const year = new Date().getFullYear().toString().slice(-2);
  const bmrNo = `BMR-${year}${String((bmrs.length + 1).padStart(4, "0"))}`;

  const record = {
    id: `bmr-${Date.now()}`,
    bmr_no: bmrNo,
    batch_id: body.batchId,
    version: body.version ?? "v1.0",
    formula_ref: body.formulaRef || null,
    status: "draft",
    is_locked: false,
    created_by: user.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  bmrs.push(record);

  // Add default sections
  const DEFAULT_SECTIONS = [
    "1. Batch Identification & Traceability",
    "2. Formula & Theoretical Composition",
    "3. Equipment, Utensils & Cleaning Records",
    "4. Manufacturing Procedure (Step-by-step)",
    "5. In-Process Controls & Checkpoints",
    "6. Environmental Monitoring Data",
    "7. Yield Calculation & Reconciliation",
    "8. Deviation Log",
    "9. Packaging & Labelling Instructions",
    "10. Authorised Signatures & Sign-offs",
  ];

  DEFAULT_SECTIONS.forEach((title, i) => {
    bmrSections.push({
      id: `bmrs-${Date.now()}-${i}`,
      bmr_id: record.id,
      section_no: String(i + 1),
      section_title: title,
      content: "",
      is_completed: false,
      sort_order: i,
    });
  });

  // Update batch status
  const batch = batches.find((b) => b.id === body.batchId);
  if (batch) {
    batch.bmr_status = "draft";
  }

  return NextResponse.json({ data: record }, { status: 201 });
}

// ═══════════ FINISHED GOODS ═══════════
export async function GET_FG() {
  const auth = await requireAuth();
  if (isAuthResponse(auth)) return auth;

  const data = finishedGoods.map((fg) => ({
    ...fg,
    batch: batches.find((b) => b.id === fg.batch_id),
  }));

  return NextResponse.json({ data });
}

export async function POST_FG(req: NextRequest) {
  const auth = await requireAuth(["production", "qa_regulatory", "management"]);
  if (isAuthResponse(auth)) return auth;
  const { user } = auth;
  const body = await req.json();

  const year = new Date().getFullYear().toString().slice(-2);
  const fgNo = `FG-${year}${String((finishedGoods.length + 1).padStart(4, "0"))}`;

  const record = {
    id: `fg-${Date.now()}`,
    fg_no: fgNo,
    batch_id: body.batchId,
    date_entered: body.date,
    actual_qty: parseFloat(body.qty) || null,
    unit: body.unit || null,
    yield_pct: parseFloat(body.yieldPct) || null,
    pack_format: body.packFormat || null,
    total_units: parseInt(body.totalUnits) || null,
    storage_location: body.storageLocation || null,
    status: "qc_pending",
    entered_by: user.id,
    entered_by_name: body.enteredBy || user.full_name,
    created_at: new Date().toISOString(),
  };

  finishedGoods.push(record);

  // Update batch status
  const batch = batches.find((b) => b.id === body.batchId);
  if (batch) {
    batch.fg_status = "done";
  }

  return NextResponse.json({ data: record }, { status: 201 });
}

// ═══════════ STABILITY ═══════════
export async function GET_STABILITY() {
  const auth = await requireAuth();
  if (isAuthResponse(auth)) return auth;

  const data = stabilityStudies.map((study) => ({
    ...study,
    parameters: stabilityParameters.filter((p) => p.study_id === study.id),
    results: stabilityResults.filter((r) => r.study_id === study.id),
    batch: batches.find((b) => b.id === study.batch_id),
  }));

  return NextResponse.json({ data });
}

export async function POST_STABILITY(req: NextRequest) {
  const auth = await requireAuth(["qc_lab", "qa_regulatory", "management"]);
  if (isAuthResponse(auth)) return auth;
  const { user } = auth;
  const body = await req.json();

  const year = new Date().getFullYear().toString().slice(-2);
  const studyNo = `STAB-${year}${String((stabilityStudies.length + 1).padStart(4, "0"))}`;

  const study = {
    id: `stab-${Date.now()}`,
    study_no: studyNo,
    batch_id: body.batchId,
    study_type: body.studyType ?? "long_term",
    start_date: body.startDate,
    protocol_ref: body.protocolRef || null,
    conditions: body.conditions ?? [],
    planned_timepoints: body.timepoints ?? [0, 3, 6, 9, 12, 18, 24],
    status: "ongoing",
    created_by: user.id,
    created_at: new Date().toISOString(),
  };

  stabilityStudies.push(study);

  // Add parameters
  if (body.parameters?.length) {
    body.parameters.forEach((p: Record<string, unknown>, i: number) => {
      stabilityParameters.push({
        id: `stap-${Date.now()}-${i}`,
        study_id: study.id,
        parameter_name: (p.parameter_name as string) || "",
        specification: (p.specification as string) || "",
        sort_order: i,
      });
    });
  }

  return NextResponse.json({ data: study }, { status: 201 });
}

// ═══════════ RELEASE ═══════════
export async function GET_RELEASE() {
  const auth = await requireAuth();
  if (isAuthResponse(auth)) return auth;

  const data = releaseRecords.map((record) => ({
    ...record,
    batch: batches.find((b) => b.id === record.batch_id),
  }));

  return NextResponse.json({ data });
}

export async function POST_RELEASE(req: NextRequest) {
  const auth = await requireAuth(["qa_regulatory", "management"]);
  if (isAuthResponse(auth)) return auth;
  const { user } = auth;
  const body = await req.json();

  const year = new Date().getFullYear().toString().slice(-2);
  const relNo = `REL-${year}${String((releaseRecords.length + 1).padStart(4, "0"))}`;

  const record = {
    id: `rel-${Date.now()}`,
    release_no: relNo,
    batch_id: body.batchId,
    qc_record_id: body.qcRecordId || null,
    release_type: body.releaseType,
    release_date: body.releaseDate,
    conditions: body.conditions || null,
    issued_by: user.id,
    issued_by_name: body.issuedByName || user.full_name,
    drap_ref: body.drapRef || null,
    status: "issued",
    created_at: new Date().toISOString(),
  };

  releaseRecords.push(record);

  // Update batch status
  const batch = batches.find((b) => b.id === body.batchId);
  if (batch) {
    batch.release_status =
      body.releaseType === "unconditional" ? "released" : "conditional";
    batch.current_stage = "release";
  }

  return NextResponse.json({ data: record }, { status: 201 });
}

// ═══════════ AUDIT ═══════════
export async function GET_AUDIT(req: NextRequest) {
  const auth = await requireAuth(["qa_regulatory", "management"]);
  if (isAuthResponse(auth)) return auth;

  const { searchParams } = new URL(req.url);
  const entityType = searchParams.get("entityType");
  const entityId = searchParams.get("entityId");
  const limit = parseInt(searchParams.get("limit") ?? "100");

  let data = [...auditLog];

  if (entityType) {
    data = data.filter((a) => a.entity_type === entityType);
  }
  if (entityId) {
    data = data.filter((a) => a.entity_id === entityId);
  }

  data = data
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);

  return NextResponse.json({ data });
}

// ═══════════ GRN (GOODS RECEIVED NOTES) ═══════════
export async function GET_GRN() {
  const auth = await requireAuth();
  if (isAuthResponse(auth)) return auth;

  const data = grns.map((grn) => ({
    ...grn,
    items: grnItems.filter((item) => item.grn_id === grn.id),
    batch: batches.find((b) => b.id === grn.batch_id),
  }));

  return NextResponse.json({ data });
}

export async function POST_GRN(req: NextRequest) {
  const auth = await requireAuth(["warehouse", "qa_regulatory", "management"]);
  if (isAuthResponse(auth)) return auth;
  const { user } = auth;
  const body = await req.json();

  const year = new Date().getFullYear().toString().slice(-2);
  const grnNo = `GRN-${year}${String((grns.length + 1).padStart(4, "0"))}`;

  const record = {
    id: `grn-${Date.now()}`,
    grn_no: grnNo,
    batch_id: body.batchId,
    supplier: body.supplier,
    received_date: body.receivedDate,
    received_by: user.id,
    received_by_name: body.receivedByName || user.full_name,
    quantity: parseFloat(body.quantity) || 0,
    unit: body.unit,
    status: "pending",
    approved_by: null,
    approval_date: null,
    is_locked: false,
    created_at: new Date().toISOString(),
  };

  grns.push(record);

  // Add items
  if (body.items?.length) {
    body.items.forEach((item: Record<string, unknown>, i: number) => {
      grnItems.push({
        id: `grni-${Date.now()}-${i}`,
        grn_id: record.id,
        item_no: i + 1,
        material_code: (item.material_code as string) || "",
        material_name: (item.material_name as string) || "",
        specification: (item.specification as string) || "",
        received_qty: parseFloat((item.received_qty as string) || "0") || 0,
        unit: (item.unit as string) || "",
        accepted_qty: parseFloat((item.accepted_qty as string) || "0") || 0,
        rejected_qty: parseFloat((item.rejected_qty as string) || "0") || 0,
        batch_no: (item.batch_no as string) || "",
        expiry_date: (item.expiry_date as string) || "",
        certificate_of_analysis: (item.certificate_of_analysis as string) || "",
        status: "accepted",
        sort_order: i,
      });
    });
  }

  // Update batch status
  const batch = batches.find((b) => b.id === body.batchId);
  if (batch) {
    batch.grn_status = "done";
  }

  return NextResponse.json({ data: record }, { status: 201 });
}

// ═══════════ DISPENSING ═══════════
export async function GET_DISPENSING() {
  const auth = await requireAuth();
  if (isAuthResponse(auth)) return auth;

  const data = dispensing.map((disp) => ({
    ...disp,
    batch: batches.find((b) => b.id === disp.batch_id),
  }));

  return NextResponse.json({ data });
}

export async function POST_DISPENSING(req: NextRequest) {
  const auth = await requireAuth(["warehouse", "production", "management"]);
  if (isAuthResponse(auth)) return auth;
  const { user } = auth;
  const body = await req.json();

  const year = new Date().getFullYear().toString().slice(-2);
  const dispatchNo = `DISP-${year}${String((dispensing.length + 1).padStart(4, "0"))}`;

  const record = {
    id: `disp-${Date.now()}`,
    dispensing_no: dispatchNo,
    batch_id: body.batchId,
    dispatch_date: body.dispatchDate,
    dispatched_by: user.id,
    dispatched_by_name: body.dispatchedByName || user.full_name,
    received_by: body.receivedBy || null,
    received_by_name: body.receivedByName || null,
    quantity: parseFloat(body.quantity) || 0,
    unit: body.unit,
    status: "completed",
    location_from: body.locationFrom || null,
    location_to: body.locationTo || null,
    created_at: new Date().toISOString(),
  };

  dispensing.push(record);

  // Update batch status
  const batch = batches.find((b) => b.id === body.batchId);
  if (batch) {
    batch.dispensing_status = "done";
  }

  return NextResponse.json({ data: record }, { status: 201 });
}

// ═══════════ PRODUCTION ═══════════
export async function GET_PRODUCTION() {
  const auth = await requireAuth();
  if (isAuthResponse(auth)) return auth;

  const data = production.map((prod) => ({
    ...prod,
    batch: batches.find((b) => b.id === prod.batch_id),
  }));

  return NextResponse.json({ data });
}

export async function POST_PRODUCTION(req: NextRequest) {
  const auth = await requireAuth(["production", "management"]);
  if (isAuthResponse(auth)) return auth;
  const { user } = auth;
  const body = await req.json();

  const year = new Date().getFullYear().toString().slice(-2);
  const prodNo = `PROD-${year}${String((production.length + 1).padStart(4, "0"))}`;

  const record = {
    id: `prod-${Date.now()}`,
    production_no: prodNo,
    batch_id: body.batchId,
    start_date: body.startDate,
    end_date: body.endDate || null,
    shift_lead: user.id,
    shift_lead_name: body.shiftLeadName || user.full_name,
    status: "in_progress",
    line_used: body.lineUsed || "Line A",
    notes: body.notes || "",
    created_at: new Date().toISOString(),
  };

  production.push(record);

  // Update batch status
  const batch = batches.find((b) => b.id === body.batchId);
  if (batch) {
    batch.production_status = "in_progress";
  }

  return NextResponse.json({ data: record }, { status: 201 });
}

// ═══════════ NOTIFICATIONS ═══════════
export async function GET_NOTIFICATIONS(req: NextRequest) {
  const auth = await requireAuth();
  if (isAuthResponse(auth)) return auth;

  const { searchParams } = new URL(req.url);
  const isRead = searchParams.get("isRead");

  let data = notifications.filter((n) => n.user_id === auth.user.id);

  if (isRead !== null) {
    const readFilter = isRead === "true";
    data = data.filter((n) => n.is_read === readFilter);
  }

  data = data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return NextResponse.json({ data });
}

// ═══════════ DASHBOARD ═══════════
export async function GET_DASHBOARD() {
  const auth = await requireAuth();
  if (isAuthResponse(auth)) return auth;

  const totalBatches = batches.length;
  const completedBatches = batches.filter((b) => b.status === "complete").length;
  const inProgressBatches = batches.filter((b) => b.status === "in_progress").length;
  const pendingBatches = batches.filter((b) => b.status === "pending").length;

  const qcPending = qcRecords.filter((q) => q.status === "submitted").length;
  const qcApproved = qcRecords.filter((q) => q.status === "approved").length;

  const productionRunning = production.filter((p) => p.status === "in_progress").length;

  return NextResponse.json({
    data: {
      stats: {
        totalBatches,
        completedBatches,
        inProgressBatches,
        pendingBatches,
        qcPending,
        qcApproved,
        productionRunning,
      },
      recentBatches: batches.slice(0, 5),
      recentQC: qcRecords.slice(0, 5),
    },
  });
}
