// ─────────────────────────────────────────────────────────────
//  PHARMA DMS — MASTER TYPE DEFINITIONS
//  M.A. Kamil Farma (Pvt.) Ltd.
// ─────────────────────────────────────────────────────────────

// ═══════════ USERS & AUTH ═══════════
export type UserRole =
  | "warehouse"
  | "qc_lab"
  | "production"
  | "qa_regulatory"
  | "management";

export interface AppUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  warehouse: "Warehouse / Stores",
  qc_lab: "QC Laboratory",
  production: "Production",
  qa_regulatory: "QA / Regulatory",
  management: "Management",
};

export const CAN_APPROVE: UserRole[] = ["qa_regulatory", "management"];

export const MODULE_ACCESS: Record<UserRole, string[]> = {
  warehouse:      ["dashboard", "grn", "dispensing"],
  qc_lab:         ["dashboard", "qc", "finished-goods", "stability", "release"],
  production:     ["dashboard", "dispensing", "bmr", "production", "finished-goods"],
  qa_regulatory:  ["dashboard", "grn", "dispensing", "qc", "bmr", "production", "finished-goods", "stability", "release", "audit"],
  management:     ["dashboard", "grn", "dispensing", "qc", "bmr", "production", "finished-goods", "stability", "release", "audit"],
};

// ═══════════ BATCH ═══════════
export type BatchStageStatus = "pending" | "in_progress" | "done" | "passed" | "failed" | "approved" | "draft";
export type BatchCurrentStage =
  | "grn" | "dispensing" | "bmr" | "qc_inprocess"
  | "production" | "finished_goods" | "qc_final" | "release" | "archived";

export interface Batch {
  id: string;
  batch_no: string;
  product_id?: string;
  product_name: string;
  mfg_date?: string;
  exp_date?: string;
  batch_size?: number;
  batch_size_unit: string;
  current_stage: BatchCurrentStage;
  grn_status: BatchStageStatus;
  disp_status: BatchStageStatus;
  bmr_status: BatchStageStatus;
  qc_ip_status: BatchStageStatus;
  prod_status: BatchStageStatus;
  fg_status: BatchStageStatus;
  qc_fr_status: BatchStageStatus;
  release_status: BatchStageStatus;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// ═══════════ GRN ═══════════
export type ApprovalStatus = "draft" | "submitted" | "approved" | "rejected";

export interface GRNItem {
  id: string;
  grn_id: string;
  material_name: string;
  quantity: number;
  unit: string;
  supplier_lot_no?: string;
  mfg_date?: string;
  exp_date?: string;
  coa_reference?: string;
  storage_condition?: string;
  remarks?: string;
  sort_order: number;
}

export interface GRN {
  id: string;
  grn_no: string;
  batch_id: string;
  date_received: string;
  supplier_name: string;
  supplier_contact?: string;
  invoice_no?: string;
  po_reference?: string;
  status: ApprovalStatus;
  submitted_by?: string;
  submitted_at?: string;
  approved_by?: string;
  approved_at?: string;
  approval_comment?: string;
  is_locked: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Joined
  items?: GRNItem[];
  batch?: Batch;
  approver?: AppUser;
}

// ═══════════ DISPENSING ═══════════
export interface DispensingItem {
  id: string;
  dispensing_id: string;
  material_name: string;
  required_qty: number;
  dispensed_qty: number;
  unit: string;
  deviation?: number;
  deviation_pct?: number;
  deviation_acceptable?: boolean;
  deviation_justification?: string;
  sort_order: number;
}

export interface DispensingRecord {
  id: string;
  disp_no: string;
  batch_id: string;
  grn_id?: string;
  date_dispensed: string;
  dispensed_by?: string;
  dispensed_by_name: string;
  checked_by_name?: string;
  status: ApprovalStatus;
  approved_by?: string;
  approved_at?: string;
  approval_comment?: string;
  is_locked: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Joined
  items?: DispensingItem[];
  batch?: Batch;
}

// ═══════════ BMR ═══════════
export type BMRStatus = "draft" | "under_review" | "approved" | "rejected" | "superseded";

export interface BMRSection {
  id: string;
  bmr_id: string;
  section_no: string;
  section_title: string;
  is_completed: boolean;
  completed_by?: string;
  completed_at?: string;
  operator_sign?: string;
  remarks?: string;
  sort_order: number;
}

export interface BMR {
  id: string;
  bmr_no: string;
  batch_id: string;
  version: string;
  formula_ref?: string;
  parent_bmr_id?: string;
  status: BMRStatus;
  approved_by?: string;
  approved_at?: string;
  rejected_by?: string;
  rejected_at?: string;
  approval_comment?: string;
  is_locked: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Joined
  sections?: BMRSection[];
  batch?: Batch;
  approver?: AppUser;
}

// ═══════════ QC ═══════════
export type QCTestType = "raw_material" | "in_process" | "final_release" | "stability" | "environmental" | "water";
export type QCVerdict = "pass" | "fail" | "pending" | "na";

export interface QCTestResult {
  id: string;
  qc_record_id: string;
  parameter: string;
  specification: string;
  result?: string;
  unit?: string;
  verdict: QCVerdict;
  method_ref?: string;
  remarks?: string;
  sort_order: number;
}

export interface QCRecord {
  id: string;
  qc_no: string;
  batch_id: string;
  test_type: QCTestType;
  test_date: string;
  analyst_name: string;
  analyst_id?: string;
  supervisor_name?: string;
  supervisor_id?: string;
  conclusion: QCVerdict;
  status: ApprovalStatus;
  approved_by?: string;
  approved_at?: string;
  approval_comment?: string;
  is_locked: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Joined
  test_results?: QCTestResult[];
  batch?: Batch;
}

// ═══════════ PRODUCTION ═══════════
export type ProductionStatus = "pending" | "in_progress" | "completed" | "rejected";

export interface ProductionStep {
  id: string;
  production_id: string;
  step_no: number;
  description: string;
  is_completed: boolean;
  completed_by?: string;
  completed_at?: string;
  actual_value?: string;
  remarks?: string;
}

export interface ProductionRecord {
  id: string;
  prod_no: string;
  batch_id: string;
  bmr_id?: string;
  start_datetime?: string;
  end_datetime?: string;
  room_no?: string;
  equipment_ids?: string[];
  status: ProductionStatus;
  completed_by?: string;
  completed_at?: string;
  created_by?: string;
  created_at: string;
  // Joined
  steps?: ProductionStep[];
  batch?: Batch;
}

// ═══════════ FINISHED GOODS ═══════════
export type FGStatus = "qc_pending" | "qc_approved" | "released" | "quarantine" | "rejected" | "destroyed";

export interface FinishedGoods {
  id: string;
  fg_no: string;
  batch_id: string;
  date_entered: string;
  actual_qty?: number;
  unit?: string;
  yield_pct?: number;
  pack_format?: string;
  total_units?: number;
  storage_location?: string;
  status: FGStatus;
  entered_by?: string;
  entered_by_name: string;
  created_at: string;
  // Joined
  batch?: Batch;
}

// ═══════════ STABILITY ═══════════
export type StabilityStudyType = "long_term" | "accelerated" | "intermediate" | "on_going" | "follow_up";
export type StabilityStatus = "ongoing" | "completed" | "failed" | "discontinued";

export interface StabilityParameter {
  id: string;
  study_id: string;
  parameter: string;
  specification: string;
  unit?: string;
  method_ref?: string;
  sort_order: number;
}

export interface StabilityResult {
  id: string;
  study_id: string;
  parameter_id: string;
  timepoint_months: number;
  condition: string;
  result?: string;
  verdict: QCVerdict;
  test_date?: string;
  analyst_id?: string;
  remarks?: string;
  created_at: string;
}

export interface StabilityStudy {
  id: string;
  study_no: string;
  batch_id: string;
  study_type: StabilityStudyType;
  start_date: string;
  protocol_ref?: string;
  conditions: string[];
  planned_timepoints: number[];
  status: StabilityStatus;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Joined
  parameters?: StabilityParameter[];
  results?: StabilityResult[];
  batch?: Batch;
}

// ═══════════ RELEASE ═══════════
export type ReleaseType = "unconditional" | "conditional" | "quarantine_release" | "reject";
export type ReleaseStatus = "draft" | "issued" | "revoked";

export interface ReleaseRecord {
  id: string;
  release_no: string;
  batch_id: string;
  qc_record_id?: string;
  release_type: ReleaseType;
  release_date: string;
  conditions?: string;
  issued_by?: string;
  issued_by_name: string;
  drap_ref?: string;
  status: ReleaseStatus;
  created_at: string;
  // Joined
  batch?: Batch;
  qc_record?: QCRecord;
}

// ═══════════ DEVIATIONS ═══════════
export type DeviationSeverity = "critical" | "major" | "minor";
export type DeviationStatus = "open" | "under_review" | "capa_in_progress" | "closed" | "rejected";

export interface Deviation {
  id: string;
  deviation_no: string;
  batch_id?: string;
  source_module?: string;
  source_record_id?: string;
  title: string;
  description: string;
  severity: DeviationSeverity;
  root_cause?: string;
  capa_action?: string;
  capa_due_date?: string;
  capa_completed: boolean;
  status: DeviationStatus;
  raised_by?: string;
  assigned_to?: string;
  closed_by?: string;
  closed_at?: string;
  created_at: string;
  updated_at: string;
}

// ═══════════ ATTACHMENTS ═══════════
export interface Attachment {
  id: string;
  entity_type: string;
  entity_id: string;
  drive_file_id: string;
  drive_view_url?: string;
  drive_download_url?: string;
  drive_folder_id?: string;
  file_name: string;
  file_type?: string;
  mime_type?: string;
  file_size_bytes?: number;
  version: number;
  is_latest: boolean;
  previous_version_id?: string;
  uploaded_by?: string;
  uploaded_by_name?: string;
  uploaded_at: string;
  description?: string;
}

// ═══════════ AUDIT ═══════════
export type AuditAction = "CREATE" | "UPDATE" | "APPROVE" | "REJECT" | "LOCK" | "UPLOAD" | "DELETE" | "LOGIN" | "VERSION_CREATE";

export interface AuditLog {
  id: string;
  user_id?: string;
  user_name: string;
  user_role: string;
  action: AuditAction;
  entity_type: string;
  entity_id: string;
  entity_display?: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface ApprovalHistory {
  id: string;
  entity_type: string;
  entity_id: string;
  action: "submitted" | "approved" | "rejected" | "revoked";
  action_by?: string;
  action_by_name?: string;
  action_by_role?: string;
  comment?: string;
  created_at: string;
}

// ═══════════ API RESPONSES ═══════════
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
}

// ═══════════ NOTIFICATIONS ═══════════
export interface Notification {
  id: string;
  type: "grn" | "dispensing" | "bmr" | "qc" | "release" | "deviation";
  title: string;
  subtitle: string;
  entity_id: string;
  entity_no: string;
  created_at: string;
}

// ═══════════ DASHBOARD ═══════════
export interface DashboardStats {
  total_batches: number;
  released: number;
  in_production: number;
  awaiting_release: number;
  pending_approvals: number;
  open_deviations: number;
}
