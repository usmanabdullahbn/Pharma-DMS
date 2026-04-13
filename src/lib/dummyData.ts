// 🔬 PHARMA DMS - DUMMY DATA (LOCAL MOCK)
// This file provides mock data for development without Supabase

import { QCRecord, QCTestResult, FinishedGoods, GRN, Batch, AuditLog } from "@/types";

export const dummyUser = {
  id: "demo-user-123",
  email: "demo@pharma.local",
  full_name: "Demo User",
  role: "management" as const,
  is_active: true,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

// ═══════════ BATCHES ═══════════
export const batches: Batch[] = [
  {
    id: "batch-1",
    batch_no: "BTH-26-0001",
    product_name: "Paracetamol 500mg",
    batch_size: 1000,
    batch_size_unit: "kg",
    current_stage: "qc_inprocess" as const,
    grn_status: "done" as const,
    disp_status: "done" as const,
    bmr_status: "done" as const,
    qc_ip_status: "pending" as const,
    qc_fr_status: "pending" as const,
    prod_status: "pending" as const,
    fg_status: "pending" as const,
    release_status: "pending" as const,
    created_at: "2026-01-10T10:00:00Z",
    updated_at: "2026-01-15T11:00:00Z",
    created_by: "user-1",
  },
  {
    id: "batch-2",
    batch_no: "BTH-26-0002",
    product_name: "Ibuprofen 400mg",
    batch_size: 800,
    batch_size_unit: "kg",
    current_stage: "release" as const,
    grn_status: "done" as const,
    disp_status: "done" as const,
    bmr_status: "done" as const,
    qc_ip_status: "passed" as const,
    qc_fr_status: "passed" as const,
    prod_status: "done" as const,
    fg_status: "done" as const,
    release_status: "approved" as const,
    created_at: "2026-01-05T08:30:00Z",
    updated_at: "2026-01-20T15:00:00Z",
    created_by: "user-1",
  },
  {
    id: "batch-3",
    batch_no: "BTH-26-0003",
    product_name: "Aspirin 300mg",
    batch_size: 500,
    batch_size_unit: "kg",
    current_stage: "grn" as const,
    grn_status: "pending" as const,
    disp_status: "pending" as const,
    bmr_status: "pending" as const,
    qc_ip_status: "pending" as const,
    qc_fr_status: "pending" as const,
    prod_status: "pending" as const,
    fg_status: "pending" as const,
    release_status: "pending" as const,
    created_at: "2026-02-01T09:00:00Z",
    updated_at: "2026-02-01T09:00:00Z",
    created_by: "user-1",
  },
];

// ═══════════ BMR (BATCH MANUFACTURING RECORDS) ═══════════
export const bmrs = [
  {
    id: "bmr-1",
    bmr_no: "BMR-26-0001",
    batch_id: "batch-1",
    version: "v1.0",
    formula_ref: "FRM-2026-001",
    status: "approved",
    is_locked: false,
    created_by: "user-1",
    created_at: "2026-01-12T11:00:00Z",
    updated_at: "2026-01-15T14:30:00Z",
  },
  {
    id: "bmr-2",
    bmr_no: "BMR-26-0002",
    batch_id: "batch-2",
    version: "v1.0",
    formula_ref: "FRM-2026-002",
    status: "approved",
    is_locked: true,
    created_by: "user-1",
    created_at: "2026-01-08T09:15:00Z",
    updated_at: "2026-01-18T16:45:00Z",
  },
];

export const bmrSections = [
  {
    id: "bmrs-1-1",
    bmr_id: "bmr-1",
    section_no: "1",
    section_title: "Batch Identification & Traceability",
    content: "Batch BTH-26-0001 identified and traceable",
    is_completed: true,
    sort_order: 0,
  },
  {
    id: "bmrs-1-2",
    bmr_id: "bmr-1",
    section_no: "2",
    section_title: "Formula & Theoretical Composition",
    content: "Formula reference FRM-2026-001 applied",
    is_completed: true,
    sort_order: 1,
  },
];

// ═══════════ QC RECORDS ═══════════
export const qcRecords: QCRecord[] = [
  {
    id: "qc-1",
    qc_no: "QC-26-0001",
    batch_id: "batch-1",
    test_type: "in_process",
    test_date: "2026-01-13",
    analyst_name: "John Smith",
    analyst_id: "user-2",
    conclusion: "pass",
    status: "approved",
    submitted_by: "user-2",
    submitted_at: "2026-01-13T10:30:00Z",
    approved_by: "user-3",
    approved_at: "2026-01-14T09:00:00Z",
    is_locked: false,
    created_by: "user-2",
    created_at: "2026-01-13T10:30:00Z",
    updated_at: "2026-01-14T11:00:00Z",
  },
  {
    id: "qc-2",
    qc_no: "QC-26-0002",
    batch_id: "batch-2",
    test_type: "final_release",
    test_date: "2026-01-19",
    analyst_name: "Jane Doe",
    analyst_id: "user-2",
    conclusion: "pass",
    status: "approved",
    submitted_by: "user-2",
    submitted_at: "2026-01-19T14:00:00Z",
    approved_by: "user-3",
    approved_at: "2026-01-20T09:00:00Z",
    is_locked: true,
    created_by: "user-2",
    created_at: "2026-01-19T14:00:00Z",
    updated_at: "2026-01-20T15:00:00Z",
  },
];

// ═══════════ QC TEST RESULTS ═══════════
export const qcTestResults: QCTestResult[] = [
  {
    id: "qtr-1",
    qc_record_id: "qc-1",
    parameter: "Appearance",
    specification: "White to off-white powder",
    result: "White powder",
    verdict: "pass",
    sort_order: 0,
  },
  {
    id: "qtr-2",
    qc_record_id: "qc-1",
    parameter: "Assay",
    specification: "98-102%",
    result: "99.5%",
    verdict: "pass",
    sort_order: 1,
  },
];

// ═══════════ FINISHED GOODS ═══════════
export const finishedGoods: FinishedGoods[] = [
  {
    id: "fg-1",
    fg_no: "FG-26-0001",
    batch_id: "batch-2",
    date_entered: "2026-01-21",
    actual_qty: 4500,
    unit: "tablets",
    yield_pct: 95.2,
    pack_format: "2x15",
    total_units: 300,
    storage_location: "A1-B2-C3",
    status: "qc_approved",
    entered_by: "user-4",
    entered_by_name: "Production Lead",
    created_at: "2026-01-21T09:00:00Z",
  },
];

// ═══════════ RELEASE RECORDS ═══════════
export const releaseRecords = [
  {
    id: "rel-1",
    release_no: "REL-26-0001",
    batch_id: "batch-2",
    qc_record_id: "qc-2",
    release_type: "unconditional",
    release_date: "2026-01-22",
    conditions: null,
    issued_by: "user-3",
    issued_by_name: "QA Regulatory Head",
    drap_ref: "DRAP-2026-001",
    status: "issued",
    created_at: "2026-01-22T11:30:00Z",
  },
];

// ═══════════ STABILITY STUDIES ═══════════
export const stabilityStudies = [
  {
    id: "stab-1",
    study_no: "STAB-26-0001",
    batch_id: "batch-2",
    study_type: "long_term",
    start_date: "2026-01-22",
    protocol_ref: "STAB-PROT-001",
    conditions: ["25°C/60%RH"],
    planned_timepoints: [0, 3, 6, 9, 12, 18, 24],
    status: "ongoing",
    created_by: "user-2",
    created_at: "2026-01-22T13:00:00Z",
  },
];

export const stabilityParameters = [
  {
    id: "stap-1",
    study_id: "stab-1",
    parameter_name: "Assay",
    specification: "90-110%",
    sort_order: 0,
  },
];

export const stabilityResults = [
  {
    id: "star-1",
    study_id: "stab-1",
    timepoint: 0,
    result: "100.0%",
    status: "pass",
    created_at: "2026-01-22T14:00:00Z",
  },
];

// ═══════════ GRN (GOODS RECEIVED NOTES) ═══════════
export const grns: GRN[] = [
  {
    id: "grn-1",
    grn_no: "GRN-26-0001",
    batch_id: "batch-1",
    date_received: "2026-01-10",
    supplier_name: "ChemSource Ltd",
    status: "approved",
    submitted_by: "user-5",
    submitted_at: "2026-01-10T08:00:00Z",
    approved_by: "user-1",
    approved_at: "2026-01-11T09:00:00Z",
    is_locked: false,
    created_by: "user-5",
    created_at: "2026-01-10T08:00:00Z",
    updated_at: "2026-01-11T09:00:00Z",
  },
];

// ═══════════ DISPENSING ═══════════
export const dispensing = [
  {
    id: "disp-1",
    dispensing_no: "DISP-26-0001",
    batch_id: "batch-1",
    dispatch_date: "2026-01-11",
    dispatched_by: "user-5",
    dispatched_by_name: "Warehouse Manager",
    received_by: "user-6",
    received_by_name: "Production Lead",
    quantity: 5000,
    unit: "kg",
    status: "completed",
    location_from: "A1-B2-C1",
    location_to: "P1-M1-S1",
    created_at: "2026-01-11T10:00:00Z",
  },
];

// ═══════════ PRODUCTION ═══════════
export const production = [
  {
    id: "prod-1",
    production_no: "PROD-26-0001",
    batch_id: "batch-1",
    start_date: "2026-01-12",
    end_date: "2026-01-15",
    shift_lead: "user-6",
    shift_lead_name: "Production Lead",
    status: "completed",
    line_used: "Line A",
    notes: "Production completed successfully",
    created_at: "2026-01-12T06:00:00Z",
  },
];

// ═══════════ AUDIT LOG ═══════════
export const auditLog: AuditLog[] = [
  {
    id: "audit-1",
    user_id: "user-2",
    user_name: "John Smith",
    user_role: "qc_lab",
    action: "CREATE",
    entity_type: "qc_records",
    entity_id: "qc-1",
    entity_display: "QC-26-0001",
    old_values: null,
    new_values: { testType: "in_process", conclusion: "pass" },
    created_at: "2026-01-13T10:30:00Z",
  },
  {
    id: "audit-2",
    user_id: "user-3",
    user_name: "Jane Doe",
    user_role: "qa_regulatory",
    action: "APPROVE",
    entity_type: "qc_records",
    entity_id: "qc-1",
    entity_display: "QC-26-0001",
    old_values: { status: "submitted" },
    new_values: { status: "approved" },
    created_at: "2026-01-14T15:00:00Z",
  },
];

// ═══════════ GRN ITEMS (LINE ITEMS) ═══════════
export const grnItems = [
  {
    id: "grni-1",
    grn_id: "grn-1",
    item_no: 1,
    material_code: "RAW-001",
    material_name: "Paracetamol USP",
    specification: "PH.EUR",
    received_qty: 5000,
    unit: "kg",
    accepted_qty: 5000,
    rejected_qty: 0,
    batch_no: "RAW-BH-001",
    expiry_date: "2027-06-30",
    certificate_of_analysis: "COA-001",
    status: "accepted",
    sort_order: 0,
  },
];

// ═══════════ NOTIFICATIONS ═══════════
export const notifications = [
  {
    id: "notif-1",
    user_id: "user-1",
    title: "QC Report Pending Approval",
    message: "QC-26-0001 is awaiting your approval",
    type: "approval_needed",
    related_entity_type: "qc_records",
    related_entity_id: "qc-1",
    is_read: false,
    created_at: "2026-01-13T11:00:00Z",
  },
];
