-- ═══════════════════════════════════════════════════════════════
--  MAK PHARMA DMS — COMPLETE DATABASE SCHEMA
--  M.A. Kamil Farma (Pvt.) Ltd.
--  Run this entire file in: Supabase → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════

-- ─── EXTENSIONS ────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── USERS ─────────────────────────────────────────────────────
-- Note: Supabase Auth creates the auth.users record automatically.
-- This table extends it with role and profile data.
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT UNIQUE NOT NULL,
  full_name   TEXT NOT NULL,
  role        TEXT NOT NULL CHECK (role IN (
                'warehouse','qc_lab','production','qa_regulatory','management'
              )),
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger: keep updated_at fresh
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── BATCHES ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS batches (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_no         TEXT UNIQUE NOT NULL,
  product_id       UUID,
  product_name     TEXT NOT NULL,
  mfg_date         DATE,
  exp_date         DATE,
  batch_size       NUMERIC,
  batch_size_unit  TEXT NOT NULL DEFAULT 'L',
  current_stage    TEXT NOT NULL DEFAULT 'grn' CHECK (current_stage IN (
                     'grn','dispensing','bmr','qc_inprocess',
                     'production','finished_goods','qc_final','release','archived'
                   )),
  -- Denormalised status columns for fast pipeline display
  grn_status       TEXT NOT NULL DEFAULT 'pending',
  disp_status      TEXT NOT NULL DEFAULT 'pending',
  bmr_status       TEXT NOT NULL DEFAULT 'pending',
  qc_ip_status     TEXT NOT NULL DEFAULT 'pending',
  prod_status      TEXT NOT NULL DEFAULT 'pending',
  fg_status        TEXT NOT NULL DEFAULT 'pending',
  qc_fr_status     TEXT NOT NULL DEFAULT 'pending',
  release_status   TEXT NOT NULL DEFAULT 'pending',
  created_by       UUID REFERENCES users(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER batches_updated_at BEFORE UPDATE ON batches
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_batches_batch_no   ON batches(batch_no);
CREATE INDEX idx_batches_created    ON batches(created_at DESC);

-- ─── GRN ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS grns (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grn_no           TEXT UNIQUE NOT NULL,
  batch_id         UUID NOT NULL REFERENCES batches(id),
  date_received    DATE NOT NULL,
  supplier_name    TEXT NOT NULL,
  supplier_contact TEXT,
  invoice_no       TEXT,
  po_reference     TEXT,
  status           TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
                     'draft','submitted','approved','rejected'
                   )),
  submitted_by     UUID REFERENCES users(id),
  submitted_at     TIMESTAMPTZ,
  approved_by      UUID REFERENCES users(id),
  approved_at      TIMESTAMPTZ,
  approval_comment TEXT,
  is_locked        BOOLEAN NOT NULL DEFAULT FALSE,
  created_by       UUID REFERENCES users(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER grns_updated_at BEFORE UPDATE ON grns
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS grn_items (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grn_id           UUID NOT NULL REFERENCES grns(id) ON DELETE CASCADE,
  material_name    TEXT NOT NULL,
  quantity         NUMERIC NOT NULL,
  unit             TEXT NOT NULL,
  supplier_lot_no  TEXT,
  mfg_date         DATE,
  exp_date         DATE,
  coa_reference    TEXT,
  storage_condition TEXT,
  remarks          TEXT,
  sort_order       INT NOT NULL DEFAULT 0
);
CREATE INDEX idx_grn_items_grn ON grn_items(grn_id);

-- ─── DISPENSING ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dispensing_records (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  disp_no            TEXT UNIQUE NOT NULL,
  batch_id           UUID NOT NULL REFERENCES batches(id),
  grn_id             UUID REFERENCES grns(id),
  date_dispensed     DATE NOT NULL,
  dispensed_by       UUID REFERENCES users(id),
  dispensed_by_name  TEXT NOT NULL,
  checked_by_name    TEXT,
  status             TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
                       'draft','submitted','approved','rejected'
                     )),
  approved_by        UUID REFERENCES users(id),
  approved_at        TIMESTAMPTZ,
  approval_comment   TEXT,
  is_locked          BOOLEAN NOT NULL DEFAULT FALSE,
  created_by         UUID REFERENCES users(id),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER disp_updated_at BEFORE UPDATE ON dispensing_records
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS dispensing_items (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dispensing_id            UUID NOT NULL REFERENCES dispensing_records(id) ON DELETE CASCADE,
  material_name            TEXT NOT NULL,
  required_qty             NUMERIC NOT NULL,
  dispensed_qty            NUMERIC NOT NULL,
  unit                     TEXT NOT NULL,
  deviation                NUMERIC GENERATED ALWAYS AS (dispensed_qty - required_qty) STORED,
  deviation_pct            NUMERIC GENERATED ALWAYS AS (
                             CASE WHEN required_qty = 0 THEN NULL
                             ELSE ROUND(((dispensed_qty - required_qty) / required_qty * 100)::NUMERIC, 4)
                             END
                           ) STORED,
  deviation_acceptable     BOOLEAN NOT NULL DEFAULT TRUE,
  deviation_justification  TEXT,
  sort_order               INT NOT NULL DEFAULT 0
);
CREATE INDEX idx_disp_items ON dispensing_items(dispensing_id);

-- ─── BMR ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bmrs (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bmr_no           TEXT UNIQUE NOT NULL,
  batch_id         UUID NOT NULL REFERENCES batches(id),
  version          TEXT NOT NULL DEFAULT 'v1.0',
  formula_ref      TEXT,
  parent_bmr_id    UUID REFERENCES bmrs(id),
  status           TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
                     'draft','under_review','approved','rejected','superseded'
                   )),
  approved_by      TEXT,
  approved_at      TIMESTAMPTZ,
  rejected_by      UUID REFERENCES users(id),
  rejected_at      TIMESTAMPTZ,
  approval_comment TEXT,
  is_locked        BOOLEAN NOT NULL DEFAULT FALSE,
  created_by       UUID REFERENCES users(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER bmrs_updated_at BEFORE UPDATE ON bmrs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS bmr_sections (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bmr_id         UUID NOT NULL REFERENCES bmrs(id) ON DELETE CASCADE,
  section_no     TEXT NOT NULL,
  section_title  TEXT NOT NULL,
  is_completed   BOOLEAN NOT NULL DEFAULT FALSE,
  completed_by   UUID REFERENCES users(id),
  completed_at   TIMESTAMPTZ,
  operator_sign  TEXT,
  remarks        TEXT,
  sort_order     INT NOT NULL DEFAULT 0
);
CREATE INDEX idx_bmr_sections ON bmr_sections(bmr_id);

-- ─── QC RECORDS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS qc_records (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  qc_no            TEXT UNIQUE NOT NULL,
  batch_id         UUID NOT NULL REFERENCES batches(id),
  test_type        TEXT NOT NULL CHECK (test_type IN (
                     'raw_material','in_process','final_release',
                     'stability','environmental','water'
                   )),
  test_date        DATE NOT NULL,
  analyst_name     TEXT NOT NULL,
  analyst_id       UUID REFERENCES users(id),
  supervisor_name  TEXT,
  supervisor_id    UUID REFERENCES users(id),
  conclusion       TEXT NOT NULL DEFAULT 'pending' CHECK (conclusion IN ('pass','fail','pending')),
  status           TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
                     'draft','submitted','approved','rejected'
                   )),
  approved_by      UUID REFERENCES users(id),
  approved_at      TIMESTAMPTZ,
  approval_comment TEXT,
  is_locked        BOOLEAN NOT NULL DEFAULT FALSE,
  created_by       UUID REFERENCES users(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER qc_updated_at BEFORE UPDATE ON qc_records
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS qc_test_results (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  qc_record_id   UUID NOT NULL REFERENCES qc_records(id) ON DELETE CASCADE,
  parameter      TEXT NOT NULL,
  specification  TEXT NOT NULL,
  result         TEXT,
  unit           TEXT,
  verdict        TEXT NOT NULL DEFAULT 'pending' CHECK (verdict IN ('pass','fail','pending','na')),
  method_ref     TEXT,
  remarks        TEXT,
  sort_order     INT NOT NULL DEFAULT 0
);
CREATE INDEX idx_qc_results ON qc_test_results(qc_record_id);

-- ─── PRODUCTION ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS production_records (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prod_no        TEXT UNIQUE NOT NULL,
  batch_id       UUID NOT NULL REFERENCES batches(id),
  bmr_id         UUID REFERENCES bmrs(id),
  start_datetime TIMESTAMPTZ,
  end_datetime   TIMESTAMPTZ,
  room_no        TEXT,
  equipment_ids  TEXT[],
  status         TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
                   'pending','in_progress','completed','rejected'
                 )),
  completed_by   UUID REFERENCES users(id),
  completed_at   TIMESTAMPTZ,
  created_by     UUID REFERENCES users(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS production_steps (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  production_id  UUID NOT NULL REFERENCES production_records(id) ON DELETE CASCADE,
  step_no        INT NOT NULL,
  description    TEXT NOT NULL,
  is_completed   BOOLEAN NOT NULL DEFAULT FALSE,
  completed_by   UUID REFERENCES users(id),
  completed_at   TIMESTAMPTZ,
  actual_value   TEXT,
  remarks        TEXT
);

-- ─── FINISHED GOODS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS finished_goods (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fg_no            TEXT UNIQUE NOT NULL,
  batch_id         UUID NOT NULL REFERENCES batches(id),
  date_entered     DATE NOT NULL,
  actual_qty       NUMERIC,
  unit             TEXT,
  yield_pct        NUMERIC,
  pack_format      TEXT,
  total_units      INT,
  storage_location TEXT,
  status           TEXT NOT NULL DEFAULT 'qc_pending' CHECK (status IN (
                     'qc_pending','qc_approved','released','quarantine','rejected','destroyed'
                   )),
  entered_by       UUID REFERENCES users(id),
  entered_by_name  TEXT NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── STABILITY STUDIES ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stability_studies (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  study_no           TEXT UNIQUE NOT NULL,
  batch_id           UUID NOT NULL REFERENCES batches(id),
  study_type         TEXT NOT NULL DEFAULT 'long_term' CHECK (study_type IN (
                       'long_term','accelerated','intermediate','on_going','follow_up'
                     )),
  start_date         DATE NOT NULL,
  protocol_ref       TEXT,
  conditions         TEXT[] NOT NULL DEFAULT '{}',
  planned_timepoints INT[] NOT NULL DEFAULT '{0,3,6,9,12,18,24}',
  status             TEXT NOT NULL DEFAULT 'ongoing' CHECK (status IN (
                       'ongoing','completed','failed','discontinued'
                     )),
  created_by         UUID REFERENCES users(id),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER stab_updated_at BEFORE UPDATE ON stability_studies
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS stability_parameters (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  study_id     UUID NOT NULL REFERENCES stability_studies(id) ON DELETE CASCADE,
  parameter    TEXT NOT NULL,
  specification TEXT NOT NULL,
  unit         TEXT,
  method_ref   TEXT,
  sort_order   INT NOT NULL DEFAULT 0
);
CREATE INDEX idx_stab_params ON stability_parameters(study_id);

CREATE TABLE IF NOT EXISTS stability_results (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  study_id         UUID NOT NULL REFERENCES stability_studies(id),
  parameter_id     UUID NOT NULL REFERENCES stability_parameters(id),
  timepoint_months INT NOT NULL,
  condition        TEXT NOT NULL,
  result           TEXT,
  verdict          TEXT NOT NULL DEFAULT 'pending' CHECK (verdict IN ('pass','fail','pending')),
  test_date        DATE,
  analyst_id       UUID REFERENCES users(id),
  remarks          TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (study_id, parameter_id, timepoint_months, condition)
);

-- ─── RELEASE RECORDS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS release_records (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  release_no     TEXT UNIQUE NOT NULL,
  batch_id       UUID NOT NULL REFERENCES batches(id),
  qc_record_id   UUID REFERENCES qc_records(id),
  release_type   TEXT NOT NULL CHECK (release_type IN (
                   'unconditional','conditional','quarantine_release','reject'
                 )),
  release_date   DATE NOT NULL,
  conditions     TEXT,
  issued_by      UUID REFERENCES users(id),
  issued_by_name TEXT NOT NULL,
  drap_ref       TEXT,
  status         TEXT NOT NULL DEFAULT 'issued' CHECK (status IN ('draft','issued','revoked')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── DEVIATIONS / CAPA ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS deviations (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deviation_no     TEXT UNIQUE NOT NULL,
  batch_id         UUID REFERENCES batches(id),
  source_module    TEXT,
  source_record_id UUID,
  title            TEXT NOT NULL,
  description      TEXT NOT NULL,
  severity         TEXT CHECK (severity IN ('critical','major','minor')),
  root_cause       TEXT,
  capa_action      TEXT,
  capa_due_date    DATE,
  capa_completed   BOOLEAN NOT NULL DEFAULT FALSE,
  status           TEXT NOT NULL DEFAULT 'open' CHECK (status IN (
                     'open','under_review','capa_in_progress','closed','rejected'
                   )),
  raised_by        UUID REFERENCES users(id),
  assigned_to      UUID REFERENCES users(id),
  closed_by        UUID REFERENCES users(id),
  closed_at        TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER deviations_updated_at BEFORE UPDATE ON deviations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── ATTACHMENTS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attachments (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type         TEXT NOT NULL,
  entity_id           UUID NOT NULL,
  drive_file_id       TEXT NOT NULL UNIQUE,
  drive_view_url      TEXT,
  drive_download_url  TEXT,
  drive_folder_id     TEXT,
  file_name           TEXT NOT NULL,
  file_type           TEXT,
  mime_type           TEXT,
  file_size_bytes     BIGINT,
  version             INT NOT NULL DEFAULT 1,
  is_latest           BOOLEAN NOT NULL DEFAULT TRUE,
  previous_version_id UUID REFERENCES attachments(id),
  uploaded_by         UUID REFERENCES users(id),
  uploaded_by_name    TEXT,
  uploaded_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  description         TEXT
);
CREATE INDEX idx_attachments_entity ON attachments(entity_type, entity_id);
CREATE INDEX idx_attachments_latest ON attachments(entity_type, entity_id, is_latest);

-- ─── AUDIT LOG (IMMUTABLE) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID REFERENCES users(id),
  user_name      TEXT NOT NULL,
  user_role      TEXT NOT NULL,
  action         TEXT NOT NULL,
  entity_type    TEXT NOT NULL,
  entity_id      UUID NOT NULL,
  entity_display TEXT,
  old_values     JSONB,
  new_values     JSONB,
  ip_address     INET,
  user_agent     TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Prevent modification of audit records
CREATE RULE no_update_audit AS ON UPDATE TO audit_log DO INSTEAD NOTHING;
CREATE RULE no_delete_audit AS ON DELETE TO audit_log DO INSTEAD NOTHING;
CREATE INDEX idx_audit_entity  ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_user    ON audit_log(user_id);
CREATE INDEX idx_audit_created ON audit_log(created_at DESC);

-- ─── APPROVAL HISTORY ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS approval_history (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type    TEXT NOT NULL,
  entity_id      UUID NOT NULL,
  action         TEXT NOT NULL CHECK (action IN ('submitted','approved','rejected','revoked')),
  action_by      UUID REFERENCES users(id),
  action_by_name TEXT,
  action_by_role TEXT,
  comment        TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_approval_entity ON approval_history(entity_type, entity_id);

-- ═══════════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches            ENABLE ROW LEVEL SECURITY;
ALTER TABLE grns               ENABLE ROW LEVEL SECURITY;
ALTER TABLE grn_items          ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispensing_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispensing_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE bmrs               ENABLE ROW LEVEL SECURITY;
ALTER TABLE bmr_sections       ENABLE ROW LEVEL SECURITY;
ALTER TABLE qc_records         ENABLE ROW LEVEL SECURITY;
ALTER TABLE qc_test_results    ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_steps   ENABLE ROW LEVEL SECURITY;
ALTER TABLE finished_goods     ENABLE ROW LEVEL SECURITY;
ALTER TABLE stability_studies  ENABLE ROW LEVEL SECURITY;
ALTER TABLE stability_parameters ENABLE ROW LEVEL SECURITY;
ALTER TABLE stability_results  ENABLE ROW LEVEL SECURITY;
ALTER TABLE release_records    ENABLE ROW LEVEL SECURITY;
ALTER TABLE deviations         ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log          ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_history   ENABLE ROW LEVEL SECURITY;

-- Helper: get current user role
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- All authenticated users can read batches
CREATE POLICY "all_read_batches" ON batches FOR SELECT USING (auth.uid() IS NOT NULL);

-- All authenticated users can read audit log
CREATE POLICY "all_read_audit" ON audit_log FOR SELECT USING (auth.uid() IS NOT NULL);

-- All authenticated users can read their own user record
CREATE POLICY "own_user_read" ON users FOR SELECT USING (auth.uid() = id);

-- QA and Management can read all users
CREATE POLICY "qa_read_users" ON users FOR SELECT USING (current_user_role() IN ('qa_regulatory','management'));

-- Generic: authenticated users can read all operational records
CREATE POLICY "auth_read_grns"      ON grns              FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_read_grn_items" ON grn_items         FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_read_disp"      ON dispensing_records FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_read_disp_items"ON dispensing_items   FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_read_bmrs"      ON bmrs              FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_read_bmr_sec"   ON bmr_sections      FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_read_qc"        ON qc_records        FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_read_qc_res"    ON qc_test_results   FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_read_prod"      ON production_records FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_read_prod_steps"ON production_steps  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_read_fg"        ON finished_goods    FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_read_stab"      ON stability_studies FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_read_stab_par"  ON stability_parameters FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_read_stab_res"  ON stability_results FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_read_rel"       ON release_records   FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_read_dev"       ON deviations        FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_read_att"       ON attachments       FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_read_apphist"   ON approval_history  FOR SELECT USING (auth.uid() IS NOT NULL);

-- ═══════════════════════════════════════════════════════════════
--  INITIAL DATA: Create your first admin user after signing up
-- ═══════════════════════════════════════════════════════════════
-- After creating the first user via Supabase Auth dashboard or signup,
-- run this (replace the UUID and email with the actual values from auth.users):
--
-- INSERT INTO users (id, email, full_name, role) VALUES
--   ('00000000-0000-0000-0000-000000000000', 'qa@makamilfarma.com', 'QA Officer', 'qa_regulatory');
--
-- Then add more users:
-- INSERT INTO users (id, email, full_name, role) VALUES
--   ('...', 'warehouse@makamilfarma.com', 'Store Keeper', 'warehouse'),
--   ('...', 'qc@makamilfarma.com', 'QC Analyst', 'qc_lab'),
--   ('...', 'production@makamilfarma.com', 'Production Supervisor', 'production'),
--   ('...', 'director@makamilfarma.com', 'Director', 'management');
